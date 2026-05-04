import '../css/MovieCard.css'
import { useMovieContext } from "../contexts/MovieContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useUi } from "../contexts/UiContext.jsx";
import { BsBookmarkPlus } from "react-icons/bs";
import { Link } from 'react-router-dom';

function MovieCard({ movie, showActions = true }) {
    const { isFavorite, addToFavorites, removeFromFavorites, isWatched, setWatched } = useMovieContext()
    const { isAuthenticated } = useAuth()
    const { openAuthModal } = useUi()
    const movieId = movie?.id
    const favorite = movieId ? isFavorite(movieId) : false
    const watched = movieId ? isWatched(movieId) : false
    const title = movie?.title || movie?.name
    const year = (movie?.release_date || movie?.first_air_date)?.split?.("-")?.[0]
    const posterUrl = movie?.posterUrl ?? (movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null)

    const mediaType = movie?.media_type === 'tv' || (!movie?.title && (movie?.first_air_date || movie?.name)) ? 'tv' : 'movie'
    const detailsPath = `/${mediaType}/${movieId}`

    function onFavoriteClick(e) {
        e?.preventDefault?.()
        e?.stopPropagation?.()
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
        e?.stopPropagation?.()
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
            {movieId ? (
                <Link className="movie-card-link" to={detailsPath} aria-label={`Open details for ${title}`}>
                    {posterUrl ? <img src={posterUrl} alt={title} /> : null}
                    <div className="movie-info">
                        <h3>{title}</h3>
                        <p>{year}</p>
                    </div>
                </Link>
            ) : (
                <>
                    {posterUrl ? <img src={posterUrl} alt={title} /> : null}
                    <div className="movie-info">
                        <h3>{title}</h3>
                        <p>{year}</p>
                    </div>
                </>
            )}

            {showActions && movieId ? (
                <div className="movie-overlay" aria-hidden="true">
                    <button
                        className={`favourite-btn ${favorite ? "active" : ""} ${watched ? "hide-desktop" : ""}`}
                        onClick={onFavoriteClick}
                        aria-label={favorite ? "Remove bookmark" : "Bookmark"}
                    >
                        <BsBookmarkPlus />
                    </button>
                    <button
                        className={`watched-btn ${watched ? "active" : ""}`}
                        onClick={onWatchedClick}
                        title={watched ? "Unmark watched" : "Mark as watched"}
                        aria-label={watched ? "Unmark watched" : "Mark watched"}
                    >
                        ✓
                    </button>

                    <Link className="details-btn" to={detailsPath} aria-label={`View details for ${title}`}>
                        Details
                    </Link>
                </div>
            ) : null}
        </div>
    );
}
export default MovieCard;