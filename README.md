# MovieEngine

A full‑stack movie browsing app powered by the [TMDB API](https://www.themoviedb.org/). Browse popular movies and TV shows, search by title, manage your bookmarks/watched list with an authenticated account, and share public profiles.

> Note: The app currently uses **Bookmarks** (instead of Favourites). “Favourites” will be implemented later.

**Live site:** https://movie-engine-five.vercel.app

**Backend API:** https://movieengine.onrender.com

---

## Features

- **Infinite scroll** — browse popular/top-rated results with Intersection Observer loading
- **Search** — search movies and TV shows by title
- **Auth** — email/password login + Google OAuth
- **Email verification** — email/password accounts must verify before login
- **Profile management** — edit name, username, avatar, and password
- **Public profiles** — share a public profile page at `/u/:username`
- **Bookmarks** — add/remove bookmarks (stored in MongoDB per user)
- **Watched** — mark items watched and view watched list

---

## Tech stack

| Layer | Technology |
|---|---|
| UI | React 19 |
| Routing | React Router v7 |
| Build | Vite 5 |
| State | React Context API |
| Backend | Node.js + Express |
| Auth | Passport (Local + Google OAuth) + JWT + email verification |
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
├── services/
└── server.js

frontend/
├── public/
│   └── 404.html          # SPA fallback (client-side routing)
├── src/
│   ├── components/
│   │   ├── NavBar.jsx     # Fixed top navigation bar
│   │   └── movieCard.jsx  # Movie card with poster, title, year and bookmark button
│   ├── contexts/
│   │   └── MovieContext.jsx  # Global bookmarks state (Context + localStorage)
│   ├── css/               # Per-component CSS files
│   ├── pages/
│   │   ├── Home.jsx       # Infinite scroll + search for movies/TV
│   │   ├── Favourite.jsx  # Saved bookmarks list
│   │   ├── Login.jsx      # Login + resend verification for unverified accounts
│   │   ├── Register.jsx   # Register + email verification prompt
│   │   ├── ProfileEdit.jsx # Edit profile, avatar, and password
│   │   ├── PublicProfile.jsx # Public share page
│   │   ├── VerifyEmail.jsx # Email verification status page
│   │   └── ResendVerification.jsx # Resend verification form
│   ├── services/
│   │   ├── Api.js         # TMDB API helpers (paged results + search)
│   │   └── userApi.js     # Profile API helpers
│   ├── App.jsx            # Route definitions
│   └── main.jsx           # React entry point
├── .env.example           # Environment variable template
└── vite.config.js
```

---

## Local setup

### Prerequisites

- Node.js 20+
- A free [TMDB API key](https://www.themoviedb.org/settings/api)
- A MongoDB connection string (Atlas or local)
- A Gmail account with an app password if you want email verification locally

### Steps

```bash
# 1) Backend
cd backend
npm install

# Create backend/.env (copy keys from backend/.env.example if you have one)
# Required: MONGO_URI, JWT_SECRET, SESSION_SECRET, EMAIL_USER, EMAIL_PASS, FRONTEND_URL, BACKEND_URL
# For Google OAuth (optional locally): GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

npm start

# 2) Frontend (new terminal)
cd ../frontend
npm install

# Create frontend/.env
# Required: VITE_TMDB_API_KEY
# Optional: VITE_BACKEND_URL=http://localhost:5000

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

- **Frontend (Vercel):** set `VITE_TMDB_API_KEY` and (optionally) `VITE_BACKEND_URL=https://movieengine.onrender.com`.
- **Backend (Render):** set `MONGO_URI`, `JWT_SECRET`, `SESSION_SECRET`, `FRONTEND_ORIGIN=https://movie-engine-five.vercel.app`, `FRONTEND_URL=https://movie-engine-five.vercel.app`, `BACKEND_URL=https://movieengine.onrender.com`, `EMAIL_USER`, and `EMAIL_PASS`.
- **Google OAuth:** in Google Cloud Console add Authorized redirect URI:
   - `https://movieengine.onrender.com/api/auth/google/callback`

## Authentication flow

- Email/password accounts are created in an unverified state.
- A verification email is sent after registration with a 24-hour link.
- Unverified email/password accounts cannot log in until they confirm their email.
- Google OAuth accounts bypass email verification and log in normally.
- The nav bar profile dropdown links to profile editing and public sharing.
