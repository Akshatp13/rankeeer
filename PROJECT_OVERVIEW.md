# RankRise AI — Complete Project Overview

> A gamified, AI-powered competitive exam preparation platform built as a Hackathon project.
> Share this file with any AI chatbot to give it full context of the project.

---

## 1. Project Summary

**RankRise AI** is a full-stack web application that helps students prepare for competitive exams (JEE, NEET, UPSC, CAT, etc.) using AI-driven tools. It combines:
- AI-powered test generation and analysis
- Weakness detection and smart revision
- Rank prediction
- A Duolingo-style gamification system (XP, streaks, leagues, leaderboards)
- An AI chat mentor

---

## 2. Tech Stack

### Frontend (frontend/)
| Layer | Technology |
|-------|-----------|
| Framework | React 18 (Vite) |
| Routing | React Router v6 |
| State Management | Redux Toolkit + React Redux |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| 3D / Background | Three.js, @react-three/fiber, @react-three/drei |
| Charts | Recharts |
| Icons | Lucide React |
| PDF Support | pdfjs-dist |
| HTTP Client | Axios |

### Backend (backend/)
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ESM modules) |
| Framework | Express.js |
| Auth & Database | Supabase (PostgreSQL + Auth) |
| AI Model | Groq SDK — llama-3.3-70b-versatile |
| Vision Model | Groq — llama-3.2-11b-vision-preview |
| Dev Server | Nodemon |

---

## 3. Environment Variables (backend/.env)

```
PORT=5000
SUPABASE_URL=https://uoacfnlcojjupjczrmab.supabase.co
SUPABASE_KEY=your_supabase_key_here
GROQ_API_KEY=your_groq_api_key_here
```

---

## 4. Project Structure

```
Rank_rise_ai/
├── frontend/                        # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx                # Root — routing + auth guards
│   │   ├── main.jsx               # React DOM entry point
│   │   ├── index.css              # Global styles
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Landing/marketing page
│   │   │   ├── Login.jsx          # Login form (Supabase auth)
│   │   │   ├── Register.jsx       # Registration form
│   │   │   ├── ExamCatalog.jsx    # Onboarding — pick target exam
│   │   │   ├── Dashboard.jsx      # Main dashboard (XP, streak, stats)
│   │   │   ├── TestGenerator.jsx  # AI test generation (subject/difficulty)
│   │   │   ├── ExamSimulator.jsx  # Full mock exam simulator (timer, scoring)
│   │   │   ├── WeaknessDetection.jsx  # AI weakness analysis + improvement plan
│   │   │   ├── SmartRevision.jsx  # AI revision sheets + flashcards + quiz
│   │   │   ├── RankPredictor.jsx  # AI rank prediction based on mock scores
│   │   │   ├── Chat.jsx           # AI chat page (uses ConversationSidebar)
│   │   │   └── Settings.jsx       # User settings (theme, exam, profile)
│   │   ├── components/
│   │   │   ├── Sidebar.jsx            # Navigation sidebar
│   │   │   ├── Topbar.jsx             # Top navigation bar
│   │   │   ├── AIChat.jsx             # AI mentor chat component
│   │   │   ├── ConversationSidebar.jsx# Chat conversation history sidebar
│   │   │   ├── CustomCursor.jsx       # Custom animated cursor
│   │   │   ├── FuturisticButton.jsx   # Reusable styled button
│   │   │   ├── BackgroundEffect.jsx   # Subtle background animation
│   │   │   └── UniverseBackground.jsx # 3D starfield background (Three.js)
│   │   ├── context/
│   │   │   └── ThemeContext.jsx       # Dark/light theme context
│   │   └── redux/
│   │       └── (auth slice + store)   # Redux auth state management
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                        # Node.js + Express backend
│   ├── server.js                  # Express app entry — mounts all routes
│   ├── .env                       # Environment variables (not committed)
│   ├── config/
│   │   └── supabase.js            # Supabase client initialization
│   ├── controllers/
│   │   ├── authController.js      # register + login via Supabase auth
│   │   ├── chatController.js      # General AI chat (conversational assistant)
│   │   └── aiController.js        # All AI features (9 functions)
│   ├── routes/
│   │   ├── authRoutes.js          # POST /api/auth/register, /login
│   │   ├── chatRoutes.js          # POST /api/chat/message
│   │   └── aiRoutes.js            # POST /api/ai/* (9 protected routes)
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT protect middleware (Supabase token)
│   └── package.json
│
└── package.json                   # Root — concurrently runs client + server
```

---

## 5. API Routes

### Auth Routes (`/api/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user via Supabase Auth |
| POST | `/api/auth/login` | Login — returns user + JWT token |

### Chat Routes (`/api/chat`)
| Method | Path | Description | Auth? |
|--------|------|-------------|-------|
| POST | `/api/chat/message` | General conversational AI chat | No |

