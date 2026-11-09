import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Bar } from '../ui';
export default function Library() {
  const [cs, setCs] = useState(null);
  const [q, setQ] = useState('');
  useEffect(() => { api('/courses').then(setCs); }, []);
  if (!cs) return <p className="muted">Loading…</p>;
  const list = cs.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1>Course library</h1>
        <div className="row"><input className="input" style={{ width: '100%', maxWidth: 240 }} aria-label="Search courses" placeholder="Search courses" value={q} onChange={(e) => setQ(e.target.value)} /><Link className="btn" to="/studio">New course</Link></div>
      </div>
      {!list.length ? <div className="card muted">No courses yet. Create one in the course studio.</div> :
        <div className="grid">{list.map((c) => { const p = Math.round(c.completed.length / c.lessons.length * 100); return (
          <Link key={c._id} to={`/course/${c._id}`} className="card stack" style={{ textDecoration: 'none', gap: 10 }}>
            <span className="muted small">{c.level}</span><b>{c.title}</b><Bar pct={p} /><span className="muted small">{p}% complete</span>
          </Link>); })}</div>}
    </>
  );
}
