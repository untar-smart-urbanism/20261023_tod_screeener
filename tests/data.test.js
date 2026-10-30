// Data checks: inspection, coordinate validation, cleaning rules. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkCoordinate, validateCollection } from "../analysis/validate.js";
import { inspectCollection, meanIgnoringNull } from "../analysis/inspect.js";
import { parseIdr, parseDecimal, rowsToFeatureCollection } from "../analysis/clean.js";
import { pricePerM2 } from "../analysis/score.js";
import { settings } from "../config/settings.js";

const properties = JSON.parse(readFileSync(new URL("../data/sample/properties.geojson", import.meta.url)));
const BBOX = settings.studyAreaBbox;

test("Stage 1 checkpoint: 25 features, 6 fields, 3 null prices, EPSG:4326", () => {
  const r = inspectCollection(properties);
  assert.equal(r.features, 25);
  assert.equal(Object.keys(r.fields).length, 6);
  assert.equal(r.fields.asking_price_idr.nulls, 3);
  assert.equal(r.crs, "EPSG:4326");
});

test("Stage 3 checkpoint: all sample points inside the study box, none at 0, 0", () => {
  const { invalid, valid } = validateCollection(properties, BBOX);
  assert.deepEqual(invalid, []);
  assert.equal(valid.length, 25);
});

test("Five coordinate errors are each caught", () => {
  assert.deepEqual(checkCoordinate([106.8155, -6.2105], BBOX), []); // ① correct
  assert.deepEqual(checkCoordinate([106.8155, 6.2105], BBOX), ["sign-flip"]); // ② lost minus sign
  assert.deepEqual(checkCoordinate([0, 0], BBOX), ["null-island"]); // ③ blanks became 0, 0
  assert.deepEqual(checkCoordinate([-6.2105, 106.8155], BBOX), ["swapped-order"]); // ④ [lat, lon]
  assert.deepEqual(checkCoordinate([700875, 9313182], BBOX), ["metres-not-degrees"]); // ⑤ UTM 48S as degrees
  assert.deepEqual(checkCoordinate([null, -6.2], BBOX), ["missing"]);
});

test("Duplicate coordinates are reported (centroid geocoding)", () => {
  const pt = (id) => ({ type: "Feature", properties: { id }, geometry: { type: "Point", coordinates: [106.82, -6.2] } });
  const { duplicates } = validateCollection({ features: [pt("a"), pt("b")] }, BBOX);
  assert.deepEqual(duplicates, [{ key: "106.820000,-6.200000", ids: ["a", "b"] }]);
});

test("Missing ≠ zero: 30.2 M vs 26.6 M IDR/m² on the course sample", () => {
  const ppm = properties.features.map((f) => pricePerM2(f.properties.asking_price_idr, f.properties.floor_area_m2));
  const right = meanIgnoringNull(ppm);
  const wrong = meanIgnoringNull(ppm.map((v) => v ?? 0));
  assert.equal(right.n, 22);
  assert.ok(Math.abs(right.mean / 1e6 - 30.2) < 0.05);
  assert.ok(Math.abs(wrong.mean / 1e6 - 26.6) < 0.05);
});

test("Price text parses to integer IDR; unknown stays null, never 0", () => {
  assert.equal(parseIdr("Rp 1.250.000.000"), 1_250_000_000);
  assert.equal(parseIdr("1,25 M"), 1_250_000_000);
  assert.equal(parseIdr("850 jt"), 850_000_000);
  assert.equal(parseIdr("Harga on request"), null);
  assert.equal(parseIdr(""), null);
  assert.equal(parseIdr(0), null);
  assert.equal(parseDecimal("45,5"), 45.5);
});

test("CSV rows without coordinates get geometry null, not 0, 0", () => {
  const fc = rowsToFeatureCollection([{ id: "L1", lon: "106,82", lat: "-6,2" }, { id: "L2", lon: "", lat: "" }]);
  assert.deepEqual(fc.features[0].geometry.coordinates, [106.82, -6.2]);
  assert.equal(fc.features[1].geometry, null);
});
