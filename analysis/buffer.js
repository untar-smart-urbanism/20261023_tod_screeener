// Distance and buffer helpers. Pure functions: no UI and no data loading, so tests/ can check them.
// Inputs are WGS84 longitude/latitude (EPSG:4326); outputs are in METRES, not degrees.
// Method: Haversine on a sphere (R = mean Earth radius). Agrees with a WGS 84 geodesic within ~0.5%
// at Jakarta's latitude — see the hand checks in docs/PROMPT_AND_METHOD_LOG.md.

const EARTH_RADIUS_M = 6371008.8;

/** Great-circle distance in metres between two [lon, lat] positions. */
export function distanceMetres([lon1, lat1], [lon2, lat2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

/** Distance in metres from a point to the nearest of several points (Infinity if none). */
export function nearestDistanceMetres(point, others) {
  return others.reduce((best, o) => Math.min(best, distanceMetres(point, o)), Infinity);
}

/**
 * Nearest station to a point.
 * stations: [{ id, name, coordinates: [lon, lat] }]. Returns { id, name, distanceM } or null if none.
 */
export function nearestStation(point, stations) {
  let best = null;
  for (const s of stations) {
    const d = distanceMetres(point, s.coordinates);
    if (best == null || d < best.distanceM) best = { id: s.id, name: s.name, distanceM: d };
  }
  return best;
}

/** True if the point lies within `radiusM` metres (straight line) of any target. */
export function withinBuffer(point, targets, radiusM) {
  return nearestDistanceMetres(point, targets) <= radiusM;
}

/**
 * True when a distance is within `toleranceM` of the threshold. Such results depend on the
 * distance method (Haversine vs geodesic vs network), so show "near boundary", not a hard in/out.
 */
export function nearBoundary(distanceM, radiusM, toleranceM = 10) {
  return Math.abs(distanceM - radiusM) <= toleranceM;
}
