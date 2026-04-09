import "../css/Favourite.css";
import { useMovieContext } from "../contexts/MovieContext.jsx";
import MovieCard from "../components/movieCard.jsx";
import { useNavigate } from "react-router-dom";

function Favorites() {
  const navigate = useNavigate();
  const { favorites } = useMovieContext();

  const favMovies = (Array.isArray(favorites) ? favorites : []).filter(m => (m.mediaType || 'movie') === 'movie');
  const favTv = (Array.isArray(favorites) ? favorites : []).filter(m => (m.mediaType || 'movie') === 'tv');

  if (Array.isArray(favorites) && favorites.length > 0) {
    return (
      <div className="favorites">
        <button onClick={() => navigate(-1)}>Back</button>
        <h2>Your Bookmarks</h2>

        {favMovies.length ? (
          <>
            <h3 className="favorites-sectionTitle">Movies</h3>
            <div className="movie-grid">
              {favMovies.map((movie) => (
                <MovieCard movie={movie} key={movie.id} />
              ))}
            </div>
          </>
        ) : null}

        {favTv.length ? (
          <>
            <h3 className="favorites-sectionTitle">TV Series</h3>
            <div className="movie-grid">
              {favTv.map((movie) => (
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
      <h2>No bookmark Movies or TV shows Yet</h2>
      <p>Start adding movies and TV shows to your bookmarks and they will appear here!</p>
    </div>
  );
}

export default Favorites;