// Hand-checked cases that must keep passing. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { distanceMetres, withinBuffer } from "../analysis/buffer.js";
import { pricePerM2, normalise, weightedScore, rankWithinBuffer } from "../analysis/score.js";

test("distance is in metres: 0.01° of latitude ≈ 1,112 m", () => {
  const d = distanceMetres([106.82, -6.2], [106.82, -6.21]);
  assert.ok(Math.abs(d - 1112) < 5, `got ${d}`);
});

test("800 m buffer includes a point 500 m away and excludes one 1 km away", () => {
  const station = [106.82, -6.2];
  assert.equal(withinBuffer([106.82, -6.2045], [station], 800), true);
  assert.equal(withinBuffer([106.82, -6.209], [station], 800), false);
});

test("missing price stays null, not 0", () => {
  assert.equal(pricePerM2(null, 100), null);
  assert.equal(pricePerM2(3_000_000_000, 0), null);
  assert.equal(pricePerM2(3_000_000_000, 100), 30_000_000);
});

test("normalise maps to 0–1, keeps nulls, and handles equal values", () => {
  assert.deepEqual(normalise([10, 20, null, 30]), [0, 0.5, null, 1]);
  assert.deepEqual(normalise([5, 5]), [0.5, 0.5]);
});

test("weighted score returns null when a weighted criterion is missing", () => {
  const w = { transit: 2, price: 1 };
  assert.ok(Math.abs(weightedScore({ transit: 1, price: 0.4 }, w) - 0.8) < 1e-9);
  assert.equal(weightedScore({ transit: 1, price: null }, w), null);
});

test("shortlist scores ignore properties outside the buffer", () => {
  const w = { transit: 2, price: 1 };
  const near = [
    { id: "A", stationDistanceM: 0, pricePerM2: 10 },
    { id: "B", stationDistanceM: 400, pricePerM2: 20 },
  ];
  const far = { id: "C", stationDistanceM: 2000, pricePerM2: 1 };
  const ranked = rankWithinBuffer([...near, far], 800, w);
  assert.deepEqual(ranked.map((r) => [r.id, r.score]), [["A", 1], ["B", 0]]);
  assert.deepEqual(ranked, rankWithinBuffer(near, 800, w));
});

test("shortlisted property without a price is kept, unscored and last", () => {
  const ranked = rankWithinBuffer(
    [
      { id: "D", stationDistanceM: 100, pricePerM2: null },
      { id: "A", stationDistanceM: 0, pricePerM2: 10 },
      { id: "B", stationDistanceM: 400, pricePerM2: 20 },
    ],
    800,
    { transit: 2, price: 1 }
  );
  assert.deepEqual(ranked.map((r) => r.id), ["A", "B", "D"]);
  assert.equal(ranked[2].score, null);
});

test("empty shortlist returns an empty list", () => {
  assert.deepEqual(rankWithinBuffer([{ stationDistanceM: 900, pricePerM2: 5 }], 800, { transit: 2, price: 1 }), []);
});
