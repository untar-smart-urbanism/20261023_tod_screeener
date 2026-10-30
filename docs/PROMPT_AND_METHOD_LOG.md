# Prompt and method log

How each result was produced: the prompt and its outcome, the method and formula, assumptions, test cases, validation result, limitations and next steps.
Write entries as you go. **Never paste API keys, personal data or confidential prices** — refer to them generically ("key in .env").

## Prompts

| # | Date · tool | Prompt | Outcome |
|---|---|---|---|
| 1 | 2026-10-23 · Claude | "Inspect data/sample/properties.geojson: fields, types, null counts, CRS, coordinate ranges. Do not modify files." | Report only: 25 features, 6 fields, 3 null prices, EPSG:4326 |
| 2 | 2026-10-23 · Claude | "Add nearestStation() returning metres…" | Accepted after edit: added null check |
| 3 | 2026-10-23 · Claude | "Let the planner pick a station and radius; call GET /api/sites when DATA_API_URL is set, else use the files; add CSV export with labels." | Accepted: invalid radius (e.g. −5) falls back to 800 m with a message; tests in `tests/scenario.test.js` |
| 4 | 2026-10-23 · Claude | "Add per-station aggregation (median asking price/m² with n), a distance histogram, and a likely-duplicate check." | Accepted: histogram 0 / 3 / 5 / 5 / 12 matches the hand count; no likely duplicates in the sample |
| 5 | | | |

## Method — nearest-station suitability (TOD screener)

| Item | Entry |
|---|---|
| Question | Which sites within walking distance of a station deserve a closer look? |
| Method | Haversine distance (R = 6 371 008.8 m) to nearest of 3 stations; 800 m threshold; transparent suitability score |
| Code | `analysis/buffer.js` (distance), `analysis/score.js` (price/m²), `analysis/suitability.js` (score, rank, sensitivity) |
| Formula | T = 1 − d/800 · C = (pmax − p)/(pmax − pmin) · **S = (2T + C)/3** |
| Exclusions | d > 800 m → excluded (not scored 0); price null → not scored |
| Assumptions | A1 800 m straight line ≈ walkable · A2 weights 2:1 · A3 asking price ≈ relative land cost (see `ASSUMPTIONS.md`) |
| Test cases | P003, P018, P023, P014, P021 (`tests/handcheck.test.js`) |
| Validation result | 5 / 5 pass; P023 near boundary |
| Limitations | Straight line; asking prices; synthetic data; compensatory model; min–max C is relative to the candidate set |
| Next | Network distance for the shortlist |

### Single-station view
When the planner picks one station (`#/results?station=S1&radius=800` or `GET /api/sites?station=S1&radius=800`), only properties whose **nearest** station is that one are considered, and C is min–max over that station's candidates. Scores are therefore not comparable between the single-station and all-station views.

### Steps a colleague can re-run by hand
1. For each property, compute the distance to every station in metres; keep the nearest.
2. Drop properties with d > 800 m (excluded) and set aside those without an asking price (not scored).
3. For the rest: price/m² = asking price ÷ floor area; T = 1 − d/800; C = (pmax − p)/(pmax − pmin) over the remaining set.
4. S = (2T + C)/3. Sort by S, descending.
5. Repeat step 4 with weights 1:1 and 1:2; report which ranks move.

## Validation evidence — hand calculations

**P003 → Station A (typical, inside)**
```
Δlon = 106.815500 − 106.814559 = 0.000941°
Δlat = −6.208839 − (−6.210500) = 0.001661°
x = 0.000941 × 110 670 m ≈ 104.1 m    (1° of longitude at 6.2°S)
y = 0.001661 × 110 590 m ≈ 183.7 m    (1° of latitude at 6.2°S)
d = √(104.1² + 183.7²) ≈ 211.1 m
Code (Haversine): 212.0 m · Geodesic (WGS 84): 211.2 m → agree within 1 m; tolerance 5 m ✓
```

| Case | Record | Expected (hand) | Code | Pass |
|---|---|---|---|---|
| Typical, inside | P003 → A | ≈ 211 m, inside | 212 m, inside | ✓ |
| Edge, inside | P018 → B | < 800 m, inside | 783 m (geodesic 779) | ✓ |
| Edge, outside | P023 → C | > 800 m, outside | 804 m (geodesic 804) — near boundary | ✓ |
| Missing price | P014 | price/m² null; not scored | null | ✓ |
| Arithmetic | P021 | 4.48 bn ÷ 320 = 14.0 M | 14.0 M | ✓ |

**P021 score:** T = 1 − 314/800 = 0.61 · C = (41.0 − 14.0)/(41.0 − 14.0) = 1.00 · S = (2 × 0.61 + 1.00)/3 = 0.74 → rank 1 of 13 ✓

A test that copies the code's own output as the "expected" value tests nothing. Expected values above come from the independent hand calculation.

## Results on the course sample (SYNTHETIC, ILLUSTRATIVE WEIGHTS)
- 13 of 25 records within 800 m, all priced and scored; 12 excluded (including the 3 unpriced: P005, P014, P022).
- Mean asking price/m²: **30.2 M** IDR excluding nulls (n = 22) vs 26.6 M if nulls were treated as 0 (−12%).
- Distance distribution: 0–200 m: 0 · 200–400 m: 3 · 400–600 m: 5 · 600–800 m: 5 · > 800 m: 12. None closer than 200 m.
- Per station within 800 m (median **asking** price/m², n): Station A 24.0 M (3) · Station B 30.5 M (6) · Station C 34.0 M (4).
- Likely duplicates (same type + area within 11 m): none.
- Sensitivity (2:1, 1:1, 1:2): P021 1st in every run (robust); P003, P010, P006 swap places 2–4 (one tier); P002 falls 7th → 11th as the cost weight rises.
