import {createContext, useState, useContext, useEffect} from "react"
import { useAuth } from "./AuthContext.jsx";
import { bookmarksApi } from "../services/backendApi.js";

const MovieContext = createContext()

export const useMovieContext = () => useContext(MovieContext)

export const MovieProvider = ({children}) => {
    const [favorites, setFavorites] = useState([])
    const { token, isAuthenticated } = useAuth();

    const getMediaType = (item) => {
        if (item?.mediaType === 'movie' || item?.mediaType === 'tv') return item.mediaType
        return item?.name && !item?.title ? 'tv' : 'movie'
    }

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
                    // Backward-compat: older docs may not have `favorite`.
                    // If it exists but was created as watched-only, it will be false.
                    favorite: b.favorite ?? true,
                    mediaType: b.mediaType || 'movie',
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
                title: movie.title || movie.name,
                poster: movie?.posterUrl ?? (movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null),
                rating: movie?.rating,
                mediaType: getMediaType(movie),
            }
            bookmarksApi.add(token, payload)
                .then((b) => {
                    setFavorites(prev => {
                        const exists = prev.some(m => String(m.id) === String(movie.id))
                        if (exists) {
                            return prev.map(m => (
                                String(m.id) === String(movie.id)
                                    ? { ...m, favorite: true, watched: Boolean(b?.watched), mediaType: b?.mediaType || m.mediaType }
                                    : m
                            ))
                        }
                        return [...prev, { ...movie, favorite: true, watched: Boolean(b?.watched), mediaType: b?.mediaType || getMediaType(movie) }]
                    })
                })
                .catch(() => {})
            return
        }

        setFavorites(prev => {
            const exists = prev.some(m => String(m.id) === String(movie.id))
            if (exists) {
                return prev.map(m => (
                    String(m.id) === String(movie.id)
                        ? { ...m, favorite: true }
                        : m
                ))
            }
            return [...prev, { ...movie, favorite: true, watched: Boolean(movie.watched), mediaType: getMediaType(movie) }]
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

    const setWatched = (movieId, watched, movieMeta) => {
        const nextWatched = Boolean(watched)

        const meta = movieMeta
            ? {
                title: movieMeta.title || movieMeta.name,
                poster:
                    movieMeta?.posterUrl ??
                    (movieMeta?.poster_path ? `https://image.tmdb.org/t/p/w500${movieMeta.poster_path}` : null),
                rating: movieMeta?.rating,
                                mediaType: getMediaType(movieMeta),
              }
            : null

        if (isAuthenticated) {
            bookmarksApi
                .setWatched(token, String(movieId), nextWatched, meta)
                .then((b) => {
                    setFavorites(prev => {
                        const exists = prev.some(m => String(m.id) === String(movieId))
                        if (exists) {
                            return prev.map(m => (String(m.id) === String(movieId) ? { ...m, watched: Boolean(b?.watched) } : m))
                        }
                        // Created by backend (watched without prior favourite)
                        return [
                            ...prev,
                            {
                                id: Number(b.movieId) || b.movieId,
                                title: b.title,
                                posterUrl: b.poster,
                                rating: b.rating,
                                favorite: Boolean(b.favorite),
                                mediaType: b.mediaType || 'movie',
                                watched: Boolean(b.watched),
                            },
                        ]
                    })
                })
                .catch(() => {})
        }

        setFavorites(prev => {
            const exists = prev.some(m => String(m.id) === String(movieId))
            if (exists) {
                const current = prev.find(m => String(m.id) === String(movieId))
                
                if (current && current.favorite === false && nextWatched === false) {
                    if (isAuthenticated) {
                        bookmarksApi.remove(token, String(movieId)).catch(() => {})
                    }
                    return prev.filter(m => String(m.id) !== String(movieId))
                }

                return prev.map(movie => (
                    String(movie.id) === String(movieId) ? { ...movie, watched: nextWatched } : movie
                ))
            }
            if (nextWatched && movieMeta) {
                return [...prev, { ...movieMeta, favorite: false, watched: true, mediaType: getMediaType(movieMeta) }]
            }
            return prev
        })
    }
    
    const isFavorite = (movieId) => {
        return favorites.some(movie => movie.id === movieId && movie.favorite && !movie.watched)
    }

    const value = {
        favorites: favorites.filter(m => m.favorite && !m.watched),
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