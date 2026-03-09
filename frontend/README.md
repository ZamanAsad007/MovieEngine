# MovieBookmark

A React movie browsing app powered by the [TMDB API](https://www.themoviedb.org/). Browse popular movies, search by title, and save your favourites — all persisted in your browser's local storage.

**Live site:** https://zamanasad007.github.io/MovieEngine/

---

## Features

- **Popular movies** — loads the current trending movies from TMDB on launch
- **Search** — search movies by title in real time
- **Favourites** — add/remove movies from a personal favourites list with a ❤ button
- **Persistent favourites** — favourites are stored in `localStorage` and survive page refreshes
- **Fixed navbar** — always-visible navigation between Home and Favourites
- **Responsive grid** — movie cards adapt from a single column on mobile up to a multi-column grid on wider screens

---

## Tech stack

| Layer | Technology |
|---|---|
| UI | React 19 |
| Routing | React Router v7 |
| Build | Vite 5 |
| State | React Context API |
| Persistence | Browser `localStorage` |
| Data | TMDB REST API |
| CI/CD | GitHub Actions → GitHub Pages |

---

## Project structure

```
frontend/
├── public/
│   └── 404.html          # SPA fallback for GitHub Pages routing
├── src/
│   ├── components/
│   │   ├── NavBar.jsx     # Fixed top navigation bar
│   │   └── movieCard.jsx  # Movie card with poster, title, year and ❤ button
│   ├── contexts/
│   │   └── MovieContext.jsx  # Global favourites state (Context + localStorage)
│   ├── css/               # Per-component CSS files
│   ├── pages/
│   │   ├── Home.jsx       # Popular movies + search
│   │   └── Favourite.jsx  # Saved favourites list
│   ├── services/
│   │   └── Api.js         # TMDB API helpers (getPopularMovies, searchMovies)
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

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/ZamanAsad007/MovieEngine.git
cd MovieEngine

# 2. Create your local env file
cp frontend/.env.example frontend/.env
# Edit frontend/.env and set your key:
# VITE_TMDB_API_KEY=your_key_here

# 3. Install dependencies
npm install --prefix frontend

# 4. Start the dev server
npm --prefix frontend run dev
```

Open http://localhost:5173/ in your browser.

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

## Deployment (GitHub Pages)

The repository includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml` that automatically builds and deploys the site on every push to `main`.

### One-time repository setup

1. Go to **Settings → Pages** and set Source to **GitHub Actions**
2. Go to **Settings → Secrets and variables → Actions** and add:
   - Name: `VITE_TMDB_API_KEY`
   - Value: your TMDB API key

After that, any push to `main` triggers a deploy to https://zamanasad007.github.io/MovieEngine/.
