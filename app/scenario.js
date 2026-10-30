// The planner's choice — station and radius — kept in the URL hash (#/results?station=S1&radius=800),
// so a view can be shared and every page reads the same scenario.
import { useEffect, useState } from "react";
import { settings } from "../config/settings.js";

export const RADIUS_LIMITS = { min: 100, max: 2000 };

/** Parse and validate; impossible input (radius −5, unknown station) falls back to defaults with a message. */
export function parseScenario(search, stationIds) {
  const q = new URLSearchParams(search);
  const errors = [];
  let stationId = q.get("station") ?? "all";
  if (stationId !== "all" && !stationIds.includes(stationId)) {
    errors.push(`Unknown station "${stationId}" — showing all stations.`);
    stationId = "all";
  }
  let radiusM = settings.walkBufferMetres;
  if (q.has("radius")) {
    const r = Number(q.get("radius"));
    if (Number.isFinite(r) && r >= RADIUS_LIMITS.min && r <= RADIUS_LIMITS.max) radiusM = r;
    else errors.push(`Radius must be ${RADIUS_LIMITS.min}–${RADIUS_LIMITS.max} m — using ${radiusM} m.`);
  }
  return { stationId, radiusM, errors };
}

const searchPart = () => window.location.hash.split("?")[1] ?? "";

export function useScenario(stationIds) {
  const [search, setSearch] = useState(searchPart());
  useEffect(() => {
    const onChange = () => setSearch(searchPart());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const scenario = parseScenario(search, stationIds);
  const update = (next) => {
    const merged = { station: scenario.stationId, radius: scenario.radiusM, ...next };
    const path = window.location.hash.replace(/^#/, "").split("?")[0] || "/";
    window.location.hash = `${path}?${new URLSearchParams(merged)}`;
  };
  return [scenario, update];
}
