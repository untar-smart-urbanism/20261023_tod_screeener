// Stage 1 — Inspect. Reports fields, types, nulls, CRS and coordinate ranges. Does NOT modify files.
// Usage: node scripts/inspect-data.js data/sample/properties.geojson
import { readFileSync } from "node:fs";
import { inspectCollection } from "../analysis/inspect.js";
import { validateCollection } from "../analysis/validate.js";

const STUDY_AREA_BBOX = [106.79, -6.24, 106.86, -6.18]; // keep in sync with config/settings.js
const path = process.argv[2];
if (!path) {
  console.error("Usage: node scripts/inspect-data.js <file.geojson>");
  process.exit(1);
}

const fc = JSON.parse(readFileSync(path, "utf8"));
const report = inspectCollection(fc);
const { invalid, duplicates } = validateCollection(fc, STUDY_AREA_BBOX);

console.log(`File:      ${path}`);
console.log(`Features:  ${report.features}  (${report.geometryTypes.join(", ")})`);
console.log(`CRS:       ${report.crs}`);
console.log(`Lon range: ${report.lonRange?.join(" … ") ?? "—"}   (Jakarta ≈ 106.8)`);
console.log(`Lat range: ${report.latRange?.join(" … ") ?? "—"}   (Jakarta ≈ −6.2)`);
console.log(`Dates:     ${report.dateRange?.join(" … ") ?? "—"}`);
console.table(Object.fromEntries(Object.entries(report.fields).map(([k, v]) => [k, { types: v.types.join("/"), nulls: v.nulls }])));
console.log(`Coordinate problems: ${invalid.length}`, invalid.length ? invalid : "");
console.log(`Duplicate positions: ${duplicates.length}`, duplicates.length ? duplicates : "");
