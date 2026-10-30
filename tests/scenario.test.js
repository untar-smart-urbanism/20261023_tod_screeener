// Interface input validation: the planner's station and radius. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseScenario } from "../app/scenario.js";

const IDS = ["S1", "S2", "S3"];

test("defaults: all stations, 800 m", () => {
  assert.deepEqual(parseScenario("", IDS), { stationId: "all", radiusM: 800, errors: [] });
});

test("valid choice is kept", () => {
  assert.deepEqual(parseScenario("station=S2&radius=500", IDS), { stationId: "S2", radiusM: 500, errors: [] });
});

test("impossible input (radius −5, unknown station) falls back with a message", () => {
  const s = parseScenario("station=S9&radius=-5", IDS);
  assert.equal(s.stationId, "all");
  assert.equal(s.radiusM, 800);
  assert.equal(s.errors.length, 2);
  assert.equal(parseScenario("radius=abc", IDS).radiusM, 800);
});
