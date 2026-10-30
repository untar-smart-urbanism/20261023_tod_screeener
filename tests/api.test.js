// API client and backend input validation, with a fake fetch (no network). Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { getJson, fetchAllPages, validateListings } from "../server/apiClient.js";
import { parseSitesQuery } from "../server/index.js";

const reply = (status, body, headers = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: (h) => headers[h] ?? null },
  json: async () => body,
});
const noWait = async () => {};
const quiet = (fn) => async () => {
  const log = console.log;
  console.log = () => {};
  try { await fn(); } finally { console.log = log; }
};

test("429 is retried after Retry-After; 404 is not retried", quiet(async () => {
  const waits = [];
  let calls = 0;
  const fetchImpl = async () => (++calls === 1 ? reply(429, {}, { "Retry-After": "30" }) : reply(200, { ok: 1 }));
  assert.deepEqual(await getJson("https://api.example.org/x", { fetchImpl, wait: async (ms) => waits.push(ms) }), { ok: 1 });
  assert.deepEqual(waits, [30_000]);

  calls = 0;
  const notFound = async () => (calls++, reply(404, {}));
  await assert.rejects(getJson("https://api.example.org/x", { fetchImpl: notFound, wait: noWait }), /HTTP 404/);
  assert.equal(calls, 1);
}));

test("pagination loops until next_page is null", quiet(async () => {
  const pages = { 1: { data: [{ id: 1 }], next_page: 2, total: 2 }, 2: { data: [{ id: 2 }], next_page: null, total: 2 } };
  const fetchImpl = async (url) => reply(200, pages[new URL(url).searchParams.get("page")]);
  const { items, total } = await fetchAllPages("https://api.example.org/v1/listings", {}, { fetchImpl, wait: noWait });
  assert.deepEqual(items.map((i) => i.id), [1, 2]);
  assert.equal(total, 2);
}));

test("listing validation keeps null price as null and rejects 0, 0", () => {
  const r = validateListings([
    { id: "L-1043", lon: 106.8212, lat: -6.2049, price: null },
    { id: "L-0", lon: 0, lat: 0, price: 1 },
  ]);
  assert.equal(r.ok[0].price, null);
  assert.equal(r.nullPrices, 1);
  assert.deepEqual(r.rejected, [{ id: "L-0", reason: "bad coordinates" }]);
});

test("backend rejects impossible input (radius −5)", () => {
  assert.ok(parseSitesQuery(new URLSearchParams("station=S1&radius=-5")).error);
  assert.ok(parseSitesQuery(new URLSearchParams("radius=800")).error);
  assert.deepEqual(parseSitesQuery(new URLSearchParams("station=S1&radius=800")), { stationId: "S1", radiusM: 800 });
});
