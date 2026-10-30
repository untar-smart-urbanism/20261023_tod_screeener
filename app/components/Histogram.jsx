// Distance distribution as SVG bars. Bands inside the radius use the score teal; "beyond" is grey.
export default function Histogram({ bands, title }) {
  const W = 560;
  const H = 220;
  const pad = { l: 36, r: 12, t: 28, b: 40 };
  const max = Math.max(1, ...bands.map((b) => b.count));
  const bw = (W - pad.l - pad.r) / bands.length;
  const y = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  return (
    <svg className="hist" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
      <text x={pad.l} y={16} fontSize="12" fill="#5f6b7a">{title}</text>
      <line x1={pad.l} x2={W - pad.r} y1={y(0)} y2={y(0)} stroke="#dde3ea" />
      {bands.map((b, i) => {
        const x = pad.l + i * bw + 6;
        const beyond = b.to === Infinity;
        return (
          <g key={b.label}>
            <rect x={x} y={y(b.count)} width={bw - 12} height={y(0) - y(b.count)} fill={beyond ? "#b8bec6" : "#2a7f9e"} rx="2" />
            <text x={x + (bw - 12) / 2} y={y(b.count) - 5} fontSize="12" textAnchor="middle" fill="#1f2933">{b.count}</text>
            <text x={x + (bw - 12) / 2} y={H - pad.b + 16} fontSize="11" textAnchor="middle" fill="#5f6b7a">{b.label}</text>
          </g>
        );
      })}
      <text x={W / 2} y={H - 6} fontSize="11" textAnchor="middle" fill="#5f6b7a">Straight-line distance to nearest station</text>
    </svg>
  );
}
