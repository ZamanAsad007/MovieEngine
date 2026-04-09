import '../css/MovieCard.css'
import { useMovieContext } from "../contexts/MovieContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useUi } from "../contexts/UiContext.jsx";
import { BsBookmarkPlus } from "react-icons/bs";

function MovieCard({ movie }) {
    const { isFavorite, addToFavorites, removeFromFavorites, isWatched, setWatched } = useMovieContext()
    const { isAuthenticated } = useAuth()
    const { openAuthModal } = useUi()
    const movieId = movie?.id
    const favorite = movieId ? isFavorite(movieId) : false
    const watched = movieId ? isWatched(movieId) : false
    const title = movie?.title || movie?.name
    const year = (movie?.release_date || movie?.first_air_date)?.split?.("-")?.[0]
    const posterUrl = movie?.posterUrl ?? (movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null)

    function onFavoriteClick(e) {
        e?.preventDefault?.()
        if (!movieId) return
        if (favorite) {
            removeFromFavorites(movieId)
            return
        }

        if (!isAuthenticated) {
            openAuthModal()
            return
        }

        addToFavorites(movie)
    }

    function onWatchedClick(e) {
        e?.preventDefault?.()
        if (!movieId) return
        if (!isAuthenticated) {
            openAuthModal()
            return
        }
        setWatched(movieId, !watched, movie)
    }

    if (!movie) return null
    return (
        <div className="movie-card">
            {posterUrl ? <img src={posterUrl} alt={title} /> : null}
            <h3>{title}</h3>
            {/* <p>{movie.releaseDate}</p> */}
            <div className="movie-overlay">
                {!watched ? (
                    <button className={`favourite-btn ${favorite ? "active" : ""}`} onClick={onFavoriteClick}>
                        <BsBookmarkPlus />
                    </button>
                ) : null}
                <button className={`watched-btn ${watched ? "active" : ""}`} onClick={onWatchedClick} title="Mark as watched">
                    ✓
                </button>
            </div>
            <div className="movie-info">
                <h3>{title}</h3>
                <p>{year}</p>
            </div>
        </div>
    );
}
export default MovieCard;