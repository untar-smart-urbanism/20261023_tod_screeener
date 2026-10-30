# data/raw/

Put original downloads here, exactly as received. Everything in this folder except this README is ignored by Git.
Record each file in `docs/DATA_CATALOG.md` (source, URL, **retrieval date**, licence, CRS) before using it, then convert it with `scripts/process-data.js`.
Shapefiles without a `.prj` have an unknown CRS — ask the provider, test candidates (UTM 48S vs WGS 84) against a known landmark, and record the decision.
