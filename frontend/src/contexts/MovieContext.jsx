import {createContext, useState, useContext, useEffect} from "react"
import { useAuth } from "./AuthContext.jsx";
import { bookmarksApi } from "../services/backendApi.js";

const MovieContext = createContext()

export const useMovieContext = () => useContext(MovieContext)

export const MovieProvider = ({children}) => {
    const [favorites, setFavorites] = useState([])
    const { token, isAuthenticated } = useAuth();

    useEffect(() => {
        // Logged out: localStorage
        if (!isAuthenticated) {
            const storedFavs = localStorage.getItem("favorites")
            if (storedFavs) setFavorites(JSON.parse(storedFavs))
            else setFavorites([])
            return
        }

        // Logged in: backend
        let cancelled = false
        ;(async () => {
            try {
                const list = await bookmarksApi.list(token)
                const mapped = (Array.isArray(list) ? list : []).map(b => ({
                    id: Number(b.movieId) || b.movieId,
                    title: b.title,
                    posterUrl: b.poster,
                    rating: b.rating,
                    watched: Boolean(b.watched),
                }))
                if (!cancelled) setFavorites(mapped)
            } catch {
                if (!cancelled) setFavorites([])
            }
        })()

        return () => { cancelled = true }
    }, [isAuthenticated, token])

    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.setItem('favorites', JSON.stringify(favorites))
        }
    }, [favorites, isAuthenticated])

    const addToFavorites = (movie) => {
        if (!movie?.id) return
        if (isAuthenticated) {
            const payload = {
                movieId: String(movie.id),
                title: movie.title,
                poster: movie?.posterUrl ?? (movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null),
                rating: movie?.rating,
            }
            bookmarksApi.add(token, payload)
                .then((b) => {
                    setFavorites(prev => {
                        if (prev.some(m => m.id === movie.id)) return prev
                        return [...prev, { ...movie, watched: Boolean(b?.watched) }]
                    })
                })
                .catch(() => {})
            return
        }

        setFavorites(prev => {
            if (prev.some(m => m.id === movie.id)) return prev
            return [...prev, { ...movie, watched: Boolean(movie.watched) }]
        })
    }

    const removeFromFavorites = (movieId) => {
        if (isAuthenticated) {
            bookmarksApi.remove(token, String(movieId)).catch(() => {})
        }
        setFavorites(prev => prev.filter(movie => movie.id !== movieId))
    }

    const isWatched = (movieId) => {
        return favorites.some(movie => movie.id === movieId && movie.watched)
    }

    const setWatched = (movieId, watched) => {
        if (isAuthenticated) {
            bookmarksApi.setWatched(token, String(movieId), Boolean(watched)).catch(() => {})
        }
        setFavorites(prev => prev.map(movie => (
            movie.id === movieId ? { ...movie, watched: Boolean(watched) } : movie
        )))
    }
    
    const isFavorite = (movieId) => {
        return favorites.some(movie => movie.id === movieId)
    }

    const value = {
        favorites,
        watchedMovies: favorites.filter(m => m.watched),
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        isWatched,
        setWatched,
    }

    return <MovieContext.Provider value={value}>
        {children}
    </MovieContext.Provider>
}