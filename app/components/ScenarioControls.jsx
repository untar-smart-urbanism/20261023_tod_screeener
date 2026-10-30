import { useState, useEffect } from "react";
import { RADIUS_LIMITS } from "../scenario.js";

// Planner picks a station and a radius. Invalid input is rejected in parseScenario(), not here only.
export default function ScenarioControls({ stations, scenario, onChange }) {
  const [radius, setRadius] = useState(String(scenario.radiusM));
  useEffect(() => setRadius(String(scenario.radiusM)), [scenario.radiusM]);

  return (
    <form
      className="controls"
      onSubmit={(e) => {
        e.preventDefault();
        onChange({ radius });
      }}
    >
      <label>
        Station
        <select value={scenario.stationId} onChange={(e) => onChange({ station: e.target.value })}>
          <option value="all">All stations</option>
          {stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
      <label>
        Radius (m, straight line)
        <input
          type="number" min={RADIUS_LIMITS.min} max={RADIUS_LIMITS.max} step="50"
          value={radius} onChange={(e) => setRadius(e.target.value)}
        />
      </label>
      <button type="submit">Apply</button>
      {scenario.errors.map((m) => <p key={m} className="error">{m}</p>)}
    </form>
  );
}
