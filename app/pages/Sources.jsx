const SOURCES = [
  { name: "Sample properties", file: "data/sample/properties.geojson", owner: "Course team", licence: "Teaching use only", date: "2026-10", crs: "EPSG:4326", status: "Synthetic" },
  { name: "Sample stations", file: "data/sample/stations.geojson", owner: "Course team", licence: "Teaching use only", date: "2026-10", crs: "EPSG:4326", status: "Synthetic" },
  { name: "Base map tiles", file: "OpenStreetMap tile server", owner: "OpenStreetMap contributors", licence: "ODbL 1.0 (data), attribution required", date: "Live", crs: "EPSG:3857 (display only)", status: "External" },
];

export default function Sources() {
  return (
    <section>
      <p className="kicker">Data-source page</p>
      <h1>Where the data come from</h1>
      <table>
        <thead><tr><th>Dataset</th><th>File / service</th><th>Owner</th><th>Licence</th><th>Retrieved</th><th>CRS</th><th>Status</th></tr></thead>
        <tbody>
          {SOURCES.map((s) => (
            <tr key={s.name}><td>{s.name}</td><td><code>{s.file}</code></td><td>{s.owner}</td><td>{s.licence}</td><td>{s.date}</td><td>{s.crs}</td><td>{s.status}</td></tr>
          ))}
        </tbody>
      </table>
      <p className="note">
        Full details: <code>docs/DATA_CATALOG.md</code> (catalog + data dictionary). Ask of every source: who made it and why,
        when, at what scale, under what licence, and who is missing from it.
      </p>
    </section>
  );
}
