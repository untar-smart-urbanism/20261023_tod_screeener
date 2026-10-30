import { rows } from "../data.js";

export default function Home() {
  return (
    <section>
      <p className="kicker">Landing page</p>
      <h1>Which parcels near stations deserve a closer look for transit-oriented development?</h1>
      <p className="lead">
        For a <strong>district planning team</strong> that has to shortlist sites for detailed feasibility.
        The screener shows sample properties around stations, their asking price per m², and a first ranking.
      </p>
      <div className="cards">
        <a className="card" href="#/map"><h3>Map</h3><p>{rows.length} sites scored within 800 m of a station</p></a>
        <a className="card" href="#/analysis"><h3>Analysis</h3><p>Nearest-station distance and the 800 m flag</p></a>
        <a className="card" href="#/sources"><h3>Sources</h3><p>Where every dataset comes from</p></a>
        <a className="card" href="#/quality"><h3>Quality</h3><p>Fields, nulls, CRS and eight quality checks</p></a>
        <a className="card" href="#/results"><h3>Results</h3><p>Suitability scores, step by step</p></a>
        <a className="card" href="#/sensitivity"><h3>Sensitivity</h3><p>Which ranks hold when weights change</p></a>
      </div>
      <p className="note">
        Status: Meeting 3 verified analysis. Sample data are <strong>synthetic</strong>; replace them with a documented real dataset (see <code>docs/DATA_CATALOG.md</code>).
      </p>
    </section>
  );
}
