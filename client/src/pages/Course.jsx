import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { Bar } from '../ui';
export default function Course() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [i, setI] = useState(0);
  const [ans, setAns] = useState({});
  const [res, setRes] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { api('/courses/' + id).then((d) => { setC(d); setI(Math.min(d.completed.length, d.lessons.length - 1)); }); }, [id]);
  if (!c) return <p className="muted">Loading…</p>;
  const L = c.lessons[i];
  const go = (n) => { setI(n); setAns({}); setRes(null); };
  const submit = async () => {
    const correct = L.quiz.filter((x, k) => ans[k] === x.answer).length;
    setRes({ correct, total: L.quiz.length });
    setC(await api(`/courses/${id}/complete`, { method: 'POST', body: { lesson: i, correct, total: L.quiz.length } }));
  };
  const ask = async (e) => {
    e.preventDefault(); if (!q.trim()) return;
    const question = q; setQ(''); setBusy(true); setMsgs((m) => [...m, { r: 'u', t: question }]);
    try { const d = await api(`/courses/${id}/tutor`, { method: 'POST', body: { question } }); setMsgs((m) => [...m, { r: 'a', t: d.answer }]); }
    catch (er) { setMsgs((m) => [...m, { r: 'a', t: er.message }]); }
    setBusy(false);
  };
  const pct = Math.round(c.completed.length / c.lessons.length * 100);
  return (
    <div className="cols">
      <section className="stack">
        <div className="muted small">{c.title} · Lesson {i + 1} of {c.lessons.length}</div>
        <h1>{L.title}</h1>
        <Bar pct={pct} />
        <div className="card" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{L.content}</div>
        <div className="card stack">
          <h3>Quick check</h3>
          {L.quiz.map((x, k) => (
            <fieldset key={k} style={{ border: 0, padding: 0, margin: 0 }} className="stack">
              <legend style={{ marginBottom: 8 }}>{x.q}</legend>
              {x.options.map((o, j) => (
                <label key={j} className="opt"><input type="radio" name={`q${k}`} checked={ans[k] === j} onChange={() => setAns({ ...ans, [k]: j })} />{o}</label>
              ))}
            </fieldset>
          ))}
          <div className="row"><button className="btn" onClick={submit} disabled={Object.keys(ans).length < L.quiz.length}>Submit answers</button>
            {res && <b className={res.correct === res.total ? 'ok' : 'gold'}>Score: {res.correct} / {res.total}</b>}</div>
        </div>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <button className="btn ghost" disabled={i === 0} onClick={() => go(i - 1)}>Previous</button>
          <button className="btn" disabled={i === c.lessons.length - 1} onClick={() => go(i + 1)}>Next lesson</button>
        </div>
      </section>
      <aside className="card stack">
        <h3>AI tutor</h3>
        <div className="stack" style={{ minHeight: 160 }}>
          <div className="msg a">Is course ke content se kuch bhi poochein.</div>
          {msgs.map((m, k) => <div key={k} className={'msg ' + m.r}>{m.t}</div>)}
          {busy && <div className="msg a muted">Thinking…</div>}
        </div>
        <form className="row" onSubmit={ask}><input className="input" style={{ flex: 1 }} aria-label="Ask the tutor" placeholder="Sawal likhein" value={q} onChange={(e) => setQ(e.target.value)} /><button className="btn">Ask</button></form>
      </aside>
    </div>
  );
}
