# Praxis: AI Learning Platform + Action Hub (MERN + Groq)

Sign up, sign in, sign out, dark/light mode, AI course studio, AI tutor, and an approval-based action hub with an audit log.
Everything runs on free tiers.

## Free services you need
1. **Node.js 18+**
2. **MongoDB**: local install, or free MongoDB Atlas M0 cluster (copy its connection string)
3. **Groq API key** (free): https://console.groq.com (API Keys > Create)

## Run it
```bash
# Terminal 1: backend
cd server
npm install
cp .env.example .env      # then edit: MONGO_URI, JWT_SECRET, GROQ_API_KEY
npm run dev

# Terminal 2: frontend
cd client
npm install
npm run dev               # open http://localhost:5173
```
Never commit `.env` or paste real keys in chat or screenshots.

## Pages
Landing, Sign up, Sign in, Home, Command center (action hub), Course studio, Library, Course player + AI tutor, Analytics, Connectors and audit, Settings.

## How it works
- `server/routes/auth.js`: register, login, logout, JWT guard. Passwords hashed with bcrypt.
- `server/llm.js`: Groq (OpenAI-compatible, model `llama-3.3-70b-versatile`, change with `GROQ_MODEL`).
- `server/routes/api.js`: courses (generate, quiz scores, tutor), hub (plan, approve, reject), audit, analytics, settings.
- Action hub tools are built-in demo connectors (invoices, CRM notes, simulated email). Add real MCP or API tools in the `TOOLS` object in `api.js`. Writes follow your approval policy from Settings.
- Frontend: Vite + React, theme via CSS variables in `client/src/styles.css`.

## Deploy free
Frontend on Vercel/Netlify (set a rewrite of `/api` to your backend), backend on Render free tier, database on Atlas M0.
