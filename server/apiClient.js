// API client with the seven things every client must handle (Meeting 3, "API essentials"):
// authentication · request/response logging · pagination · rate limits (429 + Retry-After) ·
// retries with backoff · validation · caching with a retrieval timestamp.
//
// ILLUSTRATIVE: LISTINGS_API_URL points to a fictional endpoint until you set a real one in .env.
// Read the provider's terms first and record them in docs/DATA_CATALOG.md.
// Server-side only — never import this file from app/.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const CACHE_DIR = new URL("../data/cache/", import.meta.url); // ignored by Git
const USER_AGENT = "tod-screener/0.3 (course project)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * GET one URL with retries. Retries timeouts, 429 and 5xx with backoff (1 s, 2 s, 4 s);
 * honours Retry-After; does not retry other 4xx.
 */
export async function getJson(url, { apiKey, retries = 3, timeoutMs = 15_000, fetchImpl = fetch, wait = sleep } = {}) {
  for (let attempt = 0; ; attempt++) {
    let res;
    try {
      res = await fetchImpl(url, {
        headers: { Accept: "application/json", "User-Agent": USER_AGENT, ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}) },
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      if (attempt >= retries) throw err;
      await wait(1000 * 2 ** attempt);
      continue;
    }
    console.log(`[api] GET ${redact(url)} → ${res.status}`);
    if (res.ok) return res.json();
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= retries) throw new Error(`HTTP ${res.status} for ${redact(url)}`);
    const retryAfterS = Number(res.headers.get("Retry-After"));
    await wait(Number.isFinite(retryAfterS) && retryAfterS > 0 ? retryAfterS * 1000 : 1000 * 2 ** attempt);
  }
}

/**
 * Fetch every page: loop until there is no next page, then compare the count with `total`.
 * Expects responses shaped { data: [...], next_page: n|null, total: n } — adapt to your provider.
 */
export async function fetchAllPages(baseUrl, params = {}, opts = {}) {
  const items = [];
  let page = 1;
  let total = null;
  while (page != null) {
    const url = new URL(baseUrl);
    for (const [k, v] of Object.entries({ ...params, page, per_page: 100 })) url.searchParams.set(k, v);
    const body = await getJson(url, opts);
    items.push(...(body.data ?? []));
    total = body.total ?? total;
    page = body.next_page ?? null;
    if (opts.minIntervalMs) await (opts.wait ?? sleep)(opts.minIntervalMs); // e.g. Nominatim: ≤ 1 request/s
  }
  if (total != null && items.length !== total) console.warn(`[api] expected ${total} items, got ${items.length}`);
  return { items, total };
}

/** Validate listing records before they reach the map. Keeps null prices as null; counts problems. */
export function validateListings(items) {
  const ok = [];
  const rejected = [];
  for (const it of items) {
    const lon = Number(it.lon);
    const lat = Number(it.lat);
    if (it.lon == null || it.lat == null || !Number.isFinite(lon) || !Number.isFinite(lat) || Math.abs(lon) > 180 || Math.abs(lat) > 90 || (lon === 0 && lat === 0)) {
      rejected.push({ id: it.id ?? null, reason: "bad coordinates" });
      continue;
    }
    ok.push({ ...it, lon, lat, price: it.price == null ? null : Number(it.price) });
  }
  return { ok, rejected, nullPrices: ok.filter((x) => x.price == null).length };
}

/** Re-use a cached response if younger than maxAgeH; otherwise call `load` and save it with retrieved_at. */
export async function cached(key, load, { maxAgeH = 24 } = {}) {
  const file = new URL(`${createHash("sha256").update(key).digest("hex").slice(0, 16)}.json`, CACHE_DIR);
  try {
    const hit = JSON.parse(await readFile(file, "utf8"));
    if (Date.now() - Date.parse(hit.retrieved_at) < maxAgeH * 3600_000) return hit;
  } catch { /* no cache yet */ }
  const fresh = { key, retrieved_at: new Date().toISOString(), body: await load() };
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(file, JSON.stringify(fresh, null, 1));
  return fresh;
}

/** Example: all listings inside a bounding box, cached. Key comes from .env, never from code. */
export async function fetchListings(bbox) {
  const base = process.env.LISTINGS_API_URL;
  if (!base) throw new Error("LISTINGS_API_URL is not set (see .env.example)");
  const params = { bbox: bbox.join(",") };
  return cached(`${base}?${new URLSearchParams(params)}`, async () => {
    const { items, total } = await fetchAllPages(base, params, { apiKey: process.env.LISTINGS_API_KEY });
    return { ...validateListings(items), total };
  });
}

const redact = (url) => String(url).replace(/(api_key|key|token)=[^&]+/gi, "$1=REDACTED");
