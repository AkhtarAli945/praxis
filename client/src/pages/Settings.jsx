import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth';
import { useTheme } from '../theme';
export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [s, setS] = useState(null);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  useEffect(() => { api('/settings').then((d) => { setS(d); setName(d.name); }); }, []);
  if (!s) return <p className="muted">Loading…</p>;
  const save = async (body) => { const d = await api('/settings', { method: 'PUT', body }); setS(d); setUser({ ...user, name: d.name, policy: d.policy }); setMsg('Saved'); setTimeout(() => setMsg(''), 1500); };
  const T = ({ k, t, d }) => <label className="tg"><span>{t}<span className="muted small" style={{ display: 'block' }}>{d}</span></span><input type="checkbox" checked={s.policy[k]} onChange={(e) => save({ policy: { [k]: e.target.checked } })} /></label>;
  return (
    <>
      <h1>Settings</h1>
      <div className="card stack" style={{ maxWidth: 640 }}>
        <h3>Profile</h3>
        <label className="f">Name<input className="input" value={name} onChange={(e) => setName(e.target.value)} /></label>
        <div className="muted small">{s.email}</div>
        <div className="row"><button className="btn" onClick={() => save({ name })}>Save name</button>{msg && <span className="ok">{msg}</span>}</div>
      </div>
      <div className="card" style={{ maxWidth: 640 }}>
        <h3 style={{ marginBottom: 8 }}>Approval policy</h3>
        <T k="email" t="Require approval for emails" d="Agents draft, you approve" />
        <T k="crm" t="Require approval for CRM writes" d="Notes and status changes" />
        <T k="readAuto" t="Run read-only actions automatically" d="Lookups and reports" />
      </div>
      <div className="card row" style={{ maxWidth: 640 }}>
        <button className="btn ghost" onClick={toggle}>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</button>
        <button className="btn ghost" onClick={logout}>Sign out</button>
      </div>
    </>
  );
}
