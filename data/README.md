# data/

| Folder | What goes here | Committed to Git? |
|---|---|---|
| `raw/` | Original downloads, exactly as received | **No.** Ignored by `.gitignore` (large, licensed or personal data) |
| `processed/` | Cleaned, validated GeoJSON (EPSG:4326) made by `scripts/process-data.js`, plus `CONVERSION_LOG.md` | Only if small, non-sensitive and the licence allows |
| `sample/` | Small, safe, **synthetic** files the app runs on today | Yes |
| `cache/` | API responses with retrieval timestamps (`server/apiClient.js`) | **No** |

Workflow: raw file in `data/raw/` → `npm run inspect` → `scripts/process-data.js` → `data/processed/` → entry in `docs/DATA_CATALOG.md`.

Every dataset must have an entry in `docs/DATA_CATALOG.md` (source, retrieval date, licence, format, CRS, fields, quality notes, limitations).
Never commit personal data (UU 27/2022), owner names, confidential prices or keys.

The sample files are made up for teaching:
- `sample/properties.geojson`: 25 synthetic listings (3 have a blank asking price on purpose: P005, P014, P022)
- `sample/stations.geojson`: 3 synthetic station points (Station A, B, C)
