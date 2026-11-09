import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth';
import { useTheme } from './theme';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Hub from './pages/Hub';
import Studio from './pages/Studio';
import Library from './pages/Library';
import Course from './pages/Course';
import Analytics from './pages/Analytics';
import Audit from './pages/Audit';
import Settings from './pages/Settings';

const nav = [['/home', 'Home'], ['/hub', 'Command center'], ['/studio', 'Course studio'], ['/library', 'Library'], ['/analytics', 'Analytics'], ['/audit', 'Connectors & audit'], ['/settings', 'Settings']];

const Burger = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
const Cross = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>;

function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);
  return (
    <div className="shell">
      <header className="topbar">
        <button className="menu-btn" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}><Burger /></button>
        <div className="logo">Praxis</div>
      </header>
      {open && <div className="backdrop" onClick={() => setOpen(false)} />}
      <aside className={'side' + (open ? ' open' : '')}>
        <div className="drawer-head">
          <div className="logo">Praxis</div>
          <button className="menu-btn close" aria-label="Close menu" onClick={() => setOpen(false)}><Cross /></button>
        </div>
        {nav.map(([to, l]) => <NavLink key={to} to={to} className={({ isActive }) => 'nav' + (isActive ? ' on' : '')}>{l}</NavLink>)}
        <div className="grow" />
        <div className="muted small" style={{ padding: '0 4px' }}>{user.name}</div>
        <button className="btn ghost" onClick={toggle}>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
        <button className="btn ghost" onClick={logout}>Sign out</button>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  );
}

function Guard() {
  const { user, ready } = useAuth();
  if (!ready) return <div className="center muted">Loading…</div>;
  return user ? <Layout /> : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Auth mode="login" />} />
      <Route path="/register" element={user ? <Navigate to="/home" replace /> : <Auth mode="register" />} />
      <Route element={<Guard />}>
        <Route path="/home" element={<Home />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/library" element={<Library />} />
        <Route path="/course/:id" element={<Course />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}