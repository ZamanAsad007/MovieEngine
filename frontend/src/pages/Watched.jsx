import "../css/Favourite.css";
import { useMovieContext } from "../contexts/MovieContext.jsx";
import MovieCard from "../components/movieCard.jsx";
import { useNavigate } from "react-router-dom";

function Watched() {
  const navigate = useNavigate();
  const { watchedMovies } = useMovieContext();

  if (Array.isArray(watchedMovies) && watchedMovies.length > 0) {
    return (
      <div className="favorites">
        <button onClick={() => navigate(-1)}>Back</button>
        <h2>Already Watched</h2>
        <div className="movie-grid">
          {watchedMovies.map((movie) => (
            <MovieCard movie={movie} key={movie.id} />
          ))}
        </div>
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
