import "../css/Favourite.css";
import { useMovieContext } from "../contexts/MovieContext.jsx";
import MovieCard from "../components/movieCard.jsx";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

function Favorites() {
  const navigate = useNavigate();
  const { favorites } = useMovieContext();

  const [tab, setTab] = useState("movies");

  const favMovies = (Array.isArray(favorites) ? favorites : []).filter(m => (m.mediaType || 'movie') === 'movie');
  const favTv = (Array.isArray(favorites) ? favorites : []).filter(m => (m.mediaType || 'movie') === 'tv');

  const activeList = useMemo(() => {
    return tab === "tv" ? favTv : favMovies;
  }, [tab, favMovies, favTv]);

  if (Array.isArray(favorites) && favorites.length > 0) {
    return (
      <div className="favorites">
        <button onClick={() => navigate(-1)}>Back</button>
        <h2>Your Bookmarks</h2>

        <div className="favorites-tabs">
          <button
            type="button"
            className={`favorites-tab ${tab === "movies" ? "active" : ""}`}
            onClick={() => setTab("movies")}
          >
            Movies
          </button>
          <button
            type="button"
            className={`favorites-tab ${tab === "tv" ? "active" : ""}`}
            onClick={() => setTab("tv")}
          >
            TV Shows
          </button>
        </div>

        <h3 className="favorites-sectionTitle">
          {tab === "tv" ? "TV Shows" : "Movies"}
        </h3>

        {activeList.length ? (
          <div className="movie-grid">
            {activeList.map((movie) => (
              <MovieCard movie={movie} key={movie.id} />
            ))}
          </div>
        ) : (
          <p style={{ textAlign: "center", opacity: 0.8 }}>
            No {tab === "tv" ? "TV shows" : "movies"} here yet.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="favorites-empty">
      <button onClick={() => navigate(-1)}>Back</button>
      <h2>No bookmark Movies or TV shows Yet</h2>
      <p>Start adding movies and TV shows to your bookmarks and they will appear here!</p>
    </div>
  );
}

export default Favorites;