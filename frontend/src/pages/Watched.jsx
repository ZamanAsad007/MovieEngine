import "../css/Favourite.css";
import { useMovieContext } from "../contexts/MovieContext.jsx";
import MovieCard from "../components/movieCard.jsx";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

function Watched() {
  const navigate = useNavigate();
  const { watchedMovies } = useMovieContext();

  const [tab, setTab] = useState("movies");

  const watchedOnly = Array.isArray(watchedMovies) ? watchedMovies : [];
  const watchedMovieList = watchedOnly.filter(m => (m.mediaType || 'movie') === 'movie');
  const watchedTvList = watchedOnly.filter(m => (m.mediaType || 'movie') === 'tv');

  const activeList = useMemo(() => {
    return tab === "tv" ? watchedTvList : watchedMovieList;
  }, [tab, watchedMovieList, watchedTvList]);

  if (Array.isArray(watchedMovies) && watchedMovies.length > 0) {
    return (
      <div className="favorites">
        <button onClick={() => navigate(-1)}>Back</button>
        <h2>Already Watched</h2>

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
      <h2>No Watched Movies Yet</h2>
      <p>Mark movies as watched from your favourites.</p>
    </div>
  );
}

export default Watched;
