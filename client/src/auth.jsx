import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';
const A = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('token')) return setReady(true);
    api('/auth/me').then((d) => setUser(d.user)).catch(() => localStorage.removeItem('token')).finally(() => setReady(true));
  }, []);
  const done = (d) => { localStorage.setItem('token', d.token); setUser(d.user); };
  const value = {
    user, ready, setUser,
    login: async (email, password) => done(await api('/auth/login', { method: 'POST', body: { email, password } })),
    register: async (name, email, password) => done(await api('/auth/register', { method: 'POST', body: { name, email, password } })),
    logout: async () => { try { await api('/auth/logout', { method: 'POST' }); } catch {} localStorage.removeItem('token'); setUser(null); },
  };
  return <A.Provider value={value}>{children}</A.Provider>;
}
export const useAuth = () => useContext(A);
