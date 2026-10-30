// Application backend (Meeting 3, "From a click to a map"). No dependencies: Node's built-in http.
// Validates input, holds API keys from .env (never sent to the browser), and calls data + analysis.
//
//   GET /api/sites?station=S1&radius=800  → ranked sites near one station, with method notes
//   GET /api/health                       → { ok: true }
//
// Run: npm run server   (the Vite dev server proxies /api to this port)
import http from "node:http";
import { pathToFileURL } from "node:url";
import { loadEnv } from "./env.js";
import { loadSites, findStation } from "./data.js";
import { scoreSites } from "../analysis/suitability.js";

loadEnv();
const PORT = Number(process.env.API_PORT || 8787);
const MAX_RADIUS_M = 5000;

/** Validate query parameters. Returns { error } or { stationId, radiusM }. */
export function parseSitesQuery(searchParams) {
  const stationId = searchParams.get("station");
  const radiusM = Number(searchParams.get("radius") ?? 800);
  if (!stationId || !/^[A-Za-z0-9_-]{1,32}$/.test(stationId)) return { error: "station is required (e.g. S1)" };
  if (!Number.isFinite(radiusM) || radiusM <= 0 || radiusM > MAX_RADIUS_M) {
    return { error: `radius must be a number of metres between 1 and ${MAX_RADIUS_M}` };
  }
  return { stationId, radiusM };
}

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method !== "GET") return send(res, 405, { error: "GET only" });
  if (url.pathname === "/api/health") return send(res, 200, { ok: true });
  if (url.pathname !== "/api/sites") return send(res, 404, { error: "not found" });

  const q = parseSitesQuery(url.searchParams);
  if (q.error) return send(res, 400, { error: q.error });
  try {
    const { rows, stations, meta } = await loadSites();
    const station = findStation(stations, q.stationId);
    if (!station) return send(res, 404, { error: `unknown station ${q.stationId}` });
    const forStation = rows.filter((r) => r.nearestStationId === station.id);
    const result = scoreSites(forStation, { radiusM: q.radiusM });
    return send(res, 200, {
      station,
      radius_m: q.radiusM,
      method: `${q.radiusM} m straight-line (Haversine); S = (2T + C)/3; asking prices`,
      source: meta,
      ranked: result.ranked,
      excluded: result.excluded.map((r) => r.id),
      unpriced: result.unpriced.map((r) => r.id),
    });
  } catch (err) {
    console.error(err); // details stay in the server log, not the response
    return send(res, 500, { error: "internal error" });
  }
});

// Listen only when run directly (tests import parseSitesQuery without starting the server).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  server.listen(PORT, () => console.log(`API on http://localhost:${PORT}/api/sites?station=S1&radius=800`));
}
