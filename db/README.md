# db/

**Optional** for this course. Adopt a database when data volume, frequent updates or multiple users require it; until then, the GeoJSON files in `data/` with the same fields and IDs are enough.

| Path | What it holds |
|---|---|
| `migrations/001_initial_schema.sql` | Four tables: `sources`, `properties`, `stations`, `listings` (one property → many listings = price history) |
| `migrations/002_spatial_indexes.sql` | Spatial indexes for fast "within 800 m" queries |
| `queries/sites_within_800m.sql` | Distance to each station in metres (`::geography`) |
| `queries/latest_asking_price_per_m2.sql` | Latest asking price per m² with its source |

Rules
- One thing per table; a stable primary key per row, never the address or name.
- Geometry column with a declared CRS (`geometry(Point, 4326)`) and a spatial index.
- Schema changes are numbered migration scripts in Git, never edits by hand.
- Analysis SQL lives in files, so it re-runs on new data.
- Database passwords live in `.env` on the server (`DATABASE_URL`), never in code or the browser.

Apply (PostgreSQL + PostGIS installed locally):
```bash
psql "$DATABASE_URL" -f db/migrations/001_initial_schema.sql -f db/migrations/002_spatial_indexes.sql
```
