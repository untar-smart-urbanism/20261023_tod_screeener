# scripts/

One script = one reproducible conversion. Never convert by hand in a GUI — it leaves no trace.

| Script | Stage | Command |
|---|---|---|
| `inspect-data.js` | 1 Inspect (read-only) | `npm run inspect` or `node scripts/inspect-data.js <file.geojson>` |
| `process-data.js` | 2 Clean · 3 Validate | `node scripts/process-data.js data/raw/<in> data/processed/<out>.geojson` |

`process-data.js` appends every run to `data/processed/CONVERSION_LOG.md`.
