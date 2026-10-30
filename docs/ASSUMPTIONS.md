# Assumptions register

Every assumption that affects results is recorded here and reviewed as the project develops.
A result can never be more certain than its weakest assumption.

| ID | Assumption | Evidence / reason | Impact if wrong | Owner | Status |
|---|---|---|---|---|---|
| A1 | 800 m straight-line distance approximates a walkable station catchment | Common TOD rule of thumb; rivers, rail, toll roads and gated estates break it | False positives: sites inside the buffer but not walkable within 800 m | Project lead | Open: re-test the shortlist with network distance |
| A2 | Ranking weights transit 2 : cost 1 | ILLUSTRATIVE value choice for the prototype | Ranking order changes (see Sensitivity page: P002 moves ± 4) | Project lead | Open: sensitivity reported for 2:1, 1:1, 1:2 |
| A3 | Asking price per m² indicates relative land cost | Listings are available, transactions are not | Over- or under-estimates cost; cheap may be cheap for a reason (access, title, hazard) | Project lead | Open: label every price "asking" |
| A4 | Properties without a price are shown but not scored | Missing ≠ zero | Shortlist omits some sites | Project lead | Accepted |
| A5 | Sample data are synthetic | Teaching dataset | Results have no real-world meaning | Course team | Accepted until a real dataset is catalogued |
| A6 | Cost score C is min–max over the scored candidate set only | Properties outside 800 m should not change how shortlisted sites compare | C changes when the candidate set changes; do not compare scores across runs | Project lead | Accepted |
| A7 | Haversine (sphere) distance is accurate enough | Agrees with WGS 84 geodesic within ~4 m at ≤ 800 m (P018: 783 vs 779 m) | Boundary cases may flip: shown as "near boundary (±10 m)" | Project lead | Accepted |

## Facts · assumptions · choices · results
| Facts (source + date) | Assumptions | Choices (analyst) | Results |
|---|---|---|---|
| Station B at 106.827, −6.201 (synthetic file, 2026) · P021 asking IDR 4.48 bn (listing 2026-06-25) | A1, A3, A7 | Weights 2:1 · min–max for cost · unpriced excluded | P021 ranks 1st (S = 0.74) — valid only if the facts and assumptions hold and the choices are accepted |

**Status** values: Open · Accepted · Rejected · Replaced.
