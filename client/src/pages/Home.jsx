import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { Stat, Bar } from '../ui';
export default function Home() {
  const { user } = useAuth();
  const [a, setA] = useState(null);
  const [cs, setCs] = useState([]);
  useEffect(() => { api('/analytics').then(setA); api('/courses').then(setCs); }, []);
  const cur = cs.find((c) => c.completed.length < c.lessons.length);
  return (
    <>
      <h1>Assalam o Alaikum, {user.name}</h1>
      <div className="card hero">
        {cur ? <><div><div className="muted small">Continue learning</div><h2>{cur.title}</h2><div className="muted small">Lesson {cur.completed.length + 1} of {cur.lessons.length}</div></div><Link className="btn" to={`/course/${cur._id}`}>Resume lesson</Link></>
          : <><div><h2>Create your first course</h2><div className="muted">Give a topic or upload notes and AI builds it.</div></div><Link className="btn" to="/studio">Open course studio</Link></>}
      </div>
      {a && <div className="grid4"><Stat l="Courses" v={a.courses} /><Stat l="Lessons done" v={a.lessonsDone} /><Stat l="Avg quiz score" v={a.avgScore + '%'} /><Stat l="Agent actions" v={a.actions} /></div>}
      {cs.length > 0 && <><h3>Your courses</h3><div className="grid">{cs.slice(0, 4).map((c) => { const p = Math.round(c.completed.length / c.lessons.length * 100); return <Link key={c._id} to={`/course/${c._id}`} className="card stack" style={{ textDecoration: 'none', gap: 10 }}><b>{c.title}</b><Bar pct={p} /><span className="muted small">{p}% complete</span></Link>; })}</div></>}
    </>
  );
}
