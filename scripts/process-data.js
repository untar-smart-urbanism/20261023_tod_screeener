// Stages 2–3 — Clean and validate. Receive any format → convert once, with a script →
// store GeoJSON in EPSG:4326 under data/processed/ → log the conversion.
//
// Usage:
//   node scripts/process-data.js data/raw/listings.csv  data/processed/listings.geojson
//   node scripts/process-data.js data/raw/layer.geojson data/processed/layer.geojson
//
// CSV: first row = header; needs lon and lat columns (decimal comma allowed); separator , or ;.
// Prices in "asking_price_text" (e.g. "Rp 1.250.000.000") are parsed to asking_price_idr;
// the original text column is kept. Unknown prices stay null, never 0.
// Shapefile / GeoPackage: convert to GeoJSON EPSG:4326 first (e.g. QGIS or ogr2ogr), and record the CRS used.
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { parseIdr, parseDecimal, rowsToFeatureCollection } from "../analysis/clean.js";
import { validateCollection } from "../analysis/validate.js";

const STUDY_AREA_BBOX = [106.79, -6.24, 106.86, -6.18]; // keep in sync with config/settings.js
const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("Usage: node scripts/process-data.js <input.csv|input.geojson> <output.geojson>");
  process.exit(1);
}

function parseCsv(text) {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  const sep = (lines[0].match(/;/g) ?? []).length > (lines[0].match(/,/g) ?? []).length ? ";" : ",";
  const header = lines[0].split(sep).map((h) => h.trim());
  return lines.slice(1).map((l) => Object.fromEntries(l.split(sep).map((v, i) => [header[i], v.trim()])));
}

const raw = readFileSync(input, "utf8");
const fc = input.toLowerCase().endsWith(".csv")
  ? rowsToFeatureCollection(parseCsv(raw), { source: input })
  : JSON.parse(raw);

const rules = [];
for (const f of fc.features) {
  const p = f.properties;
  if ("asking_price_text" in p) p.asking_price_idr = parseIdr(p.asking_price_text);
  if (typeof p.floor_area_m2 === "string") p.floor_area_m2 = parseDecimal(p.floor_area_m2);
  if (p.floor_area_m2 != null && p.floor_area_m2 <= 0) p.floor_area_m2 = null;
}
rules.push("asking_price_text → asking_price_idr (parseIdr; unknown → null)");
rules.push("floor_area_m2 text → number; ≤ 0 → null");

const { valid, invalid, duplicates } = validateCollection(fc, STUDY_AREA_BBOX);
const out = { type: "FeatureCollection", metadata: { crs: "EPSG:4326", source_file: input, processed_at: new Date().toISOString() }, features: valid };
writeFileSync(output, JSON.stringify(out, null, 1));

const log = [
  `\n## ${new Date().toISOString().slice(0, 10)} — ${input} → ${output}`,
  ...rules.map((r) => `- Rule: ${r}`),
  `- Kept ${valid.length}, rejected ${invalid.length} (coordinate checks), duplicate positions ${duplicates.length}`,
  ...invalid.map((i) => `  - ${i.id ?? "(no id)"}: ${i.problems.join(", ")}`),
].join("\n");
appendFileSync(new URL("../data/processed/CONVERSION_LOG.md", import.meta.url), log + "\n");
console.log(log);
