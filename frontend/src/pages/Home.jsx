import MovieCard from "../components/movieCard.jsx";
import { useState, useEffect } from "react";
import { searchMovies, getPopularMovies, searchTvShows, getPopularTvShows } from "../services/Api";
import '../css/Home.css'
function Home() {
    const [mediaType, setMediaType] = useState("movie");
    const [searchQuery, setSearchQuery] = useState(""); 
    const [movies, setMovies] = useState([]);
    const [error, setError] = useState(null);
    const[loading, setLoading] = useState(true);

    useEffect(()=>{
        const loadPopular = async()=>{
            try{
                setLoading(true);
                const popular = mediaType === "tv" ? await getPopularTvShows() : await getPopularMovies();
                setMovies(popular);
            }catch(err){
                console.log(err);
                setError(err?.message || "Failed to load popular movies. Please try again later.");
            }
            finally{
                setLoading(false);
            }
        }
        loadPopular();
    },[mediaType])

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
                onClick={() => { setMediaType("movie"); setSearchQuery(""); }}
            >
                Movies
            </button>
            <button
                type="button"
                className={`toggle-button ${mediaType === "tv" ? "active" : ""}`}
                onClick={() => { setMediaType("tv"); setSearchQuery(""); }}
            >
                TV Shows
            </button>
        </div>
        <form onSubmit={searchFormHandler} className="search-form">
            <input type="text" 
            placeholder="Search for movies..." 
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