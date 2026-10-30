# tests/

Checks with Node's built-in test runner (no extra dependency). Run with `npm test`.

| File | Covers |
|---|---|
| `handcheck.test.js` | The five Meeting 3 hand checks: P003 (typical), P018 (edge inside), P023 (edge outside), P014 (missing price), P021 (arithmetic) |
| `suitability.test.js` | T, C, S, exclusions, sensitivity |
| `data.test.js` | Inspection checkpoint, five coordinate errors, duplicates, missing ≠ zero (30.2 M vs 26.6 M), price parsing |
| `api.test.js` | API client: 429/Retry-After, no blind 4xx retries, pagination, validation; backend input checks |
| `aggregate.test.js` | Median with n, histogram band edges, per-station summary, duplicates, CSV export |
| `scenario.test.js` | Station/radius input validation (radius −5 rejected) |
| `analysis.test.js` | Meeting 2 distance and scoring helpers |
| `layers.test.js` | Legend class boundaries, score ramp |

Expected values must come from an **independent** calculation (calculator, hand, geodesic tool), never from the code's own output.
Meeting 4 runs these automatically on every change.
