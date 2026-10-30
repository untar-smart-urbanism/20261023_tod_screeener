// Central place for settings. Values come from the environment (.env), never from code.
// Defaults are safe placeholders so the app still runs without a .env file.
// Only VITE_/MAP_/DATA_/STUDY_ variables reach the browser (vite.config.js); server secrets never do.
const env = import.meta.env ?? {};

export const settings = {
  mapTilesApiKey: env.MAP_TILES_API_KEY || "",
  dataApiUrl: env.DATA_API_URL || "",
  studyArea: env.STUDY_AREA || "Demo district (synthetic)",
  dataStatus: "SYNTHETIC", // "SYNTHETIC" or "REAL": shown on every map and table
  dataDate: "2026-10",
  crs: "EPSG:4326 (WGS 84); distances in metres (Haversine)",
  // Analysis parameters: assumptions, recorded in docs/ASSUMPTIONS.md
  walkBufferMetres: 800, // A1
  weights: { transit: 2, cost: 1 }, // A2 — ILLUSTRATIVE
  sensitivityWeights: {
    "2:1": { transit: 2, cost: 1 },
    "1:1": { transit: 1, cost: 1 },
    "1:2": { transit: 1, cost: 2 },
  },
  nearBoundaryMetres: 10,
  // Study-area box [minLon, minLat, maxLon, maxLat]; every point must fall inside (validation rule).
  studyAreaBbox: [106.79, -6.24, 106.86, -6.18],
  mapCenter: [-6.2088, 106.8227],
  mapZoom: 14,
};
