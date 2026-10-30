// Map & report output: CSV export of a ranked table. Pure: returns text; the page triggers the download.
// Every export carries its labels (data status, price type, method, source, date) in a header block,
// so the numbers keep their meaning when the file travels without the app.

const cell = (v) => {
  if (v == null) return ""; // missing stays blank — never 0
  const s = String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * meta: { dataStatus, method, source, retrieved, crs }
 * rows: ranked rows with { rank, id, type, nearestStation, stationDistanceM, T, pricePerM2, C, S }
 */
export function rankedToCsv(rows, meta) {
  const header = [
    `# TOD screener export — ${meta.dataStatus} data; prices are ASKING prices, not transactions or valuations`,
    `# Method: ${meta.method}`,
    `# Source: ${meta.source}; retrieved ${meta.retrieved}; CRS ${meta.crs}`,
    "# The score ranks sites for professional review. It is not a valuation, feasibility verdict or recommendation.",
  ];
  const cols = ["rank", "id", "type", "nearest_station", "distance_m", "T", "asking_price_per_m2_idr", "C", "S"];
  const lines = rows.map((r) =>
    [
      r.rank, r.id, r.type, r.nearestStation, r.stationDistanceM == null ? null : Math.round(r.stationDistanceM),
      r.T?.toFixed(2), r.pricePerM2 == null ? null : Math.round(r.pricePerM2), r.C?.toFixed(2), r.S?.toFixed(2),
    ].map(cell).join(",")
  );
  return [...header, cols.join(","), ...lines].join("\n") + "\n";
}
