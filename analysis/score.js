// Scoring helpers for the TOD screener. Pure functions, tested in tests/.
// Placeholder logic for Meeting 2; criteria and weights are refined in Meeting 3.

/** Asking price per m². Returns null (not 0) when either value is missing or invalid. */
export function pricePerM2(askingPrice, floorAreaM2) {
  if (askingPrice == null || floorAreaM2 == null || floorAreaM2 <= 0) return null;
  return askingPrice / floorAreaM2;
}

/** Min–max normalise to 0–1. Missing values stay null. If all values are equal, returns 0.5 for each. */
export function normalise(values) {
  const valid = values.filter((v) => v != null && Number.isFinite(v));
  if (valid.length === 0) return values.map(() => null);
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  return values.map((v) => {
    if (v == null || !Number.isFinite(v)) return null;
    return max === min ? 0.5 : (v - min) / (max - min);
  });
}

/**
 * Weighted score from normalised criteria (each 0–1).
 * criteria: { name: value|null }, weights: { name: number }.
 * Returns null if any weighted criterion is missing, so gaps are shown rather than hidden.
 */
export function weightedScore(criteria, weights) {
  let total = 0;
  let weightSum = 0;
  for (const [name, w] of Object.entries(weights)) {
    const v = criteria[name];
    if (v == null) return null;
    total += v * w;
    weightSum += w;
  }
  return weightSum === 0 ? null : total / weightSum;
}

/**
 * Shortlist and rank rows within `radiusM` metres of a station.
 * rows: [{ stationDistanceM, pricePerM2|null, ... }], weights: { transit, price }.
 * Criteria are normalised across the shortlist only, so properties outside the buffer
 * do not change the scores of those inside it. Closer and cheaper score higher.
 * Unscored rows (score null) are kept and sorted last.
 */
export function rankWithinBuffer(rows, radiusM, weights) {
  const shortlist = rows.filter((r) => r.stationDistanceM <= radiusM);
  const transit = normalise(shortlist.map((r) => -r.stationDistanceM));
  const price = normalise(shortlist.map((r) => (r.pricePerM2 == null ? null : -r.pricePerM2)));
  return shortlist
    .map((r, i) => ({ ...r, score: weightedScore({ transit: transit[i], price: price[i] }, weights) }))
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
}
