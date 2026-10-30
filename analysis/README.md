# analysis/

Spatial calculations as small, pure functions (input → output; no network, no UI), each with a test in `tests/`.
Distances are in **metres**; inputs are EPSG:4326 `[lon, lat]`; missing values stay `null`, never 0.

| File | What it does | Demo stage |
|---|---|---|
| `inspect.js` | Fields, types, nulls, CRS, coordinate and date ranges; `meanIgnoringNull` reports n | 1 Inspect |
| `clean.js` | `parseIdr("Rp 1.250.000.000")`, decimal commas, CSV rows → GeoJSON | 2 Clean |
| `validate.js` | Range, study box, swapped order, sign flip, Null Island, metres-as-degrees, duplicates | 3 Validate |
| `buffer.js` | Haversine distance, `nearestStation()`, 800 m buffer, near-boundary flag | 5 Calculate |
| `score.js` | Asking price per m² (null-safe), min–max normalise, weighted score | 5 Calculate |
| `aggregate.js` | Median with n, distance histogram, per-station summary | 5 Calculate |
| `dedupe.js` | Likely duplicate listings (same type + area within 11 m) — reported, not deleted | 2 Clean |
| `report.js` | CSV export of the ranked table with labels (SYNTHETIC, asking, method, source) | 7 Document |
| `suitability.js` | Six-step model: T = 1 − d/800, C = inverted min–max, S = (2T + C)/3, rank, sensitivity | 5 Calculate |

Chain: nearest station → keep ≤ 800 m → score → rank → sensitivity. One step = one function + one test.
