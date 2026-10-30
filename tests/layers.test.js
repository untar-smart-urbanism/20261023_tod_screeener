// Hand-checked legend boundaries. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { priceColor, PRICE_CLASSES, MISSING_COLOR, scoreColor, SCORE_CLASSES } from "../maps/layers.js";

const [low, mid, high] = PRICE_CLASSES.map((c) => c.color);

test("price classes split at 20 M and 35 M, each boundary going to the higher class", () => {
  assert.equal(priceColor(19_990_000), low);
  assert.equal(priceColor(20_000_000), mid);
  assert.equal(priceColor(34_990_000), mid);
  assert.equal(priceColor(35_000_000), high);
});

test("missing price is grey, not a price class", () => {
  assert.equal(priceColor(null), MISSING_COLOR);
});

test("score ramp: 0.74 is darkest, 0.09 lightest, null has no colour", () => {
  assert.equal(scoreColor(0.74), SCORE_CLASSES[0].color);
  assert.equal(scoreColor(0.6), SCORE_CLASSES[0].color);
  assert.equal(scoreColor(0.09), SCORE_CLASSES[3].color);
  assert.equal(scoreColor(null), null);
});
