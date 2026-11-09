import { Router } from 'express';
import { guard } from './auth.js';
import { llm } from '../llm.js';
import { Course, Invoice, Note, Audit, Action } from '../models.js';

const r = Router();
const h = (fn) => (req, res) => fn(req, res).catch((e) => res.status(500).json({ error: e.message }));
r.use(guard);

// Shared language rule: answer in the language and script of the user's message
const LANG = `LANGUAGE RULE: Detect the language and script of the user's latest message and reply in exactly that. English question: English answer. Urdu written in Urdu script: answer in Urdu script. Urdu written in English letters (Roman Urdu, for example "kyun", "kitne", "hai"): answer in simple Roman Urdu. Never switch to Hindi (Devanagari), Turkish, or any other language the user did not use.`;

/* ---------- Courses ---------- */
r.get('/courses', h(async (req, res) => res.json(await Course.find({ owner: req.user._id }).sort('-createdAt'))));
r.get('/courses/:id', h(async (req, res) => {
  const c = await Course.findOne({ _id: req.params.id, owner: req.user._id });
  c ? res.json(c) : res.status(404).json({ error: 'Course not found' });
}));

async function askJson(messages) {
  for (let i = 0; i < 3; i++) {
    try {
      return JSON.parse(await llm(messages, { json: true }));
    } catch (e) {
      if (i === 2) throw e;
      await new Promise((resolve) => setTimeout(resolve, 4000));
    }
  }
}

r.post('/courses/generate', h(async (req, res) => {
  const { topic, level = 'Beginner', notes = '' } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic is required' });
  const src = notes.slice(0, 5000);
  const lang = 'Write in the language and script of the topic (English: English; Urdu script: Urdu; Roman Urdu: Roman Urdu). Never use Hindi (Devanagari) or Turkish unless the topic is in that language.';

  // Step 1: outline with 4 lesson titles
  const outline = await askJson([
    { role: 'system', content: `You are a curriculum designer. Reply with JSON only: {"title":string,"lessons":[string,string,string,string]}. "lessons" is exactly 4 lesson titles that together cover the whole source notes in a logical order. ${lang}` },
    { role: 'user', content: `Topic: ${topic}\nLevel: ${level}\nSource notes: ${src}` },
  ]);
  const titles = (outline.lessons || []).map((t) => (typeof t === 'string' ? t : t?.title)).filter(Boolean).slice(0, 4);
  while (titles.length < 4) titles.push(`${topic} - part ${titles.length + 1}`);
  const title = outline.title || topic;

  // Step 2: one call per lesson, so there are always 4 lessons with 2 questions each
  const lessons = [];
  for (let i = 0; i < 4; i++) {
    let lesson = null;
    for (let attempt = 0; attempt < 3 && !lesson; attempt++) {
      const l = await askJson([
        { role: 'system', content: `You write ONE lesson. Reply with JSON only: {"content":string,"quiz":[{"q":string,"options":[string,string,string,string],"answer":number},{"q":string,"options":[string,string,string,string],"answer":number}]}. "content" is 120-180 words of plain text and must use the exact facts, numbers and deadlines from the source notes that belong to this lesson. Exactly 2 quiz questions with 4 options each; "answer" is the 0-based index of the correct option. ${lang}` },
        { role: 'user', content: `Course: ${title}\nLesson ${i + 1} of 4: ${titles[i]}\nAll lessons: ${titles.join('; ')}\nSource notes: ${src}` },
      ]);
      const quiz = (l.quiz || []).filter((q) => q && q.q && Array.isArray(q.options) && q.options.length >= 2 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length).slice(0, 2);
      if (typeof l.content === 'string' && l.content.length > 40 && quiz.length === 2) lesson = { title: titles[i], content: l.content, quiz };
    }
    if (!lesson) throw new Error(`Could not generate lesson ${i + 1}. Please try again.`);
    lessons.push(lesson);
  }

  const c = await Course.create({ owner: req.user._id, topic, level, notes: src, title, lessons });
  await Audit.create({ owner: req.user._id, agent: 'Course agent', action: 'Generated course: ' + c.title, by: req.user.name });
  res.json(c);
}));

r.post('/courses/:id/complete', h(async (req, res) => {
  const { lesson, correct, total } = req.body;
  const c = await Course.findOne({ _id: req.params.id, owner: req.user._id });
  if (!c.completed.includes(lesson)) c.completed.push(lesson);
  c.scores.push({ lesson, correct, total });
  await c.save();
  res.json(c);
}));

r.post('/courses/:id/tutor', h(async (req, res) => {
  const c = await Course.findOne({ _id: req.params.id, owner: req.user._id });
  const answer = await llm([
    { role: 'system', content: `You are a friendly tutor. Answer only from the course content and source notes below; if the answer is not there, say so politely. Keep answers short and clear.\n${LANG}\n\nCOURSE: ${c.title}\n` + c.lessons.map((l, i) => `Lesson ${i + 1} ${l.title}: ${l.content}`).join('\n\n') + (c.notes ? '\n\nSOURCE NOTES:\n' + c.notes : '') },
    { role: 'user', content: req.body.question },
  ]);
  res.json({ answer });
}));

