// Browser side of the data path: ask the backend, never a third-party API directly (keys stay on the server).
// Used only when DATA_API_URL is set (e.g. "/api" with `npm run server` running); otherwise pages use the files.
import { settings } from "../config/settings.js";

export const apiEnabled = Boolean(settings.dataApiUrl);

/** GET {DATA_API_URL}/sites?station=S1&radius=800 → server response JSON. Throws on HTTP errors. */
export async function fetchSites(stationId, radiusM, { signal } = {}) {
  const url = `${settings.dataApiUrl.replace(/\/$/, "")}/sites?${new URLSearchParams({ station: stationId, radius: radiusM })}`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}
