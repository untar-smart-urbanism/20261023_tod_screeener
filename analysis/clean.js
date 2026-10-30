// Cleaning rules for raw inputs — stage 2 of the demo. One rule = one function = one test.
// Keep nulls as null; keep the original text column next to the parsed value; log every rule.

/**
 * Parse an Indonesian price text to an integer IDR.
 * "Rp 1.250.000.000" → 1250000000 · "1,25 M" / "1.25 miliar" → 1250000000 · "" / "on request" → null.
 * Never returns 0 for "unknown".
 */
export function parseIdr(text) {
  if (text == null) return null;
  if (typeof text === "number") return Number.isFinite(text) && text > 0 ? text : null;
  const s = String(text).trim().toLowerCase().replace(/^rp\.?\s*/, "");
  if (s === "") return null;
  const unit = s.match(/(miliar|milyar|m|jt|juta)\s*$/);
  if (unit) {
    const num = Number(s.slice(0, unit.index).trim().replace(",", "."));
    if (!Number.isFinite(num) || num <= 0) return null;
    return Math.round(num * (unit[1].startsWith("j") ? 1e6 : 1e9));
  }
  if (!/^[\d.,\s]+$/.test(s)) return null; // "price on request", "nego" …
  const digits = s.replace(/[.\s]/g, "").replace(/,\d{1,2}$/, ""); // dots are thousands separators
  const n = Number(digits);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Parse a number that may use a decimal comma ("45,5" → 45.5). Blank → null. */
export function parseDecimal(text) {
  if (text == null || String(text).trim() === "") return null;
  const n = Number(String(text).trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/**
 * Turn CSV-like rows (with lon/lat or longitude/latitude columns) into a GeoJSON FeatureCollection.
 * Rows without valid numbers keep geometry: null so validation can report them — never 0, 0.
 */
export function rowsToFeatureCollection(rows, { lonField = "lon", latField = "lat", source = "unknown" } = {}) {
  return {
    type: "FeatureCollection",
    metadata: { crs: "EPSG:4326" },
    features: rows.map((r) => {
      const lon = parseDecimal(r[lonField]);
      const lat = parseDecimal(r[latField]);
      const { [lonField]: _lon, [latField]: _lat, ...rest } = r;
      return {
        type: "Feature",
        properties: { ...rest, source: r.source ?? source },
        geometry: lon == null || lat == null ? null : { type: "Point", coordinates: [lon, lat] },
      };
    }),
  };
}
