// Coordinate validation rules — run BEFORE mapping (Meeting 3, "Five coordinate errors").
// Pure functions: input is a GeoJSON FeatureCollection of Points in EPSG:4326 [lon, lat].

/**
 * Check one [lon, lat] pair. Returns a list of problem codes (empty = valid).
 * bbox: [minLon, minLat, maxLon, maxLat] of the study area.
 */
export function checkCoordinate(coords, bbox) {
  if (!Array.isArray(coords) || coords.length < 2 || coords.some((v) => v == null || !Number.isFinite(v))) {
    return ["missing"];
  }
  const [lon, lat] = coords;
  if (lon === 0 && lat === 0) return ["null-island"];
  // Values in the hundreds of thousands are metres (e.g. UTM 48S), not degrees: CRS not declared.
  if (Math.abs(lon) > 1000 || Math.abs(lat) > 1000) return ["metres-not-degrees"];
  const problems = [];
  if (Math.abs(lon) > 180 || Math.abs(lat) > 90) {
    // Latitude can never exceed 90, so [lat, lon] order shows up here (e.g. "lat" = 106.8).
    problems.push(Math.abs(lat) > 90 && Math.abs(lon) <= 90 ? "swapped-order" : "out-of-range");
    return problems;
  }
  if (bbox) {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    if (lon < minLon || lon > maxLon || lat < minLat || lat > maxLat) {
      // A lost minus sign (−6.2 → +6.2) lands ~1 370 km north of Jakarta.
      const flipped = lat > maxLat && -lat >= minLat && -lat <= maxLat;
      problems.push(flipped ? "sign-flip" : "outside-study-area");
    }
  }
  return problems;
}

/**
 * Validate a FeatureCollection. Returns { valid, invalid, duplicates } where
 * invalid = [{ id, problems }] and duplicates = [{ key, ids }] (many records on one point
 * usually means geocoding to a project or area centroid).
 */
export function validateCollection(fc, bbox) {
  const valid = [];
  const invalid = [];
  const byPosition = new Map();
  for (const f of fc.features ?? []) {
    const id = f.properties?.id ?? null;
    if (f.geometry?.type !== "Point") {
      invalid.push({ id, problems: [f.geometry == null ? "missing" : "not-a-point"] });
      continue;
    }
    const problems = checkCoordinate(f.geometry.coordinates, bbox);
    if (problems.length) {
      invalid.push({ id, problems });
      continue;
    }
    valid.push(f);
    const key = f.geometry.coordinates.map((v) => v.toFixed(6)).join(",");
    byPosition.set(key, [...(byPosition.get(key) ?? []), id]);
  }
  const duplicates = [...byPosition].filter(([, ids]) => ids.length > 1).map(([key, ids]) => ({ key, ids }));
  return { valid, invalid, duplicates };
}

/** Approximate ground precision in metres of a coordinate with `decimals` decimal places of a degree. */
export function precisionMetres(decimals) {
  return 111_320 / 10 ** decimals;
}
