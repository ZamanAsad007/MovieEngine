import '../css/MovieCard.css'
import { useMovieContext } from "../contexts/MovieContext.jsx";

function MovieCard({ movie }) {
    const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext()
    const movieId = movie?.id
    const favorite = movieId ? isFavorite(movieId) : false
    const posterUrl = movie?.posterUrl ?? (movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null)

    function onFavoriteClick(e) {
        e?.preventDefault?.()
        if (!movieId) return
        if (favorite) removeFromFavorites(movieId)
        else addToFavorites(movie)
    }

    if (!movie) return null
    return (
        <div className="movie-card">
            {posterUrl ? <img src={posterUrl} alt={movie.title} /> : null}
            <h3>{movie.title}</h3>
            {/* <p>{movie.releaseDate}</p> */}
            <div className="movie-overlay">
                <button className={`favourite-btn ${favorite ? "active" : ""}`} onClick={onFavoriteClick}>
                    ❤
                </button>
            </div>
            <div className="movie-info">
                <h3>{movie.title}</h3>
                <p>{movie.release_date?.split("-")[0]}</p>
            </div>
        </div>
    );
}
export default MovieCard;