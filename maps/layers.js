// Map layer styles and legend definitions, kept apart from the pages that draw them.

export const PRICE_CLASSES = [
  { max: 20_000_000, color: "#2a9d8f", label: "< 20 M / m²" },
  { max: 35_000_000, color: "#e9c46a", label: "20 to < 35 M / m²" },
  { max: Infinity, color: "#e76f51", label: "≥ 35 M / m²" },
];
export const MISSING_COLOR = "#9aa0a6"; // blank prices are grey, never shown as 0

export function priceColor(pricePerM2) {
  if (pricePerM2 == null) return MISSING_COLOR;
  return PRICE_CLASSES.find((c) => pricePerM2 < c.max).color;
}

// Suitability score: a SEQUENTIAL ramp (light → dark = low → high), never a rainbow.
export const SCORE_CLASSES = [
  { min: 0.6, color: "#0b4f6c", label: "S ≥ 0.60" },
  { min: 0.4, color: "#2a7f9e", label: "0.40 – 0.59" },
  { min: 0.2, color: "#6fb1c8", label: "0.20 – 0.39" },
  { min: -Infinity, color: "#c4e3ee", label: "< 0.20" },
];
export function scoreColor(score) {
  if (score == null) return null;
  return SCORE_CLASSES.find((c) => score >= c.min).color;
}

export const EXCLUDED_STYLE = { color: "#ffffff", weight: 1, fillColor: "#b8bec6", fillOpacity: 0.9 }; // outside 800 m
export const UNPRICED_STYLE = { color: "#c0392b", weight: 2, fillOpacity: 0 }; // hollow red: no asking price

export const STATION_STYLE = { color: "#14213d", fillColor: "#14213d", fillOpacity: 1, radius: 7 };
export const BUFFER_STYLE = { color: "#14213d", weight: 1, dashArray: "4 4", fillOpacity: 0.04 };

export const TILE_LAYER = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "&copy; OpenStreetMap contributors",
};
