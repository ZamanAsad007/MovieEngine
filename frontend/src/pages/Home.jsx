import MovieCard from "../components/movieCard.jsx";
import { useState, useEffect } from "react";
import { searchMovies, getPopularMovies } from "../services/Api";
import '../css/Home.css'
function Home() {
    const [searchQuery, setSearchQuery] = useState(""); 
    const [movies, setMovies] = useState([]);
    const [error, setError] = useState(null);
    const[loading, setLoading] = useState(true);

    useEffect(()=>{
        const loadPopularMovies = async()=>{
            try{
                const popularMovies = await getPopularMovies();
                setMovies(popularMovies);
            }catch(err){
                console.log(err);
                setError(err?.message || "Failed to load popular movies. Please try again later.");
            }
            finally{
                setLoading(false);
            }
        }
        loadPopularMovies();
    },[])

    async function searchFormHandler(e) {
        e.preventDefault();

        if (!searchQuery.trim()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const results = await searchMovies(searchQuery);
            setMovies(results);
        } catch (err) {
            console.log(err);
            setError(err?.message || "Failed to search movies. Please try again later.");
        } finally {
            setLoading(false);
        }
    }
    return <div className="home">
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
            {movies.map(movie => movie.title.toLowerCase().startsWith(searchQuery.toLowerCase()) &&
            (
                <MovieCard key={movie.id} movie={movie} />
            ))}
        </div>
    </div>
}

export default Home;