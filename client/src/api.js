export async function api(path, opts = {}) {
  const t = localStorage.getItem('token');
  const r = await fetch((import.meta.env.VITE_API_URL || '') + '/api' + path, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (r.status === 401 && t) { localStorage.removeItem('token'); location.href = '/login'; }
    throw new Error(d.error || 'Something went wrong');
  }
  return d;
}
