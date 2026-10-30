# Meeting 3 — guided integration and assignment checklist

## Today's output — three things that must work
- [ ] **A real dataset** — source, date, licence and CRS recorded; fields, types and nulls inspected; coordinates validated.
- [ ] **A functioning map** — data load from a file or API; features in the right place; legend, source and "real / synthetic" label visible.
- [ ] **A first analytical feature** — one method computes a result, and at least three records are checked by hand.

## Seven demo stages (checkpoint after each)
| # | Stage | Action | Checkpoint | If not |
|---|---|---|---|---|
| 1 | Inspect | `npm run inspect` — list fields, types, nulls, CRS; no edits | 25 features, 6 fields, 3 null prices | Open the file in a GeoJSON viewer |
| 2 | Clean | `scripts/process-data.js` — fix types and text; keep nulls as null | No 0 prices; area > 0 | Revert; fix one rule at a time |
| 3 | Validate coords | `analysis/validate.js` — range, study box, order, duplicates | All in the box; none at 0, 0 | Swapped order? Check the CRS |
| 4 | Map | Load layer; legend and source label | 25 points around 3 stations | Console errors; lon/lat order |
| 5 | Calculate | Nearest-station distance, 800 m flag, score | 13 sites within 800 m | Print one record's steps |
| 6 | Manual check | Hand-calculate 3 records; add tests | Code vs hand within 5 m | Find the step that differs |
| 7 | Document | Update catalog and method log; commit | Clean `git status`; pushed | Commit docs separately |

## Data path (from a click to a map)
- [x] Interface: planner picks station + radius; impossible input rejected (`app/scenario.js`)
- [x] Backend: validates input; keys in `.env`; `GET /api/sites` (`server/`)
- [x] Data: files today; DB schema and API client ready (`db/`, `server/apiClient.js`)
- [x] Analysis: pure, tested functions (`analysis/`)
- [x] Map & report: map layer, ranked table, method and source notes, CSV export with labels

## Integration checklist
- [ ] **Import** — raw file in `data/raw` (ignored) → processed copy in `data/processed`
- [ ] **Map** — correct place, legend, source label
- [ ] **Analyse** — one method as a pure function in `analysis/`
- [ ] **Validate** — ≥ 3 hand-checked records as tests
- [ ] **Document** — catalog, dictionary, method log, assumptions
- [ ] **Commit** — small commits; clean status; pushed

```bash
git commit -m "feat(analysis): nearest-station distance + 800 m flag, 3 hand-checked tests"
```

## Assignment — due before Meeting 4
- [ ] Functioning map — real (or labelled synthetic) data, legend, source, CRS
- [ ] `docs/DATA_CATALOG.md` — every dataset: source, date, licence, format, CRS
- [ ] Data dictionary — type, unit and meaning of null for each field
- [ ] Provenance & licence — who made it, retrieval date, terms, attribution
- [ ] `docs/DATA_QUALITY.md` — the 8 dimensions with test results or "unknown"
- [ ] `docs/PROMPT_AND_METHOD_LOG.md` — prompts, outcomes, method, formula
- [ ] `docs/ASSUMPTIONS.md` updated — evidence and impact if wrong
- [ ] Calculation method — steps and formula a colleague could re-run by hand
- [ ] Validation evidence — ≥ 3 records: typical, boundary, missing — with tests

## Definition of done
- [ ] App runs with one documented command (`npm run dev`)
- [ ] Map shows data in the right place
- [ ] One method implemented as a pure function
- [ ] ≥ 3 hand checks, written as passing tests (`npm test`)
- [ ] Every number labelled (asking, synthetic…)
- [ ] All files committed and pushed; no secrets or personal data

Meeting 4 builds on this: hand checks become automated tests, and an LLM skill will explain results — so the method must already be documented and correct.
