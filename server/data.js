// Data access for the backend. Today: static GeoJSON in data/sample/.
// Later: swap loadSites() for a database query (db/queries/sites_within_800m.sql) or
// an API call (server/apiClient.js) — the analysis functions stay the same.
import { readFile } from "node:fs/promises";
import { nearestStation } from "../analysis/buffer.js";
import { pricePerM2 } from "../analysis/score.js";
import { validateCollection } from "../analysis/validate.js";

const STUDY_AREA_BBOX = [106.79, -6.24, 106.86, -6.18]; // keep in sync with config/settings.js

const readJson = async (rel) => JSON.parse(await readFile(new URL(rel, import.meta.url), "utf8"));

export async function loadSites() {
  const properties = await readJson("../data/sample/properties.geojson");
  const stationsFc = await readJson("../data/sample/stations.geojson");
  const stations = stationsFc.features.map((f) => ({ id: f.properties.id, name: f.properties.name, coordinates: f.geometry.coordinates }));
  const { valid } = validateCollection(properties, STUDY_AREA_BBOX);
  const rows = valid.map((f) => {
    const p = f.properties;
    const n = nearestStation(f.geometry.coordinates, stations);
    return {
      id: p.id,
      type: p.type,
      coordinates: f.geometry.coordinates,
      pricePerM2: pricePerM2(p.asking_price_idr, p.floor_area_m2),
      nearestStationId: n.id,
      nearestStation: n.name,
      stationDistanceM: n.distanceM,
      listing_date: p.listing_date,
    };
  });
  return { rows, stations, meta: { dataset: "Sample properties", status: "synthetic", retrieved: "2026-10", crs: "EPSG:4326" } };
}

export function findStation(stations, id) {
  return stations.find((s) => s.id === id) ?? null;
}
