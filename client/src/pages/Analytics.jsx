import { useEffect, useState } from 'react';
import { api } from '../api';
import { Stat } from '../ui';
export default function Analytics() {
  const [a, setA] = useState(null);
  useEffect(() => { api('/analytics').then(setA); }, []);
  if (!a) return <p className="muted">Loading…</p>;
  return (
    <>
      <h1>Analytics</h1>
      <div className="grid4"><Stat l="Courses" v={a.courses} /><Stat l="Lessons done" v={a.lessonsDone} /><Stat l="Avg quiz score" v={a.avgScore + '%'} /><Stat l="Actions approved" v={`${a.approved} / ${a.actions}`} /></div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(320px,100%),1fr))' }}>
        <div className="card"><h3 style={{ marginBottom: 16 }}>Completion by course</h3>
          {!a.perCourse.length ? <span className="muted">No courses yet.</span> : <div className="row" style={{ alignItems: 'flex-end', height: 190, flexWrap: 'nowrap' }}>
            {a.perCourse.map((c, k) => <div key={k} style={{ flex: 1, textAlign: 'center' }} title={c.title}><div style={{ height: Math.max(c.pct * 1.5, 4), background: 'var(--gold)', borderRadius: '6px 6px 0 0' }} /><div className="muted small">{c.pct}%</div></div>)}</div>}</div>
        <div className="card"><h3>Weakest quiz results</h3>
          {!a.weak.length ? <p className="muted">Take a quiz to see results here.</p> : <table><tbody>{a.weak.map((w, k) => <tr key={k}><td>{w.lesson}<div className="muted small">{w.title}</div></td><td className="gold" style={{ textAlign: 'right' }}>{w.pct}%</td></tr>)}</tbody></table>}</div>
      </div>
    </>
  );
}