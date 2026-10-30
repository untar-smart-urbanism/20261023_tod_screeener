import { useEffect, useMemo, useState } from "react";
import { computeScenario, stationList, fmtIdr, fmtM } from "../data.js";
import { settings } from "../../config/settings.js";
import { useScenario } from "../scenario.js";
import { apiEnabled, fetchSites } from "../api.js";
import { rankedToCsv } from "../../analysis/report.js";
import ScenarioControls from "../components/ScenarioControls.jsx";

function download(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

export default function Results() {
  const [scenario, setScenario] = useScenario(stationList.map((s) => s.id));
  const { stationId, radiusM } = scenario;
  const local = useMemo(() => computeScenario({ stationId, radiusM }), [stationId, radiusM]);

  // One request, end to end: station + radius → GET /api/sites → JSON → table. Falls back to the files.
  const [api, setApi] = useState({ status: "off" });
  useEffect(() => {
    if (!apiEnabled || stationId === "all") return setApi({ status: "off" });
    const ctrl = new AbortController();
    setApi({ status: "loading" });
    fetchSites(stationId, radiusM, { signal: ctrl.signal })
      .then((body) => setApi({ status: "ok", body }))
      .catch((err) => err.name !== "AbortError" && setApi({ status: "error", message: err.message }));
    return () => ctrl.abort();
  }, [stationId, radiusM]);

  const fromApi = api.status === "ok";
  const ranked = fromApi ? api.body.ranked : local.result.ranked;
  const excludedN = fromApi ? api.body.excluded.length : local.result.excluded.length;
  const unpriced = fromApi ? api.body.unpriced : local.result.unpriced.map((r) => r.id);
  const inPlay = local.rows.length;
  const pricedInPlay = local.rows.filter((r) => r.pricePerM2 != null).length;
  const { transit: wT, cost: wC } = settings.weights;
  const top = ranked[0];
  const method = `${radiusM} m straight-line (Haversine) to nearest station; S = (${wT}T + ${wC}C)/${wT + wC}; asking prices`;
  const sourceLabel = fromApi
    ? `API ${settings.dataApiUrl}/sites (${api.body.source.dataset}, ${api.body.source.status}, ${api.body.source.retrieved})`
    : `file data/sample/properties.geojson (${settings.dataStatus.toLowerCase()}, ${settings.dataDate})`;

  return (
    <section>
      <p className="kicker">Results page · <span className="badge">{settings.dataStatus}</span> <span className="badge">ILLUSTRATIVE WEIGHTS</span></p>
      <h1>Suitability scores for {ranked.length} sites within {radiusM} m</h1>
      <ScenarioControls stations={stationList} scenario={scenario} onChange={setScenario} />
      <ol className="steps">
        <li><b>Normalise</b> T = 1 − d/{radiusM}; C = (pmax − p)/(pmax − pmin)</li>
        <li><b>Weight</b> wT = {wT}, wC = {wC}</li>
        <li><b>Exclude</b> d &gt; {radiusM} m → out ({excludedN}); no price → not scored ({unpriced.length}{unpriced.length ? `: ${unpriced.join(", ")}` : ""})</li>
        <li><b>Score</b> S = (wT·T + wC·C)/(wT + wC)</li>
        <li><b>Rank</b> by S; ≈ marks a gap &lt; 0.02 to the next site</li>
        <li><b>Sensitivity</b> see <a href="#/sensitivity">Sensitivity</a></li>
      </ol>
      <table>
        <thead><tr><th>Rank</th><th>ID</th><th>Type</th><th>Nearest</th><th>d</th><th>T</th><th>Asking / m²</th><th>C</th><th>S</th></tr></thead>
        <tbody>
          {ranked.map((r) => (
            <tr key={r.id}>
              <td>{r.rank}{r.closeToNext ? " ≈" : ""}</td><td>{r.id}</td><td>{r.type}</td><td>{r.nearestStation}</td>
              <td>{fmtM(r.stationDistanceM)}</td><td>{r.T.toFixed(2)}</td><td>{fmtIdr(r.pricePerM2)}</td>
              <td>{r.C.toFixed(2)}</td><td><b>{r.S.toFixed(2)}</b></td>
            </tr>
          ))}
          {ranked.length === 0 && <tr><td colSpan="9" className="missing">No priced site within {radiusM} m.</td></tr>}
        </tbody>
      </table>
      <p className="source-line">
        {pricedInPlay} of {inPlay} priced (asking) · {ranked.length} scored · Source: {sourceLabel}
        {api.status === "loading" && " · loading from API…"}
        {api.status === "error" && ` · API unavailable (${api.message}), showing file data`}
      </p>
      <p>
        <button
          className="btn"
          disabled={ranked.length === 0}
          onClick={() => download(`tod-shortlist_${stationId}_${radiusM}m.csv`, rankedToCsv(ranked, {
            dataStatus: settings.dataStatus, method, source: sourceLabel, retrieved: settings.dataDate, crs: "EPSG:4326",
          }))}
        >
          Export CSV
        </button>
      </p>
      {top && (
        <p className="note">
          Hand check {top.id}: T = 1 − {Math.round(top.stationDistanceM)}/{radiusM} = {top.T.toFixed(2)} ·
          C = {top.C.toFixed(2)} · S = ({wT}×{top.T.toFixed(2)} + {wC}×{top.C.toFixed(2)})/{wT + wC} = {top.S.toFixed(2)}
          {stationId !== "all" && " · C is relative to this station's candidates only"}
        </p>
      )}

      <div className="fac">
        <div>
          <h4>Facts</h4>
          <p>Verifiable, with a source and date.</p>
          <ul>
            <li>{stationList.length} station points (synthetic file, {settings.dataDate})</li>
            {top && <li>{top.id} asking price {fmtIdr(top.pricePerM2)}/m² (listing)</li>}
          </ul>
        </div>
        <div>
          <h4>Assumptions</h4>
          <p>Taken as true without proof here.</p>
          <ul><li>A1 {radiusM} m straight line ≈ walkable</li><li>A3 asking price/m² ≈ relative land cost</li></ul>
        </div>
        <div>
          <h4>Choices</h4>
          <p>Decided by the analyst.</p>
          <ul><li>Weights {wT} : {wC}</li><li>Min–max normalisation for cost</li><li>Unpriced sites excluded</li></ul>
        </div>
        <div>
          <h4>Results</h4>
          <p>Follow from the three columns on the left.</p>
          <ul>
            {top ? <li>{top.id} ranks 1st (S = {top.S.toFixed(2)})</li> : <li>No ranking</li>}
            <li>Valid only if the facts and assumptions hold and the choices are accepted.</li>
          </ul>
        </div>
      </div>

      <div className="limits">
        <h3>What the score is not</h3>
        <ul>
          <li>Not a valuation, a feasibility verdict or a recommendation. The model ranks; a professional recommends.</li>
          <li>Compensatory model: a cheap site can offset a distant one. Min–max C changes when the candidate set changes.</li>
          <li>Missing ≠ zero · asking ≠ transaction · correlation ≠ causation · output ≠ recommendation.</li>
          <li>{settings.dataStatus === "SYNTHETIC" ? "Synthetic data: the ranking means nothing about real properties." : "Check DATA_CATALOG.md for source dates and licences."}</li>
        </ul>
      </div>
    </section>
  );
}
