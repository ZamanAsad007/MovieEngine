import MovieCard from "../components/movieCard.jsx";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMovies, getPopularMovies, getTopRatedMovies, searchTvShows, getPopularTvShows, getTopRatedTvShows } from "../services/Api";
import '../css/Home.css'

function appendUniqueById(existing, incoming) {
    const next = Array.isArray(incoming) ? incoming : [];
    if (existing.length === 0) return next;

    const seen = new Set(existing.map((item) => item?.id));
    const deduped = [];
    for (const item of next) {
        if (!item?.id) continue;
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        deduped.push(item);
    }
    return [...existing, ...deduped];
}

function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const mediaTypeParam = searchParams.get('type') === 'tv' ? 'tv' : 'movie';
    const listType = searchParams.get('list') || 'popular';

    const [mediaType, setMediaType] = useState(mediaTypeParam);
    const [movies, setMovies] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [query, setQuery] = useState("");
    const [activeQuery, setActiveQuery] = useState("");
    const sentinelRef = useRef(null);
    const prevMediaTypeParamRef = useRef(mediaTypeParam);
    const prevListTypeRef = useRef(listType);
    const skipNextMediaTypeParamResetRef = useRef(false);

    useEffect(() => {
        if (prevMediaTypeParamRef.current === mediaTypeParam) return;
        prevMediaTypeParamRef.current = mediaTypeParam;

        if (skipNextMediaTypeParamResetRef.current) {
            skipNextMediaTypeParamResetRef.current = false;
            return;
        }

        setMediaType(mediaTypeParam);
        setMovies([]);
        setPage(1);
        setTotalPages(1);
        setError(null);
        setQuery("");
        setActiveQuery("");
    }, [mediaTypeParam]);

    useEffect(() => {
        if (prevListTypeRef.current === listType) return;
        prevListTypeRef.current = listType;

        setMovies([]);
        setPage(1);
        setTotalPages(1);
        setError(null);
        setQuery("");
        setActiveQuery("");
    }, [listType]);

    function setType(nextType) {
        setMediaType(nextType);
        setQuery("");
        setActiveQuery("");
        setMovies([]);
        setPage(1);
        setTotalPages(1);
        setError(null);

        skipNextMediaTypeParamResetRef.current = true;

        const next = new URLSearchParams(searchParams);
        if (nextType === 'tv') next.set('type', 'tv');
        else next.delete('type');
        setSearchParams(next, { replace: true });
    }

    const hasMore = page < totalPages;

    useEffect(() => {
        let cancelled = false;

        async function fetchPage() {
            try {
                setLoading(true);
                setError(null);

                const data = await (async () => {
                    if (activeQuery) {
                        return mediaType === "tv"
                            ? searchTvShows(activeQuery, page)
                            : searchMovies(activeQuery, page);
                    }

                    if (mediaType === "tv") {
                        return listType === "top_rated" ? getTopRatedTvShows(page) : getPopularTvShows(page);
                    }
                    return listType === "top_rated" ? getTopRatedMovies(page) : getPopularMovies(page);
                })();

                if (cancelled) return;

                const results = Array.isArray(data?.results) ? data.results : [];
                const nextTotalPages = Number.isFinite(data?.total_pages) ? data.total_pages : 1;
                setTotalPages(nextTotalPages || 1);

                setMovies((prev) => (page === 1 ? results : appendUniqueById(prev, results)));
            } catch (err) {
                if (cancelled) return;
                console.log(err);
                setError(err?.message || "Failed to load movies. Please try again later.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchPage();
        return () => {
            cancelled = true;
        };
    }, [page, activeQuery, mediaType, listType]);

    useEffect(() => {
        const sentinelEl = sentinelRef.current;
        if (!sentinelEl) return;
        if (loading) return;
        if (!hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first?.isIntersecting) {
                    observer.disconnect();
                    setPage((p) => (p < totalPages ? p + 1 : p));
                }
            },
            { root: null, rootMargin: "0px 0px 200px 0px", threshold: 0 }
        );

        observer.observe(sentinelEl);
        return () => observer.disconnect();
    }, [hasMore, loading]);

    async function searchFormHandler(e) {
        e.preventDefault();
        const next = query.trim();
        if (!next) return;

        setMovies([]);
        setPage(1);
        setTotalPages(1);
        setError(null);
        setActiveQuery(next);
    }

    function clearSearch() {
        setQuery("");
        setActiveQuery("");
        setMovies([]);
        setPage(1);
        setTotalPages(1);
        setError(null);
    }

    return <div className="home home-page">
        <div className="toggle-bar">
            <button
                type="button"
                className={`toggle-button ${mediaType === "movie" ? "active" : ""}`}
                onClick={() => setType("movie")}
            >
                Movies
            </button>
            <button
                type="button"
                className={`toggle-button ${mediaType === "tv" ? "active" : ""}`}
                onClick={() => setType("tv")}
            >
                TV Shows
            </button>
        </div>
        <form onSubmit={searchFormHandler} className="search-form">
            <input type="text" 
            placeholder={mediaType === 'tv' ? "Search for TV shows..." : "Search for movies..."}
            className="search-input" 
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            />
            <button type="submit" className="search-button">Search</button>
            {activeQuery ? (
                <button type="button" className="search-clear-btn" onClick={clearSearch}>
                    Clear
                </button>
            ) : null}
        </form>

        {activeQuery ? (
            <div className="search-label">Showing results for "{activeQuery}"</div>
        ) : null}

        {error ? <div className="home-error">{error}</div> : null}

        {!loading && !error && activeQuery && movies.length === 0 ? (
            <div className="home-empty">No results found.</div>
        ) : null}

        <div className="movies-grid">
            {movies.map((item) => (
                <MovieCard
                    key={`${item.id}-${item?.title || item?.name || ""}`}
                    movie={item}
                />
            ))}
        </div>

        <div ref={sentinelRef} />

        {loading ? (
            <div className="infinite-scroll-loader" aria-label="Loading more results">
                <div className="loader-spinner" />
            </div>
        ) : null}

        {!loading && !error && !hasMore && movies.length > 0 ? (
            <div className="infinite-scroll-end">You're all caught up.</div>
        ) : null}
    </div>
}

export default Home;