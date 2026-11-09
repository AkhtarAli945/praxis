import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
export default function Studio() {
  const nav = useNavigate();
  const [f, setF] = useState({ topic: '', level: 'Beginner', notes: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const file = (e) => { const x = e.target.files[0]; if (!x) return; const r = new FileReader(); r.onload = () => setF((p) => ({ ...p, notes: String(r.result).slice(0, 6000) })); r.readAsText(x); };
  const go = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { const c = await api('/courses/generate', { method: 'POST', body: f }); nav('/course/' + c._id); }
    catch (er) { setErr(er.message); setBusy(false); }
  };
  return (
    <>
      <h1>Course studio</h1>
      <form className="card stack" style={{ maxWidth: 680 }} onSubmit={go}>
        <label className="f">Topic<input className="input" required placeholder="e.g. Customer onboarding basics" value={f.topic} onChange={set('topic')} /></label>
        <label className="f">Level<select className="input" value={f.level} onChange={set('level')}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
        <label className="f">Notes (optional, paste text or upload a .txt/.md file)<textarea className="input" value={f.notes} onChange={set('notes')} /></label>
        <input type="file" accept=".txt,.md" onChange={file} aria-label="Upload notes" />
        {err && <div className="err" role="alert">{err}</div>}
        <button className="btn" disabled={busy}>{busy ? 'Generating course… (10 to 30 seconds)' : 'Generate course'}</button>
      </form>
    </>
  );
}
