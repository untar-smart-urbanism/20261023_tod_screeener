// Transparent suitability model — six steps (Meeting 3): normalise, weight, exclude, score, rank, sensitivity.
// Pure functions, tested in tests/suitability.test.js. Weights are ILLUSTRATIVE (docs/ASSUMPTIONS.md, A2).

/** Transit proximity, anchored to the radius: T = 1 − d/radius (1 at the station, 0 at the radius). */
export function transitScore(distanceM, radiusM) {
  if (distanceM == null || distanceM > radiusM) return null;
  return 1 - distanceM / radiusM;
}

/**
 * Cost score, inverted min–max over the candidate set: C = (pmax − p) / (pmax − pmin), 1 = cheapest.
 * Relative: adding one very expensive listing changes every C. Missing prices stay null.
 */
export function costScores(pricesPerM2) {
  const valid = pricesPerM2.filter((p) => p != null && Number.isFinite(p));
  if (valid.length === 0) return pricesPerM2.map(() => null);
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  return pricesPerM2.map((p) => {
    if (p == null || !Number.isFinite(p)) return null;
    return max === min ? 0.5 : (max - p) / (max - min);
  });
}

/**
 * Score and rank candidate rows.
 * rows: [{ id, stationDistanceM, pricePerM2|null, ... }]
 * Returns { ranked, excluded, unpriced }:
 *  - excluded: d > radius → out (excluded ≠ low score)
 *  - unpriced: inside the radius but p = null → not scored
 *  - ranked: S = (wT·T + wC·C) / (wT + wC), sorted desc; `closeToNext` flags gaps < gapFlag
 */
export function scoreSites(rows, { radiusM = 800, weights = { transit: 2, cost: 1 }, gapFlag = 0.02 } = {}) {
  const excluded = rows.filter((r) => r.stationDistanceM > radiusM);
  const inside = rows.filter((r) => r.stationDistanceM <= radiusM);
  const unpriced = inside.filter((r) => r.pricePerM2 == null);
  const candidates = inside.filter((r) => r.pricePerM2 != null);

  const C = costScores(candidates.map((r) => r.pricePerM2));
  const wSum = weights.transit + weights.cost;
  const scored = candidates.map((r, i) => {
    const T = transitScore(r.stationDistanceM, radiusM);
    const S = (weights.transit * T + weights.cost * C[i]) / wSum;
    return { ...r, T, C: C[i], S };
  });
  scored.sort((a, b) => b.S - a.S || a.stationDistanceM - b.stationDistanceM);
  const ranked = scored.map((r, i) => ({
    ...r,
    rank: i + 1,
    closeToNext: i + 1 < scored.length && r.S - scored[i + 1].S < gapFlag,
  }));
  return { ranked, excluded, unpriced };
}

/**
 * Sensitivity: re-run the ranking under several weight sets and report how far each site moves.
 * weightSets: { label: { transit, cost } }. Returns [{ id, ranks: { label: rank }, moves }]
 * in the order of the first weight set. moves = largest minus smallest rank.
 */
export function sensitivity(rows, weightSets, { radiusM = 800 } = {}) {
  const labels = Object.keys(weightSets);
  const runs = labels.map((l) => scoreSites(rows, { radiusM, weights: weightSets[l] }).ranked);
  return runs[0].map((r) => {
    const ranks = Object.fromEntries(labels.map((l, i) => [l, runs[i].find((x) => x.id === r.id).rank]));
    const values = Object.values(ranks);
    return { id: r.id, ranks, moves: Math.max(...values) - Math.min(...values) };
  });
}
