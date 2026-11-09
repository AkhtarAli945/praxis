import { useEffect, useState } from 'react';
import { api } from '../api';
const label = { needs_approval: 'Needs approval', queued: 'Queued', done: 'Done', rejected: 'Rejected' };
const cls = { needs_approval: 'gold', done: 'ok', rejected: 'bad' };
export default function Hub() {
  const [list, setList] = useState([]);
  const [p, setP] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const load = () => api('/hub/actions').then(setList);
  useEffect(() => { load(); }, []);
  const ask = async (e) => {
    e.preventDefault(); if (!p.trim()) return; setErr(''); setBusy(true);
    try { await api('/hub/ask', { method: 'POST', body: { prompt: p } }); setP(''); await load(); } catch (er) { setErr(er.message); }
    setBusy(false);
  };
  const act = async (id, what) => { try { await api(`/hub/actions/${id}/${what}`, { method: 'POST' }); await load(); } catch (er) { setErr(er.message); } };
  return (
    <div className="cols">
      <section className="stack">
        <h1>Command center</h1>
        <form className="row" onSubmit={ask}>
          <input className="input" style={{ flex: 1 }} aria-label="Ask the hub" placeholder="e.g. Overdue invoices dekho aur sab ko reminder bhejo" value={p} onChange={(e) => setP(e.target.value)} />
          <button className="btn" disabled={busy}>{busy ? 'Planning…' : 'Send'}</button>
        </form>
        {err && <div className="err" role="alert">{err}</div>}
        {!list.length && <div className="card muted">No requests yet. Try asking for overdue invoices.</div>}
        {list.map((a) => (
          <div key={a._id} className="card stack" style={{ gap: 8 }}>
            <div className="muted small">You asked</div><div>{a.prompt}</div>
            <div className="muted small">Agent plan</div><div>{a.reply}</div>
            <div>{a.steps.map((s, k) => (
              <div key={k} className="step"><span><b>{s.tool.replace(/_/g, ' ')}</b><span className="muted small" style={{ display: 'block' }}>{s.args && Object.values(s.args).join(' · ').slice(0, 140)}</span></span><span className={'pill ' + (cls[s.status] || '')}>{label[s.status]}</span></div>
            ))}</div>
            {a.status === 'pending' && <div className="row"><button className="btn" onClick={() => act(a._id, 'approve')}>Approve and run</button><button className="btn ghost" onClick={() => act(a._id, 'reject')}>Reject</button></div>}
          </div>
        ))}
      </section>
      <aside className="stack">
        <h3>Connected systems</h3>
        {['Invoices (demo data)', 'CRM notes', 'Email (simulated send)'].map((n) => <div key={n} className="card">{n}<div className="ok small">Connected</div></div>)}
        <p className="muted small">These are built-in demo connectors so the app runs free. Replace them with real MCP or API tools in server/routes/api.js.</p>
      </aside>
    </div>
  );
}
