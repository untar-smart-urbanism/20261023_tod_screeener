import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, ScaleControl } from "react-leaflet";
import { computeScenario, stationList, fmtIdr, fmtM } from "../data.js";
import { settings } from "../../config/settings.js";
import { useScenario } from "../scenario.js";
import ScenarioControls from "../components/ScenarioControls.jsx";
import {
  scoreColor, SCORE_CLASSES, EXCLUDED_STYLE, UNPRICED_STYLE, STATION_STYLE, BUFFER_STYLE, TILE_LAYER,
} from "../../maps/layers.js";

// Every analytical map shows: legend · source & date · CRS · synthetic/real label · scale bar · method note.
function markerStyle(r, scoreById) {
  if (r.pricePerM2 == null) return UNPRICED_STYLE;
  const s = scoreById[r.id];
  if (!s) return EXCLUDED_STYLE;
  return { color: "#fff", weight: 1, fillColor: scoreColor(s.S), fillOpacity: 0.95 };
}

export default function MapPage() {
  const [scenario, setScenario] = useScenario(stationList.map((s) => s.id));
  const { stationId, radiusM } = scenario;
  const { rows, scoreById, result } = useMemo(() => computeScenario({ stationId, radiusM }), [stationId, radiusM]);
  const shownStations = stationList.filter((s) => stationId === "all" || s.id === stationId);

  return (
    <section>
      <p className="kicker">Map / spatial page</p>
      <h1>Suitability of sites within {radiusM} m of {stationId === "all" ? "a station" : shownStations[0].name}</h1>
      <ScenarioControls stations={stationList} scenario={scenario} onChange={setScenario} />
      <div className="map-wrap">
        <MapContainer center={settings.mapCenter} zoom={settings.mapZoom} className="map">
          <TileLayer url={TILE_LAYER.url} attribution={TILE_LAYER.attribution} />
          <ScaleControl position="bottomleft" metric imperial={false} />
          {shownStations.map((s) => (
            <Circle key={`b-${s.id}`} center={[s.coordinates[1], s.coordinates[0]]} radius={radiusM} pathOptions={BUFFER_STYLE} />
          ))}
          {shownStations.map((s) => (
            <CircleMarker key={s.id} center={[s.coordinates[1], s.coordinates[0]]} {...STATION_STYLE}>
              <Popup>{s.name} ({settings.dataStatus.toLowerCase()})</Popup>
            </CircleMarker>
          ))}
          {rows.map((r) => {
            const s = scoreById[r.id];
            return (
              <CircleMarker key={r.id} center={[r.coordinates[1], r.coordinates[0]]} radius={6} pathOptions={markerStyle(r, scoreById)}>
                <Popup>
                  <strong>{r.id}</strong> · {r.type}<br />
                  Asking price / m²: {fmtIdr(r.pricePerM2)}<br />
                  Listed: {r.listing_date}<br />
                  Nearest: {r.nearestStation}, {fmtM(r.stationDistanceM)} (straight line)
                  {r.nearBoundary && <><br /><em>Near boundary (±{settings.nearBoundaryMetres} m)</em></>}
                  <br />
                  {s ? <>Rank {s.rank} · S = {s.S.toFixed(2)} (T {s.T.toFixed(2)}, C {s.C.toFixed(2)})</>
                    : r.pricePerM2 == null ? "No asking price — not scored" : `Outside ${radiusM} m — excluded`}
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
        <div className="legend">
          <strong>Suitability score S</strong>
          {SCORE_CLASSES.map((c) => (
            <div key={c.label}><span style={{ background: c.color }} /> {c.label}</div>
          ))}
          <div><span style={{ background: EXCLUDED_STYLE.fillColor }} /> Outside {radiusM} m — excluded</div>
          <div><span className="hollow" /> No asking price — not scored</div>
          <div><span className="ring" /> {radiusM} m straight-line buffer</div>
          <div><span style={{ background: STATION_STYLE.fillColor }} /> Station</div>
          <p className="legend-meta">
            <b className="badge">{settings.dataStatus}</b><br />
            Source: course team sample, {settings.dataDate}<br />
            CRS: {settings.crs}
          </p>
        </div>
      </div>
      <p className="note">
        Method: {radiusM} m straight-line distance to nearest station; S = (2T + C) / 3 with asking prices;
        weights illustrative. {result.ranked.length} scored, {result.excluded.length} outside, {result.unpriced.length} unpriced inside.
        Straight line ≠ walking route (assumption A1).
      </p>
    </section>
  );
}
