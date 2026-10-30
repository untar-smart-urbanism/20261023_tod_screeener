// Meeting 3 manual-verification cases, written as tests. Run: npm test
// Expected values come from an INDEPENDENT hand calculation (docs/PROMPT_AND_METHOD_LOG.md),
// never from copying the code's own output.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { distanceMetres, nearestStation, nearBoundary } from "../analysis/buffer.js";
import { pricePerM2 } from "../analysis/score.js";

const load = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)));
const properties = load("../data/sample/properties.geojson");
const stations = load("../data/sample/stations.geojson").features.map((f) => ({
  id: f.properties.id,
  name: f.properties.name,
  coordinates: f.geometry.coordinates,
}));
const P = Object.fromEntries(properties.features.map((f) => [f.properties.id, f]));
const STATION_A = stations.find((s) => s.name === "Station A").coordinates;
const TOLERANCE_M = 5;

test("Typical, inside — P003 is ~211 m from Station A", () => {
  // Hand: x = 0.000941° × 110 670 m ≈ 104.1 m; y = 0.001661° × 110 590 m ≈ 183.7 m; √ ≈ 211.1 m
  const d = distanceMetres(P.P003.geometry.coordinates, STATION_A);
  assert.ok(Math.abs(d - 211) < TOLERANCE_M, `got ${d}`);
});

test("Edge, inside — P018 is < 800 m from Station B", () => {
  const n = nearestStation(P.P018.geometry.coordinates, stations);
  assert.equal(n.name, "Station B");
  assert.ok(n.distanceM < 800 && Math.abs(n.distanceM - 781) < TOLERANCE_M, `got ${n.distanceM}`);
});

test("Edge, outside — P023 is > 800 m from Station C and flagged near boundary", () => {
  const n = nearestStation(P.P023.geometry.coordinates, stations);
  assert.equal(n.name, "Station C");
  assert.ok(n.distanceM > 800, `got ${n.distanceM}`);
  assert.equal(nearBoundary(n.distanceM, 800), true);
});

test("Missing price — P014 price/m² stays null", () => {
  const p = P.P014.properties;
  assert.equal(p.asking_price_idr, null);
  assert.equal(pricePerM2(p.asking_price_idr, p.floor_area_m2), null);
});

test("Arithmetic — P021: 4.48 bn ÷ 320 m² = 14.0 M IDR/m²", () => {
  const p = P.P021.properties;
  assert.equal(pricePerM2(p.asking_price_idr, p.floor_area_m2), 14_000_000);
});
