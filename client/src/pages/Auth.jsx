import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { useTheme } from '../theme';
export default function Auth({ mode }) {
  const reg = mode === 'register';
  const { login, register } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { reg ? await register(f.name, f.email, f.password) : await login(f.email, f.password); nav('/home'); }
    catch (er) { setErr(er.message); }
    setBusy(false);
  };
  return (
    <div className="authwrap">
      <section>
        <Link to="/" className="logo" style={{ padding: 0, textDecoration: 'none' }}>Praxis</Link>
        <h1 className="big" style={{ fontSize: 44 }}>Give your people knowledge, and your agents permission.</h1>
        <p className="muted">Courses built by AI, actions approved by you, every step on record.</p>
      </section>
      <section>
        <form className="stack" onSubmit={submit}>
          <h2>{reg ? 'Create your account' : 'Welcome back'}</h2>
          {reg && <label className="f">Full name<input className="input" required value={f.name} onChange={set('name')} /></label>}
          <label className="f">Email<input className="input" type="email" required value={f.email} onChange={set('email')} /></label>
          <label className="f">Password<input className="input" type="password" required minLength={6} value={f.password} onChange={set('password')} /></label>
          {err && <div className="err" role="alert">{err}</div>}
          <button className="btn" disabled={busy}>{busy ? 'Please wait…' : reg ? 'Sign up' : 'Sign in'}</button>
          <div className="muted small">{reg ? 'Already have an account? ' : 'New here? '}<Link className="gold" to={reg ? '/login' : '/register'}>{reg ? 'Sign in' : 'Create an account'}</Link></div>
          <button type="button" className="btn ghost" onClick={toggle}>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
        </form>
      </section>
    </div>
  );
}
