import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Invoice, Audit } from '../models.js';

const r = Router();
const sign = (u) => jwt.sign({ id: u.id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
const pub = (u) => ({ id: u.id, name: u.name, email: u.email, policy: u.policy });
const h = (fn) => (req, res) => fn(req, res).catch((e) => res.status(500).json({ error: e.message }));

export const guard = async (req, res, next) => {
  try {
    const t = (req.headers.authorization || '').slice(7);
    const { id } = jwt.verify(t, process.env.JWT_SECRET || 'dev-secret');
    req.user = await User.findById(id);
    if (!req.user) throw new Error('no user');
    next();
  } catch {
    res.status(401).json({ error: 'Please sign in' });
  }
};

r.post('/register', h(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ error: 'Name, email and a password of 6+ characters are required' });
  if (await User.findOne({ email })) return res.status(409).json({ error: 'This email is already registered' });
  const u = await User.create({ name, email, hash: await bcrypt.hash(password, 10) });
  await Invoice.insertMany([
    ['Al-Noor Traders', 'INV-1001', 185000, 14],
    ['Karachi Foods', 'INV-1002', 92000, 7],
    ['Sindh Logistics', 'INV-1003', 240000, 32],
  ].map(([client, number, amount, daysOverdue]) => ({ owner: u._id, client, number, amount, daysOverdue })));
  await Audit.create({ owner: u._id, agent: 'System', action: 'Workspace created', by: u.name });
  res.json({ token: sign(u), user: pub(u) });
}));

r.post('/login', h(async (req, res) => {
  const u = await User.findOne({ email: (req.body.email || '').toLowerCase().trim() });
  if (!u || !(await bcrypt.compare(req.body.password || '', u.hash)))
    return res.status(401).json({ error: 'Wrong email or password' });
  await Audit.create({ owner: u._id, agent: 'System', action: 'Signed in', by: u.name });
  res.json({ token: sign(u), user: pub(u) });
}));

r.get('/me', guard, (req, res) => res.json({ user: pub(req.user) }));
r.post('/logout', guard, h(async (req, res) => {
  await Audit.create({ owner: req.user._id, agent: 'System', action: 'Signed out', by: req.user.name });
  res.json({ ok: true });
}));

export default r;
