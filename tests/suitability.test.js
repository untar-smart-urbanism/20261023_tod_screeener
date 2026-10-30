// Suitability model (six steps) and sensitivity. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { transitScore, costScores, scoreSites, sensitivity } from "../analysis/suitability.js";

const close = (a, b, eps = 0.005) => Math.abs(a - b) < eps;

test("T is anchored to the radius: 1 at the station, 0 at 800 m, null beyond", () => {
  assert.equal(transitScore(0, 800), 1);
  assert.equal(transitScore(800, 800), 0);
  assert.equal(transitScore(801, 800), null);
  assert.ok(close(transitScore(314, 800), 0.61));
});

test("C is inverted min–max: cheapest = 1, dearest = 0, missing stays null", () => {
  assert.deepEqual(costScores([14, 41, null, 27.5]), [1, 0, null, 0.5]);
  assert.deepEqual(costScores([5, 5]), [0.5, 0.5]);
});

test("Hand check P021: S = (2 × 0.61 + 1 × 1.00) / 3 = 0.74", () => {
  const rows = [
    { id: "P021", stationDistanceM: 314, pricePerM2: 14e6 },
    { id: "X", stationDistanceM: 443, pricePerM2: 41e6 },
  ];
  const { ranked } = scoreSites(rows);
  assert.equal(ranked[0].id, "P021");
  assert.ok(close(ranked[0].S, 0.74), `got ${ranked[0].S}`);
});

test("Excluded ≠ low score; unpriced inside the radius are not scored", () => {
  const { ranked, excluded, unpriced } = scoreSites([
    { id: "in", stationDistanceM: 100, pricePerM2: 10 },
    { id: "out", stationDistanceM: 900, pricePerM2: 1 },
    { id: "noprice", stationDistanceM: 200, pricePerM2: null },
  ]);
  assert.deepEqual(ranked.map((r) => r.id), ["in"]);
  assert.deepEqual(excluded.map((r) => r.id), ["out"]);
  assert.deepEqual(unpriced.map((r) => r.id), ["noprice"]);
});

test("Sensitivity reports rank moves across weight sets", () => {
  const rows = [
    { id: "near-dear", stationDistanceM: 100, pricePerM2: 40 },
    { id: "far-cheap", stationDistanceM: 600, pricePerM2: 10 },
  ];
  const s = sensitivity(rows, { "3:1": { transit: 3, cost: 1 }, "1:3": { transit: 1, cost: 3 } });
  assert.deepEqual(s.find((r) => r.id === "near-dear").ranks, { "3:1": 1, "1:3": 2 });
  assert.equal(s[0].moves, 1);
});
