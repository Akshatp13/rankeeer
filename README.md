# RankRise AI 🚀

> AI-powered gamified competitive exam preparation platform

---

## 📁 Project Structure

```
Rank_rise_ai/
├── backend/          → Node.js + Express API  → Deploy on Railway
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   ├── Procfile
│   ├── railway.toml
│   └── package.json
│
├── frontend/         → React + Vite App       → Deploy on Vercel
│   ├── src/
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json
│   └── package.json
│
├── .gitignore
└── package.json      → Local dev only (concurrently)
```

---

## 🛠️ Local Development

```bash
# 1. Install all dependencies
npm run install:all

# 2. Add your environment variables:
#    backend/.env  → PORT, SUPABASE_URL, SUPABASE_KEY, GROQ_API_KEY
#    frontend/.env → VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL

# 3. Run both servers simultaneously
npm run dev
```

Frontend: http://localhost:3000  
Backend:  http://localhost:5000

---

## 🌐 Deployment

### Backend → Railway

1. Go to [Railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select **only the `backend/` folder** as root directory (or set root in Railway settings)
3. Set these environment variables in Railway dashboard:
   - `PORT` = `5000`
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `GROQ_API_KEY`
   - `FRONTEND_URL` = your Vercel URL (e.g. `https://rankrise.vercel.app`)
4. Railway auto-detects `railway.toml` → starts with `node server.js`

### Frontend → Vercel

1. Go to [Vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set **Root Directory** to `frontend`
3. Framework: `Vite`
4. Set these environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` = your Railway backend URL (e.g. `https://rankrise-backend.up.railway.app`)
5. Deploy!

---

## ⚙️ Environment Variables

### `backend/.env` (never commit this!)
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GROQ_API_KEY=your_groq_key
FRONTEND_URL=http://localhost:3000
```

### `frontend/.env` (never commit this!)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
```

---

## 🧰 Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18, Vite, TailwindCSS       |
| Backend  | Node.js, Express.js               |
| Database | Supabase (PostgreSQL)             |
| AI       | Groq SDK (LLaMA 3)                |
| Auth     | Supabase Auth + JWT               |
| Deploy   | Vercel (frontend) + Railway (backend) |
