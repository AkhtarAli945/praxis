export const Stat = ({ l, v }) => (
  <div className="card"><div className="muted small">{l}</div><div style={{ fontSize: 28, fontWeight: 600, marginTop: 6 }}>{v}</div></div>
);
export const Bar = ({ pct }) => <div className="bar"><i style={{ width: pct + '%' }} /></div>;
