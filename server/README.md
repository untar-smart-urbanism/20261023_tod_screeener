# server/

The application backend: validates input, holds API keys from `.env` (server-only), calls data sources and the pure functions in `analysis/`.
No dependencies — Node's built-in `http`.

| File | Purpose |
|---|---|
| `index.js` | `GET /api/sites?station=S1&radius=800` · `GET /api/health` |
| `data.js` | Loads and validates `data/sample/*.geojson`; replace with a DB query or API call later |
| `apiClient.js` | Auth header, request logging, pagination, 429 + Retry-After, backoff (1 s, 2 s, 4 s), validation, cache with `retrieved_at` |
| `env.js` | Minimal `.env` loader |

```bash
npm run server
```
Expected: `API on http://localhost:8787/api/sites?station=S1&radius=800`. With `npm run dev` running too, the app can call `/api/...` through the Vite proxy.

One request, end to end: click "Station A" → `GET /api/sites?station=S1&radius=800` → data + `ST_DWithin`-equivalent filter → JSON → map layer + ranked table.

Real policy example — Nominatim (OSM geocoder): ≤ 1 request/s per app, identify your app, cache results, no heavy bulk geocoding.
