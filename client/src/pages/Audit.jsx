import { useEffect, useState } from 'react';
import { api } from '../api';
export default function Audit() {
  const [rows, setRows] = useState(null);
  useEffect(() => { api('/audit').then(setRows); }, []);
  return (
    <>
      <h1>Connectors and audit</h1>
      <div className="grid4">{[['Invoices', 'Read'], ['CRM notes', 'Read and write notes'], ['Email', 'Draft and send (simulated)']].map(([n, r]) => <div key={n} className="card"><b>{n}</b><div className="ok small">Connected</div><div className="muted small">{r}</div></div>)}</div>
      <div className="card"><h3 style={{ marginBottom: 8 }}>Audit log</h3>
        {!rows ? <span className="muted">Loading…</span> : <div style={{ overflowX: 'auto' }}><table><thead><tr><th>Time</th><th>Agent</th><th>Action</th><th>By</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r._id}><td>{new Date(r.createdAt).toLocaleString()}</td><td>{r.agent}</td><td>{r.action}</td><td>{r.by}</td></tr>)}</tbody></table></div>}</div>
    </>
  );
}
