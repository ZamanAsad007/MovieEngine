import MovieCard from "../components/movieCard.jsx";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMovies, getPopularMovies, getTopRatedMovies, searchTvShows, getPopularTvShows, getTopRatedTvShows } from "../services/Api";
import '../css/Home.css'
function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const mediaTypeParam = searchParams.get('type') === 'tv' ? 'tv' : 'movie';
    const [mediaType, setMediaType] = useState(mediaTypeParam);
    const [searchQuery, setSearchQuery] = useState(""); 
    const [movies, setMovies] = useState([]);
    const [error, setError] = useState(null);
    const[loading, setLoading] = useState(true);

    const listType = searchParams.get('list') || 'popular';

    useEffect(() => {
        setMediaType(mediaTypeParam);
    }, [mediaTypeParam]);

    function setType(nextType) {
        setMediaType(nextType);
        setSearchQuery("");

        const next = new URLSearchParams(searchParams);
        if (nextType === 'tv') next.set('type', 'tv');
        else next.delete('type');
        setSearchParams(next, { replace: true });
    }

    useEffect(()=>{
        const loadPopular = async()=>{
            try{
                setLoading(true);
                const items = (() => {
                    if (mediaType === 'tv') return listType === 'top_rated' ? getTopRatedTvShows() : getPopularTvShows();
                    return listType === 'top_rated' ? getTopRatedMovies() : getPopularMovies();
                })();
                setMovies(await items);
            }catch(err){
                console.log(err);
                setError(err?.message || "Failed to load popular movies. Please try again later.");
            }
            finally{
                setLoading(false);
            }
        }
        loadPopular();
    },[mediaType, listType])

    async function searchFormHandler(e) {
        e.preventDefault();

        if (!searchQuery.trim()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const results = mediaType === "tv" ? await searchTvShows(searchQuery) : await searchMovies(searchQuery);
            setMovies(results);
        } catch (err) {
            console.log(err);
            setError(err?.message || "Failed to search movies. Please try again later.");
        } finally {
            setLoading(false);
        }
    }
    return <div className="home">
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
            value={searchQuery}
            onChange={(e)=>setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">Search</button>
        </form>
        {error ? <div className="error-message">{error}</div> : null}
        {loading ? <div className="loading">Loading...</div> : null}
        <div className="movie-grid">
            {movies.map(item => {
                const title = (item?.title || item?.name || "").toLowerCase()
                const q = searchQuery.toLowerCase()
                return title.startsWith(q) ? <MovieCard key={item.id} movie={item} /> : null
            })}
        </div>
    </div>
}

export default Home;