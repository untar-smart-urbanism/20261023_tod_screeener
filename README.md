# TOD Opportunity Screener — Meeting 3

A prototype that helps a **district planning team** shortlist properties near stations for detailed transit-oriented-development (TOD) feasibility.
Built in *Smart Urbanism Vibe Coding*, Meeting 3: *From Urban Data to Spatial Evidence*. **All sample data are synthetic.**

> Status: Meeting 3 verified analysis — a documented dataset, a functioning map, and one transparent, hand-verified analytical feature (nearest-station distance + suitability score). Tests are automated in Meeting 4; the app is deployed in Meeting 5.

**Data you can trace. Methods you can check.**

## Purpose
Answer one decision: *which parcels within walking distance of a station deserve a closer look?* The tool ranks sites for professional review; a planner or valuer decides.

## Setup
```bash
npm install
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
```

## Run
```bash
npm run dev
```
Expected: `Local: http://localhost:5173/`. Pages: Home · Map · Analysis · Sources · Quality · Results · Sensitivity.
Pick a station and radius on Map, Analysis, Results or Sensitivity; the choice is kept in the URL (e.g. `#/results?station=S1&radius=800`) so a view can be shared. Results has **Export CSV**.

To serve results through the backend instead of the files, set `DATA_API_URL=/api` in `.env` and run `npm run server` alongside `npm run dev`. The Results page names its source and falls back to the files if the API is unavailable.

| Command | What it does |
|---|---|
| `npm test` | Hand-checked calculation tests in `tests/` |
| `npm run inspect` | Stage 1: fields, types, nulls, CRS, coordinate ranges (read-only) |
| `npm run process-data -- <in> <out>` | Stages 2–3: clean + validate a raw file into `data/processed/` |
| `npm run server` | API backend on :8787 (`GET /api/sites?station=S1&radius=800`) |
| `npm run build` / `npm run preview` | Production build into `dist/` / serve it |

## Method (one line)
800 m straight-line (Haversine) distance to the nearest station; T = 1 − d/800; C = (pmax − p)/(pmax − pmin) on **asking** price/m²; **S = (2T + C)/3** (illustrative weights); sensitivity at 2:1, 1:1, 1:2.
Details and hand calculations: [docs/PROMPT_AND_METHOD_LOG.md](docs/PROMPT_AND_METHOD_LOG.md).

## Project structure
```
20261023_tod_screeener_2/
├── README.md  AGENTS.md  CLAUDE.md  SMART_URBANISM_PROJECT_BRIEF.md  PROMPT_LOG.md (Meeting 2)
├── .gitignore  .env.example  index.html  vite.config.js  package.json
├── app/          # interface: pages (Home, Map, Analysis, Sources, Quality, Results, Sensitivity)
├── analysis/     # pure functions: inspect, clean, validate, buffer, score, suitability, aggregate, dedupe, report
├── maps/         # layer styles, sequential score ramp, legends, tile source
├── server/       # backend: /api/sites, API client (pagination, 429, retries, cache), .env keys
├── db/           # optional PostGIS: migrations/ (schema, indexes), queries/ (saved SQL)
├── scripts/      # inspect-data.js, process-data.js (convert once, log it)
├── data/         # raw/ (ignored) · processed/ · sample/ (synthetic) · cache/ (ignored)
├── docs/         # DATA_CATALOG, DATA_QUALITY, PROMPT_AND_METHOD_LOG, ASSUMPTIONS, MEETING3_CHECKLIST
├── tests/        # hand checks as tests (P003, P018, P023, P014, P021), data, API, suitability
└── config/       # settings: radius, weights, study-area box, data status label
```

## Data
See [docs/DATA_CATALOG.md](docs/DATA_CATALOG.md) (catalog + data dictionary) and [docs/DATA_QUALITY.md](docs/DATA_QUALITY.md).

## Limitations
- Synthetic data: the ranking demonstrates the workflow only.
- Straight-line distance ≠ walking route (A1). Re-test the shortlist with network distance.
- Asking prices ≠ transaction prices or valuations.
- Weights are illustrative value choices; see the Sensitivity page and [docs/ASSUMPTIONS.md](docs/ASSUMPTIONS.md).
- Missing ≠ zero · asking ≠ transaction · correlation ≠ causation · output ≠ recommendation.

## Troubleshooting
See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md). Map in the ocean? Check `[lon, lat]` order and the CRS.
