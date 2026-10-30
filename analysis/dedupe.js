// Likely duplicate listings (Meeting 3, real-estate cautions): one unit, several agents, re-listings.
// Rule: same type + same floor area + within `toleranceM` metres. Duplicates are REPORTED for review,
// never deleted silently — keep the price history (one property, many listings).
import { distanceMetres } from "./buffer.js";

/**
 * rows: [{ id, type, floor_area_m2, coordinates: [lon, lat] }]
 * Returns groups of ids, e.g. [["P007", "P019"]]. Rows with missing area or coordinates are skipped.
 */
export function likelyDuplicates(rows, { toleranceM = 11 } = {}) {
  const candidates = rows.filter((r) => r.floor_area_m2 != null && Array.isArray(r.coordinates));
  const groupOf = new Map();
  const groups = [];
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const a = candidates[i];
      const b = candidates[j];
      if (a.type !== b.type || a.floor_area_m2 !== b.floor_area_m2) continue;
      if (distanceMetres(a.coordinates, b.coordinates) > toleranceM) continue;
      const g = groupOf.get(a.id) ?? groupOf.get(b.id) ?? (groups.push([]), groups[groups.length - 1]);
      for (const r of [a, b]) {
        if (!groupOf.has(r.id)) {
          g.push(r.id);
          groupOf.set(r.id, g);
        }
      }
    }
  }
  return groups;
}
