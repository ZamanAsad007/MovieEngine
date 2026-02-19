const BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;


export const getPopularMovies = async () => {  
    if (!API_KEY) {
        throw new Error("Missing VITE_TMDB_API_KEY. Create frontend/.env (see frontend/.env.example).")
    }

    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`)
    }
    const data = await response.json();
    return data.results;
};

export const searchMovies = async (query) => {
    if (!API_KEY) {
        throw new Error("Missing VITE_TMDB_API_KEY. Create frontend/.env (see frontend/.env.example).")
    }

    const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`)
    }
    const data = await response.json();
    return data.results;
}