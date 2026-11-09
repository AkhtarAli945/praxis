import { Link } from 'react-router-dom';
import { useTheme } from '../theme';
export default function Landing() {
  const { theme, toggle } = useTheme();
  const F = ({ n, t, d }) => <div className="card"><div className="gold" style={{ fontFamily: 'Fraunces,serif', fontSize: 36 }}>{n}</div><h3 style={{ margin: '8px 0' }}>{t}</h3><p className="muted small" style={{ margin: 0 }}>{d}</p></div>;
  return (
    <div className="land">
      <nav>
        <div className="logo" style={{ padding: 0 }}>Praxis</div>
        <div className="row">
          <button className="btn ghost" onClick={toggle}>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
          <Link className="btn ghost" to="/login">Sign in</Link>
          <Link className="btn" to="/register">Get started free</Link>
        </div>
      </nav>
      <section className="stack" style={{ maxWidth: 780, gap: 22 }}>
        <div className="gold small" style={{ letterSpacing: '.16em' }}>WHERE LEARNING BECOMES ACTION</div>
        <h1 className="big">The workspace that teaches your team and does the work.</h1>
        <p className="muted" style={{ fontSize: 19, margin: 0 }}>AI agents build courses from your notes, tutor every learner, and take approved actions across your business tools.</p>
        <div className="row"><Link className="btn" to="/register">Start free</Link><Link className="btn ghost" to="/login">Sign in</Link></div>
      </section>
      <section className="grid">
        <F n="01" t="Course studio" d="Give a topic or upload notes. AI writes lessons and quizzes for you." />
        <F n="02" t="Action hub" d="Ask in plain Urdu or English. Agents plan the steps and wait for your approval." />
        <F n="03" t="Trust by design" d="Approval policy, and a full audit trail for every action." />
      </section>
    </div>
  );
}
