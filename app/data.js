// Loads the data once, validates coordinates, and derives fields the pages share.
// Prototype shortcut: static GeoJSON in data/. Results can also come from GET /api/sites
// (app/api.js → server/) without changing analysis/.
import propertiesRaw from "../data/sample/properties.geojson?raw";
import stationsRaw from "../data/sample/stations.geojson?raw";
import { nearestStation, nearBoundary } from "../analysis/buffer.js";
import { pricePerM2 } from "../analysis/score.js";
import { validateCollection } from "../analysis/validate.js";
import { scoreSites } from "../analysis/suitability.js";
import { settings } from "../config/settings.js";

export const properties = JSON.parse(propertiesRaw);
export const stations = JSON.parse(stationsRaw);

// Validate before mapping: invalid features are reported, not drawn.
export const validation = validateCollection(properties, settings.studyAreaBbox);

export const stationList = stations.features.map((f) => ({
  id: f.properties.id,
  name: f.properties.name,
  coordinates: f.geometry.coordinates,
}));

export const rows = validation.valid.map((f) => {
  const p = f.properties;
  const nearest = nearestStation(f.geometry.coordinates, stationList);
  return {
    ...p,
    coordinates: f.geometry.coordinates,
    pricePerM2: pricePerM2(p.asking_price_idr, p.floor_area_m2),
    nearestStationId: nearest.id,
    nearestStation: nearest.name,
    stationDistanceM: nearest.distanceM,
  };
});

/**
 * Scenario chosen by the planner: one station (or "all") and a radius.
 * Returns the rows in play (with the near-boundary flag for this radius) and the scored result.
 */
export function computeScenario({ stationId = "all", radiusM = settings.walkBufferMetres } = {}) {
  const inPlay = rows
    .filter((r) => stationId === "all" || r.nearestStationId === stationId)
    .map((r) => ({ ...r, nearBoundary: nearBoundary(r.stationDistanceM, radiusM, settings.nearBoundaryMetres) }));
  const result = scoreSites(inPlay, { radiusM, weights: settings.weights });
  return { rows: inPlay, result, scoreById: Object.fromEntries(result.ranked.map((r) => [r.id, r])) };
}

// Default scenario (all stations, 800 m), used by pages without controls.
export const { result, scoreById } = computeScenario();

export const fmtIdr = (v) => (v == null ? "—" : `Rp ${(v / 1e6).toFixed(1)} M`);
export const fmtM = (v) => (v == null ? "—" : `${Math.round(v)} m`);
