// Dataset inspection — stage 1 of the demo: report, do not change.
// Pure function over a GeoJSON FeatureCollection; used by scripts/inspect-data.js and tests/.

const typeOf = (v) => (v == null ? "null" : Array.isArray(v) ? "array" : typeof v);

/**
 * Returns { features, geometryTypes, crs, fields: { name: { types, nulls } }, lonRange, latRange, dateRange }.
 * dateRange uses any field ending in "_date" (ISO 8601 strings compare correctly as text).
 */
export function inspectCollection(fc) {
  const features = fc.features ?? [];
  const fields = {};
  const geometryTypes = new Set();
  const lons = [];
  const lats = [];
  const dates = [];
  for (const f of features) {
    geometryTypes.add(f.geometry?.type ?? "missing");
    const c = f.geometry?.coordinates;
    if (f.geometry?.type === "Point" && Array.isArray(c)) {
      lons.push(c[0]);
      lats.push(c[1]);
    }
    for (const [k, v] of Object.entries(f.properties ?? {})) {
      fields[k] ??= { types: new Set(), nulls: 0 };
      fields[k].types.add(typeOf(v));
      if (v == null) fields[k].nulls += 1;
      if (k.endsWith("_date") && v != null) dates.push(v);
    }
  }
  const range = (xs) => (xs.length ? [Math.min(...xs), Math.max(...xs)] : null);
  dates.sort();
  return {
    features: features.length,
    geometryTypes: [...geometryTypes],
    // RFC 7946 GeoJSON is always EPSG:4326; a declared value is reported so a mismatch is visible.
    crs: fc.metadata?.crs ?? fc.crs?.properties?.name ?? "EPSG:4326 (GeoJSON default, not declared)",
    fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, { types: [...v.types], nulls: v.nulls }])),
    lonRange: range(lons),
    latRange: range(lats),
    dateRange: dates.length ? [dates[0], dates[dates.length - 1]] : null,
  };
}

/** "22 of 25 priced" — the n behind every statistic. */
export function completeness(values) {
  const present = values.filter((v) => v != null).length;
  return { present, total: values.length, share: values.length ? present / values.length : null };
}

/** Mean that excludes nulls and reports n. Returns { mean|null, n }. */
export function meanIgnoringNull(values) {
  const valid = values.filter((v) => v != null && Number.isFinite(v));
  return { mean: valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null, n: valid.length };
}
