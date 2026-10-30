# Data catalog

Every dataset gets an entry **before** it is used: what data, from where, under what terms, in what state.
Record the access date for every download — portal contents and URLs change.

## Sample properties
| Item | Entry |
|---|---|
| Dataset | Sample properties |
| File | `data/sample/properties.geojson` |
| Source / owner | Course team (synthetic) — made for teaching the workflow |
| URL · retrieved | n/a · 2026-10 |
| Licence / terms | Teaching use only |
| Format · CRS | GeoJSON (RFC 7946) · EPSG:4326, [lon, lat] |
| Geometry | Point, one per listing |
| Transformations | None; nulls kept as null |
| Fields | See data dictionary below |
| Quality notes | 3 of 25 asking prices missing (P005, P014, P022); prices are **asking** prices; dated 2026-01-12 … 2026-09-13 |
| Limitations | Synthetic: no real-world meaning |
| Committed? | Yes |

## Sample stations
| Item | Entry |
|---|---|
| Dataset | Sample stations |
| File | `data/sample/stations.geojson` |
| Source / owner | Course team (synthetic) |
| URL · retrieved | n/a · 2026-10 |
| Licence / terms | Teaching use only |
| Format · CRS | GeoJSON · EPSG:4326 |
| Fields | `id`, `name`, `source` |
| Limitations | Synthetic positions; no line, schedule or ridership data |
| Committed? | Yes |

## Base map tiles
| Item | Entry |
|---|---|
| Source / owner | OpenStreetMap contributors (tile.openstreetmap.org) |
| Licence | ODbL 1.0 (data, since 12 Sep 2012); attribution shown on map |
| CRS | EPSG:3857 — display only, never for measurement |
| Committed? | No (live service) |

## *(your dataset)*
| Item | Entry |
|---|---|
| Dataset | |
| File | `data/raw/…` → `data/processed/…` |
| Source / owner (who made it, and why?) | |
| URL · retrieved | |
| Licence / terms (may you store? show publicly? attribution?) | |
| Format · CRS (as received → as stored) | |
| Scale / resolution | |
| Transformations (script + rule) | see `data/processed/CONVERSION_LOG.md` |
| Quality notes | see `docs/DATA_QUALITY.md` |
| Limitations (who or what is missing?) | |
| Committed? | No (raw) |

---

## Data dictionary — one row per field

| Field | Type | Unit | Meaning of null | Example |
|---|---|---|---|---|
| `id` | string | — | never null (primary key) | P021 |
| `type` | string (apartment, landed house, mixed-use, office, shophouse) | — | never null | mixed-use |
| `floor_area_m2` | number | m² | Not recorded | 320 |
| `asking_price_idr` | integer | IDR | **Not disclosed — not zero** | 4 480 000 000 |
| `listing_date` | date (ISO 8601) | — | Unknown | 2026-06-25 |
| `source` | string | — | never null | synthetic |
| `geometry` | Point | EPSG:4326 lon, lat | Not geocoded — excluded from map | [106.824181, −6.200641] |

Derived fields (computed in `app/data.js`, not stored):

| Field | Formula | Unit | Null when |
|---|---|---|---|
| `pricePerM2` | asking_price_idr ÷ floor_area_m2 | IDR/m² (asking) | either input null, or area ≤ 0 |
| `stationDistanceM` | Haversine to nearest station | m (straight line) | — |
| `T` | 1 − d/800 | 0–1 | d > 800 m (excluded) |
| `C` | (pmax − p)/(pmax − pmin) | 0–1 | price null (not scored) |
| `S` | (2T + C)/3 | 0–1 | excluded or not scored |

## Rules
- **Status** values: Synthetic · Official · Third-party · Own collection · To check.
- Owner names, phone and ID numbers never enter the repository (UU 27/2022). Keep only the attributes the analysis needs.
- Join official tables by region code (Satu Data Indonesia), not by names.
- Large files stay in `data/raw/` (ignored). Git warns above 50 MiB and GitHub blocks files above 100 MiB.
