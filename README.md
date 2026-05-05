# MovieEngine

A full‑stack movie browsing app powered by the [TMDB API](https://www.themoviedb.org/). Browse popular movies, search by title, and manage your bookmarks/watched list with an authenticated account.

> Note: The app currently uses **Bookmarks** (instead of Favourites). “Favourites” will be implemented later.

**Live site:** https://movie-engine-five.vercel.app

**Backend API:** https://movieengine.onrender.com

---

## Features

- **Browse movies & TV shows** — browse popular/top-rated movies and TV shows from TMDB
- **Search** — search movies and TV shows by title with toggle between media types
- **Detail pages** — comprehensive movie/TV show details including cast, crew, trailers, and ratings
  - Dual routing: `/movie/:id` for movies, `/tv/:id` for TV shows
  - Director/Creator shown first in cast carousel
  - YouTube trailer embedding with intelligent fallback selection
  - Seasons count for TV shows, episode runtime display
- **Multi-source ratings** — show IMDb, Rotten Tomatoes, and Metacritic ratings via OMDb API
- **Auth** — email/password login + Google OAuth
- **Bookmarks** — add/remove bookmarks (stored in MongoDB per user)
- **Watched** — mark items watched and view watched list
- **Scroll restoration** — back navigation returns to previous scroll position
- **AI Recommender (Movies + TV)** — ask Gemini 2.5 Flash for personalized recommendations based on mood/genre/theme
  - Floating animated button with pulse rings (bottom-right corner)
  - Persistent chat sidebar with conversation history
  - JWT-protected endpoint with rate limiting (10 requests per 15 minutes)
  - Auto-expand hint on load to prompt user engagement
  - Mobile optimized with responsive sizing
- **Mobile optimized** — responsive design with 2 columns (phone) / 4 columns (tablet)
  - Always-visible action buttons on mobile
  - Hamburger menu with outside-click detection
  - Stack-friendly form layouts on small screens

---

## Tech stack

| Layer | Technology |
|---|---|
| UI | React 19 |
| Routing | React Router v7 |
| Build | Vite 5 |
| State | React Context API |
| Backend | Node.js + Express |
| AI | Google Gemini 2.5 Flash |
| Auth | Passport (Local + Google OAuth) + JWT |
| Database | MongoDB Atlas + Mongoose |
| Data | TMDB REST API |
| Hosting | Vercel (frontend) + Render (backend) |

---

## Project structure

```
backend/
├── config/
│   └── passport.js
├── controllers/
├── middleware/
├── models/
├── routes/
└── server.js

frontend/
├── public/
│   └── 404.html          # SPA fallback (client-side routing)
├── src/
│   ├── components/
│   │   ├── NavBar.jsx              # Fixed top navigation bar with hamburger menu
│   │   ├── movieCard.jsx           # Movie/TV card with poster, title, year, actions
│   │   ├── ScrollRestoration.jsx   # Session-based scroll position memory
│   │   ├── AuthRequiredModal.jsx   # Auth prompt modal
│   │   ├── FloatingAI.jsx          # Floating animated button with pulse rings for AI recommender
│   │   ├── AIChatSidebar.jsx       # Chat sidebar for AI conversation & movie recommendations
│   │   └── Footer.jsx              # Site footer with links
│   ├── contexts/
│   │   ├── MovieContext.jsx        # Global bookmarks/watched state
│   │   ├── AuthContext.jsx         # Auth state (user, tokens)
│   │   └── UiContext.jsx           # UI state (modals, etc.)
│   ├── css/                        # Per-component CSS files + responsive breakpoints
│   │   ├── FloatingAI.css          # Floating button animations (bounce, pulse, expand)
│   │   └── AIChatSidebar.css       # Sidebar chat UI
│   ├── pages/
│   │   ├── Home.jsx                # Popular/top-rated movies + search with type toggle
│   │   ├── MovieDetail.jsx         # Movie/TV show detail page (supports both via mediaType prop)
│   │   ├── Favourite.jsx           # Saved bookmarks list
│   │   ├── Watched.jsx             # Watched items list
│   │   ├── Login.jsx               # Login page
│   │   ├── Register.jsx            # Signup page
│   │   └── About.jsx, Privacy.jsx, Terms.jsx  # Info pages
│   ├── services/
│   │   ├── Api.js                  # TMDB API helpers (movies, TV, details, ratings)
│   │   ├── aiApi.js                # Gemini AI recommendation endpoint communication
│   │   └── backendApi.js           # Backend auth/user API helpers
│   ├── backend/
│   │   ├── controllers/
│   │   │   └── aiController.js     # AI recommendation logic & Gemini response parsing
│   │   ├── middleware/
│   │   │   └── rateLimiter.js      # express-rate-limit configuration for AI & general routes
│   │   ├── routes/
│   │   │   └── ai.js               # POST /api/ai/recommend with auth & rate limit
│   │   └── services/
│   │       └── geminiService.js    # Gemini API calls with system prompt & history
│   ├── App.jsx                     # Route definitions (including /movie/:id and /tv/:id)
│   └── main.jsx                    # React entry point
├── .env.example                    # Environment variable template
└── vite.config.js
```

---

## Local setup

### Prerequisites

- Node.js 20+
- A free [TMDB API key](https://www.themoviedb.org/settings/api)
- A MongoDB connection string (Atlas or local)

### Steps

```bash
# 1) Backend
cd backend
npm install

# Create backend/.env (copy keys from backend/.env.example if you have one)
# Required: MONGO_URI, JWT_SECRET, SESSION_SECRET
# For AI (Gemini): GEMINI_API_KEY
# For Google OAuth (optional locally): GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

npm start

# 2) Frontend (new terminal)
cd ../frontend
npm install

# Create frontend/.env
# Required: VITE_TMDB_API_KEY
# Optional: VITE_BACKEND_URL=http://localhost:5000 (default: http://localhost:5000)
# Optional: VITE_OMDB_API_KEY (for multi-source ratings on detail pages)

npm run dev
```

Open the Vite URL shown in the terminal (usually http://localhost:5173).

---

## Available scripts

Run these from the `frontend/` directory (or use the `--prefix frontend` flag from the repo root):

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build into `frontend/dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Deployment notes

- **Frontend (Vercel):** set `VITE_TMDB_API_KEY` and optionally `VITE_BACKEND_URL=https://movieengine.onrender.com`, `VITE_OMDB_API_KEY`.
- **Backend (Render):** set `MONGO_URI`, `JWT_SECRET`, `SESSION_SECRET`, `FRONTEND_ORIGIN=https://movie-engine-five.vercel.app`.
- **Gemini API (Backend):** set `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/apikey) with billing enabled.
- **Google OAuth:** in Google Cloud Console add Authorized redirect URI:
   - `https://movieengine.onrender.com/api/auth/google/callback`

## API Integration

- **TMDB** — all movie/TV show data, credits, videos, external IDs
- **OMDb** — supplementary ratings (IMDb, Rotten Tomatoes, Metacritic) on detail pages
- **Gemini** — AI-powered movie + TV recommendations based on user mood/preferences (JWT-protected, rate-limited)
- **Backend** — user auth, bookmarks, watched lists (MongoDB)
