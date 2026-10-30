import { useMemo } from "react";
import { rows, stationList, validation, fmtIdr, fmtM, computeScenario } from "../data.js";
import { settings } from "../../config/settings.js";
import { useScenario } from "../scenario.js";
import { distanceHistogram, summariseByStation } from "../../analysis/aggregate.js";
import ScenarioControls from "../components/ScenarioControls.jsx";
import Histogram from "../components/Histogram.jsx";

export default function Analysis() {
  const [scenario, setScenario] = useScenario(stationList.map((s) => s.id));
  const { stationId, radiusM } = scenario;
  const inPlay = useMemo(() => computeScenario({ stationId, radiusM }).rows, [stationId, radiusM]);
  const inBuffer = inPlay.filter((r) => r.stationDistanceM <= radiusM);
  const priced = inPlay.filter((r) => r.pricePerM2 != null);
  const edges = [0, 1, 2, 3, 4].map((i) => Math.round((radiusM / 4) * i));
  const bands = distanceHistogram(inPlay.map((r) => r.stationDistanceM), edges);
  const byStation = summariseByStation(rows, stationList, radiusM);

  return (
    <section>
      <p className="kicker">Analysis page · <span className="badge">{settings.dataStatus}</span></p>
      <h1>Nearest-station distance and the {radiusM} m flag</h1>
      <ScenarioControls stations={stationList} scenario={scenario} onChange={setScenario} />
      <div className="stats">
        <div><b>{inPlay.length}</b> valid properties</div>
        <div><b>{validation.invalid.length}</b> rejected by coordinate checks</div>
        <div><b>{validation.duplicates.length}</b> duplicate positions</div>
        <div><b>{inBuffer.length}</b> within {radiusM} m</div>
        <div><b>{priced.length} of {inPlay.length}</b> priced</div>
      </div>

      <div className="two-col">
        <div>
          <Histogram bands={bands} title={`Records by distance band (n = ${inPlay.length})`} />
        </div>
        <div>
          <h3>Per station (all stations, within {radiusM} m)</h3>
          <table>
            <thead><tr><th>Station</th><th>Sites</th><th>Priced</th><th>Median asking / m²</th></tr></thead>
            <tbody>
              {byStation.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td><td>{s.within}</td><td>{s.priced}</td>
                  <td className={s.medianAskingPerM2 == null ? "missing" : ""}>{fmtIdr(s.medianAskingPerM2)} (n = {s.priced})</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="source-line">Aggregation hides variation and depends on the chosen units: report n, and do not read the median as a value.</p>
        </div>
      </div>

      <table>
        <thead>
          <tr><th>ID</th><th>Type</th><th>Floor area (m²)</th><th>Asking price / m²</th><th>Nearest station</th><th>Distance</th><th>Within {radiusM} m</th></tr>
        </thead>
        <tbody>
          {[...inPlay].sort((a, b) => a.stationDistanceM - b.stationDistanceM).map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td><td>{r.type}</td><td>{r.floor_area_m2}</td>
              <td className={r.pricePerM2 == null ? "missing" : ""}>{fmtIdr(r.pricePerM2)}</td>
              <td>{r.nearestStation}</td>
              <td>{fmtM(r.stationDistanceM)}</td>
              <td>{r.nearBoundary ? "Near boundary" : r.stationDistanceM <= radiusM ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="source-line">{priced.length} of {inPlay.length} priced (asking).</p>
      <p className="note">
        Method: straight-line (Haversine) distance in metres, <code>analysis/buffer.js</code>. Coordinate rules
        (range, study box, order, Null Island, CRS, duplicates) run first in <code>analysis/validate.js</code>.
        Results within ±{settings.nearBoundaryMetres} m of the threshold are flagged, not judged.
      </p>
    </section>
  );
}
