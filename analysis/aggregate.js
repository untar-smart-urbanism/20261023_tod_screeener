// Aggregation — "How many per area?" (Meeting 3, seven operations). Pure functions, tested in tests/.
// Always report n next to a statistic; nulls are excluded and counted, never treated as 0.

/** Median of the non-null values. Returns { median|null, n }. */
export function median(values) {
  const v = values.filter((x) => x != null && Number.isFinite(x)).sort((a, b) => a - b);
  if (v.length === 0) return { median: null, n: 0 };
  const mid = Math.floor(v.length / 2);
  return { median: v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2, n: v.length };
}

/**
 * Count distances into bands. edges [0, 200, 400, 600, 800] → 0–200, 200–400, 400–600, 600–800, > 800.
 * A distance equal to an edge goes to the band that starts there, except the last edge (≤ 800 is inside).
 */
export function distanceHistogram(distancesM, edges = [0, 200, 400, 600, 800]) {
  const last = edges[edges.length - 1];
  const bands = edges.slice(0, -1).map((from, i) => ({ from, to: edges[i + 1], label: `${from}–${edges[i + 1]} m`, count: 0 }));
  const beyond = { from: last, to: Infinity, label: `> ${last} m`, count: 0 };
  for (const d of distancesM) {
    if (d == null || !Number.isFinite(d)) continue;
    if (d > last) beyond.count += 1;
    else (bands.find((b) => d < b.to) ?? bands[bands.length - 1]).count += 1;
  }
  return [...bands, beyond];
}

/**
 * Summary per nearest station: sites within the radius, how many are priced,
 * and the median ASKING price per m² with its n.
 * rows: [{ nearestStationId, nearestStation, stationDistanceM, pricePerM2|null }]
 */
export function summariseByStation(rows, stations, radiusM) {
  return stations.map((s) => {
    const inside = rows.filter((r) => r.nearestStationId === s.id && r.stationDistanceM <= radiusM);
    const m = median(inside.map((r) => r.pricePerM2));
    return { id: s.id, name: s.name, within: inside.length, priced: m.n, medianAskingPerM2: m.median };
  });
}
