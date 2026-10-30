# Instructions for AI coding assistants

Read this file before changing anything in this repository. (`CLAUDE.md` points here.)

## Project
TOD Opportunity Screener: a Vite + React + Leaflet prototype that helps a district planning team shortlist properties near stations. See `README.md` and `SMART_URBANISM_PROJECT_BRIEF.md`.

## How to run
- `npm install`, then `npm run dev` (http://localhost:5173)
- `npm test` runs `tests/` with Node's built-in test runner
- `npm run server` starts the API backend on http://localhost:8787 (Vite proxies `/api`)
- `npm run inspect` reports fields, types, nulls and CRS of the sample data (read-only)

## Conventions
- Pages live in `app/pages/` (PascalCase `.jsx`), are registered in `PAGES` in `app/App.jsx`, and are wrapped by `app/components/Layout.jsx`. Follow `app/pages/Home.jsx`.
- Calculations go in `analysis/` as pure functions with a test in `tests/`. No UI code there.
- Map colours, legends and tile sources go in `maps/layers.js`.
- Settings come from `config/settings.js`, which reads the environment. Never hard-code keys, URLs or study-area parameters in pages.
- Distances are in **metres**. Data are WGS84 (EPSG:4326) unless the catalog says otherwise.
- Missing values stay `null` and display as "—" or grey, **never as 0**.
- Store in degrees (EPSG:4326), measure in metres. GeoJSON order is `[lon, lat]`; validate coordinates (`analysis/validate.js`) before mapping.
- API keys and database passwords are read only in `server/` from `.env`; never in `app/`, `config/` or the browser.
- Label every number with its type (asking, SYNTHETIC, ILLUSTRATIVE …). Update `docs/DATA_CATALOG.md` and `docs/PROMPT_AND_METHOD_LOG.md` with each data or method change.
- Test expected values come from independent hand calculations, never from the code's output.

## Limits: do not
- Add dependencies without asking first.
- Edit `analysis/` when the task is about the interface, or vice versa, unless asked.
- Put secrets in code, or read or commit `.env`.
- Add personal data, owner names or confidential prices. Use `data/sample/` only.
- Commit or push. The human reviews the diff and commits.

## Working style
1. Inspect first: report the structure, conventions, dependencies, data and tests relevant to the task.
2. Propose a plan that lists the files you would change, then wait for approval.
3. After changing things, give the run command and three checks the human can do by hand.
