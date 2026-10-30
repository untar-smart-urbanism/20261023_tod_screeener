# Guided prototype checklist and definition of done

## Guided build (minutes 40–80)
| Time | Step | Checkpoint |
|---|---|---|
| 40–50 | Two-minute project updates | Questions and risks noted |
| 50–55 | Create a private repo; add README, brief, .gitignore, .env.example | Brief visible on GitHub |
| 55–70 | Ask the AI to inspect, plan, then scaffold; run locally | Local URL opens in the browser |
| 70–75 | Add the pages and navigation | Every page reachable by click |
| 75–80 | Read the diff; commit; push | `git status` clean; commit on GitHub |

## Prototype pages
- [ ] Landing page (`app/pages/Home.jsx`)
- [ ] Navigation (`app/components/Layout.jsx`)
- [ ] Map / spatial page (`app/pages/MapPage.jsx`)
- [ ] Analysis page (`app/pages/Analysis.jsx`)
- [ ] Data-source page (`app/pages/Sources.jsx`)
- [ ] Results page (`app/pages/Results.jsx`)

## Definition of done
- [ ] **Application runs:** a fresh terminal and the documented command start it without errors.
- [ ] **Navigation works:** every page opens by click, with no console errors.
- [ ] **Repository is clean:** `git status` shows "nothing to commit, working tree clean", with no secrets or large data.
- [ ] **Setup is documented:** a neighbour can start the app from the README without asking you.
- [ ] **First version pushed:** `git log origin/main --oneline -1` shows your latest commit on GitHub.

## Assignment (before Meeting 3)
- [ ] Runnable skeleton with landing, navigation, map/spatial, analysis, data-source and results pages
- [ ] `.gitignore` and `.env.example`
- [ ] Complete local setup instructions in `README.md`
- [ ] `PROMPT_LOG.md`: one successful and one unsuccessful prompt
- [ ] For Meeting 3: list data sources in `docs/DATA_CATALOG.md` (name, owner, URL, licence, format, date, CRS)