/* ---------- Action hub (built-in demo connectors) ---------- */
const TOOLS = {
  find_overdue_invoices: { write: false, run: async (u) => ({ invoices: await Invoice.find({ owner: u._id, daysOverdue: { $gt: 0 } }).select('client number amount daysOverdue -_id').lean() }) },
  draft_email: { write: true, policy: 'email', run: async (_u, a) => ({ sent: true, to: a.client, subject: a.subject, body: a.body }) },
  add_crm_note: { write: true, policy: 'crm', run: async (u, a) => { await Note.create({ owner: u._id, client: a.client, text: a.text }); return { saved: true, client: a.client }; } },
};
const AGENT = { find_overdue_invoices: 'Finance agent', draft_email: 'Email agent', add_crm_note: 'CRM agent' };

async function runAction(user, action, approvedBy) {
  for (const s of action.steps) {
    if (s.status === 'done' || s.status === 'rejected') continue;
    s.result = await TOOLS[s.tool].run(user, s.args || {});
    s.status = 'done';
    await Audit.create({ owner: user._id, agent: AGENT[s.tool], action: s.tool.replace(/_/g, ' '), by: approvedBy });
  }
  action.status = 'done';
  action.markModified('steps');
  await action.save();
}

r.get('/hub/actions', h(async (req, res) => res.json(await Action.find({ owner: req.user._id }).sort('-createdAt').limit(20))));

r.post('/hub/ask', h(async (req, res) => {
  const u = req.user;
  const prompt = (req.body.prompt || '').trim();
  if (!prompt) return res.status(400).json({ error: 'Write a request first' });
  const inv = await Invoice.find({ owner: u._id }).lean();
  const out = await llm([
    { role: 'system', content: `You are an operations agent. Tools: find_overdue_invoices {}, draft_email {client,subject,body}, add_crm_note {client,text}. Known invoices: ${JSON.stringify(inv.map((i) => ({ client: i.client, number: i.number, amount: i.amount, daysOverdue: i.daysOverdue })))}. Reply JSON only: {"reply":string,"steps":[{"tool":string,"args":object}]}. Use only these tools and at most 4 steps. Write "reply" and any email or note text in the language the user wrote the request in.\n${LANG}` },
    { role: 'user', content: prompt },
  ], { json: true });
  const d = JSON.parse(out);
  const steps = (d.steps || []).filter((s) => TOOLS[s.tool]).slice(0, 4).map((s) => {
    const t = TOOLS[s.tool];
    const needs = t.write ? u.policy[t.policy] : !u.policy.readAuto;
    return { tool: s.tool, args: s.args || {}, write: t.write, status: needs ? 'needs_approval' : 'queued' };
  });
  const a = await Action.create({ owner: u._id, prompt, reply: d.reply, steps, status: steps.some((s) => s.status === 'needs_approval') ? 'pending' : 'queued' });
  if (a.status === 'queued') await runAction(u, a, 'Auto (your policy)');
  res.json(a);
}));

r.post('/hub/actions/:id/approve', h(async (req, res) => {
  const a = await Action.findOne({ _id: req.params.id, owner: req.user._id });
  if (!a || a.status === 'done') return res.status(400).json({ error: 'Nothing to approve' });
  await runAction(req.user, a, req.user.name);
  res.json(a);
}));

r.post('/hub/actions/:id/reject', h(async (req, res) => {
  const a = await Action.findOne({ _id: req.params.id, owner: req.user._id });
  a.steps.forEach((s) => { if (s.status !== 'done') s.status = 'rejected'; });
  a.status = 'rejected';
  a.markModified('steps');
  await a.save();
  await Audit.create({ owner: req.user._id, agent: 'Action hub', action: 'Rejected: ' + a.prompt.slice(0, 60), by: req.user.name });
  res.json(a);
}));

/* ---------- Audit, analytics, settings ---------- */
r.get('/audit', h(async (req, res) => res.json(await Audit.find({ owner: req.user._id }).sort('-createdAt').limit(50))));

r.get('/analytics', h(async (req, res) => {
  const cs = await Course.find({ owner: req.user._id });
  const acts = await Action.find({ owner: req.user._id });
  const sc = cs.flatMap((c) => c.scores.map((s) => ({ ...s.toObject(), c })));
  const tot = sc.reduce((a, s) => a + s.total, 0);
  const cor = sc.reduce((a, s) => a + s.correct, 0);
  res.json({
    courses: cs.length,
    lessonsDone: cs.reduce((a, c) => a + c.completed.length, 0),
    avgScore: tot ? Math.round((cor / tot) * 100) : 0,
    actions: acts.length,
    approved: acts.filter((a) => a.status === 'done').length,
    perCourse: cs.map((c) => ({ title: c.title, pct: Math.round((c.completed.length / Math.max(c.lessons.length, 1)) * 100) })),
    weak: sc.filter((s) => s.total > 0).map((s) => ({ title: s.c.title, lesson: s.c.lessons[s.lesson]?.title, pct: Math.round((s.correct / s.total) * 100) })).sort((a, b) => a.pct - b.pct).slice(0, 5),
  });
}));

r.get('/settings', h(async (req, res) => res.json({ name: req.user.name, email: req.user.email, policy: req.user.policy })));
r.put('/settings', h(async (req, res) => {
  const u = req.user;
  if (req.body.name) u.name = req.body.name;
  if (req.body.policy) Object.assign(u.policy, req.body.policy);
  await u.save();
  res.json({ name: u.name, email: u.email, policy: u.policy });
}));

export default r;