### AI Routes (`/api/ai`) — All require Bearer token
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/chat` | AI Study Mentor chat (exam-aware) |
| POST | `/api/ai/study-plan` | Generate personalized day-by-day study plan |
| POST | `/api/ai/analyze-exam` | Rank prediction + performance analysis |
| POST | `/api/ai/generate-test` | Generate MCQ test by subject/difficulty |
| POST | `/api/ai/generate-mock` | Generate full mock exam paper |
| POST | `/api/ai/generate-test-from-notes` | Generate test from uploaded notes (text or image) |
| POST | `/api/ai/detect-weakness` | Analyze weak topics + improvement strategy |
| POST | `/api/ai/generate-revision-sheet` | Generate HTML revision sheet for a topic |
| POST | `/api/ai/revise-from-notes` | Convert notes → summary + flashcards + mindmap + quiz |

---

## 6. Core Features (Detailed)

### 6.1 Authentication
- **Provider**: Supabase Auth (email + password)
- **Flow**: Register → email verification (if enabled) → JWT token stored in Redux
- **Protection**: All `/api/ai/*` routes require `Authorization: Bearer <token>`
- **Onboarding**: New users are redirected to `/exam-catalog` to pick their target exam

### 6.2 Test Generator (`/test-gen`)
- User selects: exam, subject, difficulty (Easy/Medium/Hard), number of questions
- Calls `POST /api/ai/generate-test`
- Returns JSON with questions, options (0-indexed correct), and explanations
- Also supports "Generate from Notes" — user pastes text or uploads image → AI extracts content and creates test

### 6.3 Exam Simulator (`/simulator`)
- Full timed mock exam experience
- Marking scheme: +4 correct, -1 wrong, 0 unattempted
- Results analyzed by `POST /api/ai/analyze-exam` → HTML rank prediction report

### 6.4 Weakness Detection (`/weakness`)
- Takes student's test history (weak topics, subject stats, total tests)
- Calls `POST /api/ai/detect-weakness`
- Returns HTML with prioritized improvement strategy

### 6.5 Smart Revision (`/revision`)
- Two modes:
  1. **By Topic**: Select exam → subject → topic → get HTML revision sheet
  2. **From Notes**: Upload text/image notes → get summary, flashcards, mindmap, quiz (JSON)
- Vision model (`llama-3.2-11b-vision-preview`) used for image OCR

### 6.6 Rank Predictor (`/predictor`)
- Input: mock test score, subject-wise breakdown, time taken
- Returns HTML analysis: estimated rank range, college predictions, category cutoffs

### 6.7 AI Chat (`/chat`)
- Two chat systems:
  1. **General Chat** (`chatController.js`): Witty conversational assistant via `/api/chat/message`
  2. **AI Mentor** (`aiController.js → chatWithMentor`): Exam-specific tutor via `/api/ai/chat`
- Conversation history maintained client-side
- Model: `llama-3.3-70b-versatile`, temperature: 0.85

### 6.8 Dashboard (`/dashboard`)
- XP system, daily streak tracking
- Performance charts (Recharts)
- League/leaderboard display
- Quick links to all features

---

## 7. AI Model Configuration

| Setting | Value |
|---------|-------|
| Provider | Groq |
| Primary Model | `llama-3.3-70b-versatile` |
| Vision Model | `llama-3.2-11b-vision-preview` |
| Temperature | 0.7–0.85 (feature-dependent) |
| Max Tokens | 1024 (chat), 4000 (test/plan generation) |
| Frequency Penalty | 0.4 |
| Presence Penalty | 0.4 |

All AI responses are exam-aware — the student's `selectedExam` (JEE, NEET, UPSC, etc.) is injected into every system prompt to tailor content.

---

## 8. Frontend Routing

```
/               → redirect to /login
/login          → Login page (public)
/register       → Register page (public)
/home           → Landing page (public)
/exam-catalog   → Exam selection onboarding (private)
/dashboard      → Main dashboard (private)
/weakness       → Weakness Detection (private)
/revision       → Smart Revision (private)
/predictor      → Rank Predictor (private)
/test-gen       → Test Generator (private)
/simulator      → Exam Simulator (private)
/chat           → AI Chat (private)
/settings       → User Settings (private)
```

All private routes are guarded by `PrivateRoute` — redirects unauthenticated users to `/login`.
New users without a `selectedExam` are redirected to `/exam-catalog` first.

---

## 9. Redux State Shape

```js
store = {
  auth: {
    user: {
      _id,
      name,
      email,
      token,         // Supabase JWT
      selectedExam,  // e.g. "JEE Main", "NEET", "UPSC"
      isNewUser
    },
    isAuthenticated: boolean,
    loading: boolean,
    error: string | null
  }
}
```

---

## 10. Running the Project

```bash
# Root — runs both client and server concurrently
npm run dev

# Server only (port 5000)
cd server && npm run dev

# Client only (port 5173 via Vite)
cd client && npm run dev
```

Health check: `GET http://localhost:5000/api/health`

---

## 11. Key Design Patterns

- **ESM modules** throughout (both client and server use `"type": "module"`)
- **Exam context injection**: Every AI call receives `selectedExam` from Redux state to personalize responses
- **JSON-only AI responses** for structured data (tests, plans); HTML responses for rich display (analysis, revision sheets)
- **Image OCR pipeline**: `notesImage` (base64) → vision model → extracted text → text model → structured output
- **AnimatePresence** wraps all page transitions (Framer Motion fade)
- **ThemeContext** controls dark/light mode globally

---

## 12. Supported Exams (Configurable)

JEE Main, JEE Advanced, NEET, UPSC, CAT, GATE, SSC CGL, RRB NTPC, CLAT, NDA, and others.
The `selectedExam` string flows through to every AI prompt — the system works for any exam named by the user.
