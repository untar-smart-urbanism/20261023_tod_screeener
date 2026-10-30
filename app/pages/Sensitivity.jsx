import { useMemo } from "react";
import { computeScenario, stationList } from "../data.js";
import { useScenario } from "../scenario.js";
import ScenarioControls from "../components/ScenarioControls.jsx";
import { settings } from "../../config/settings.js";
import { sensitivity } from "../../analysis/suitability.js";

const label = (moves) => (moves === 0 ? "stable" : `± ${moves}`);

export default function Sensitivity() {
  const [scenario, setScenario] = useScenario(stationList.map((s) => s.id));
  const { stationId, radiusM } = scenario;
  const rows = useMemo(() => computeScenario({ stationId, radiusM }).rows, [stationId, radiusM]);
  const table = sensitivity(rows, settings.sensitivityWeights, { radiusM });
  const sets = Object.keys(settings.sensitivityWeights);
  const stable = table.filter((r) => r.moves === 0).map((r) => r.id);
  return (
    <section>
      <p className="kicker">Sensitivity test · <span className="badge">{settings.dataStatus}</span></p>
      <h1>Change the weights: which ranks hold?</h1>
      <ScenarioControls stations={stationList} scenario={scenario} onChange={setScenario} />
      <table>
        <thead><tr><th>Site</th>{sets.map((s) => <th key={s}>{s} (transit : cost)</th>)}<th>Moves</th></tr></thead>
        <tbody>
          {table.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>{sets.map((s) => <td key={s}>{r.ranks[s]}</td>)}
              <td className={r.moves >= 3 ? "missing" : ""}>{label(r.moves)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="note">
        Stable under every weighting: {stable.join(", ") || "none"}. Sites that swap places should be reported as one tier,
        not a strict order. This tests weights only — not data errors or the {radiusM} m assumption.
      </p>
    </section>
  );
}
