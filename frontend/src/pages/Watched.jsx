import "../css/Favourite.css";
import { useMovieContext } from "../contexts/MovieContext.jsx";
import MovieCard from "../components/movieCard.jsx";
import { useNavigate } from "react-router-dom";

function Watched() {
  const navigate = useNavigate();
  const { watchedMovies } = useMovieContext();

  const watchedOnly = Array.isArray(watchedMovies) ? watchedMovies : [];
  const watchedMovieList = watchedOnly.filter(m => (m.mediaType || 'movie') === 'movie');
  const watchedTvList = watchedOnly.filter(m => (m.mediaType || 'movie') === 'tv');

  if (Array.isArray(watchedMovies) && watchedMovies.length > 0) {
    return (
      <div className="favorites">
        <button onClick={() => navigate(-1)}>Back</button>
        <h2>Already Watched</h2>

        {watchedMovieList.length ? (
          <>
            <h3 className="favorites-sectionTitle">Movies</h3>
            <div className="movie-grid">
              {watchedMovieList.map((movie) => (
                <MovieCard movie={movie} key={movie.id} />
              ))}
            </div>
          </>
        ) : null}

        {watchedTvList.length ? (
          <>
            <h3 className="favorites-sectionTitle">TV Series</h3>
            <div className="movie-grid">
              {watchedTvList.map((movie) => (
                <MovieCard movie={movie} key={movie.id} />
              ))}
            </div>
          </>
        ) : null}
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
