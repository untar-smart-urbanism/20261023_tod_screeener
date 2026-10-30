// Aggregation, duplicate detection and export. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { median, distanceHistogram, summariseByStation } from "../analysis/aggregate.js";
import { likelyDuplicates } from "../analysis/dedupe.js";
import { rankedToCsv } from "../analysis/report.js";

test("median ignores nulls and reports n", () => {
  assert.deepEqual(median([3, null, 1, 2]), { median: 2, n: 3 });
  assert.deepEqual(median([4, 1, 3, 2]), { median: 2.5, n: 4 });
  assert.deepEqual(median([null]), { median: null, n: 0 });
});

test("histogram bands: 800 is inside, 800.1 is beyond, 200 starts the second band", () => {
  const h = distanceHistogram([0, 199, 200, 799, 800, 800.1, null]);
  // bands: 0–200, 200–400, 400–600, 600–800, > 800
  assert.deepEqual(h.map((b) => b.count), [2, 1, 0, 2, 1]);
  assert.equal(h[4].label, "> 800 m");
});

test("per-station summary counts sites within the radius and priced ones", () => {
  const rows = [
    { nearestStationId: "S1", stationDistanceM: 100, pricePerM2: 10 },
    { nearestStationId: "S1", stationDistanceM: 300, pricePerM2: null },
    { nearestStationId: "S1", stationDistanceM: 900, pricePerM2: 99 },
    { nearestStationId: "S2", stationDistanceM: 500, pricePerM2: 20 },
  ];
  const s = summariseByStation(rows, [{ id: "S1", name: "A" }, { id: "S2", name: "B" }], 800);
  assert.deepEqual(s, [
    { id: "S1", name: "A", within: 2, priced: 1, medianAskingPerM2: 10 },
    { id: "S2", name: "B", within: 1, priced: 1, medianAskingPerM2: 20 },
  ]);
});

test("likely duplicates: same type and area within ~11 m; different area is not a duplicate", () => {
  const rows = [
    { id: "a", type: "apartment", floor_area_m2: 60, coordinates: [106.82, -6.2] },
    { id: "b", type: "apartment", floor_area_m2: 60, coordinates: [106.82005, -6.2] }, // ≈ 5.5 m east
    { id: "c", type: "apartment", floor_area_m2: 90, coordinates: [106.82, -6.2] },
    { id: "d", type: "apartment", floor_area_m2: 60, coordinates: [106.83, -6.2] }, // ≈ 1.1 km
  ];
  assert.deepEqual(likelyDuplicates(rows), [["a", "b"]]);
});

test("CSV export keeps labels and leaves missing values blank, not 0", () => {
  const csv = rankedToCsv(
    [{ rank: 1, id: "P021", type: "mixed-use", nearestStation: "Station B", stationDistanceM: 314.2, T: 0.607, pricePerM2: 14e6, C: 1, S: 0.738 },
     { rank: null, id: "X", type: "office, small", nearestStation: "Station A", stationDistanceM: 10, T: null, pricePerM2: null, C: null, S: null }],
    { dataStatus: "SYNTHETIC", method: "800 m straight line", source: "course team", retrieved: "2026-10", crs: "EPSG:4326" }
  );
  const lines = csv.trim().split("\n");
  assert.match(lines[0], /SYNTHETIC.*ASKING/);
  assert.equal(lines[5], "1,P021,mixed-use,Station B,314,0.61,14000000,1.00,0.74");
  assert.equal(lines[6], ',X,"office, small",Station A,10,,,,');
});
