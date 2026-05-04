const BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const OMDB_BASE_URL = "https://www.omdbapi.com";
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;


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

export const getTopRatedMovies = async () => {
    if (!API_KEY) {
        throw new Error("Missing VITE_TMDB_API_KEY. Create frontend/.env (see frontend/.env.example).")
    }

    const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`);
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

export const getPopularTvShows = async () => {
    if (!API_KEY) {
        throw new Error("Missing VITE_TMDB_API_KEY. Create frontend/.env (see frontend/.env.example).")
    }

    const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`);
    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`)
    }
    const data = await response.json();
    return data.results;
};

export const getTopRatedTvShows = async () => {
    if (!API_KEY) {
        throw new Error("Missing VITE_TMDB_API_KEY. Create frontend/.env (see frontend/.env.example).")
    }

    const response = await fetch(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}`);
    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`)
    }
    const data = await response.json();
    return data.results;
};

export const searchTvShows = async (query) => {
    if (!API_KEY) {
        throw new Error("Missing VITE_TMDB_API_KEY. Create frontend/.env (see frontend/.env.example).")
    }

    const response = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`)
    }
    const data = await response.json();
    return data.results;
}

export const getMovieDetails = async (movieId) => {
    if (!API_KEY) {
        throw new Error("Missing VITE_TMDB_API_KEY. Create frontend/.env (see frontend/.env.example).")
    }
    if (!movieId) {
        throw new Error("Missing movieId")
    }

    const response = await fetch(
        `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos,similar`
    );
    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`)
    }
    return await response.json();
}

export const getTvDetails = async (tvId) => {
    if (!API_KEY) {
        throw new Error("Missing VITE_TMDB_API_KEY. Create frontend/.env (see frontend/.env.example).")
    }
    if (!tvId) {
        throw new Error("Missing tvId")
    }

    const response = await fetch(
        `${BASE_URL}/tv/${tvId}?api_key=${API_KEY}&append_to_response=credits,videos,external_ids`
    );
    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`)
    }
    return await response.json();
}

export const getMovieCredits = async (movieId) => {
    if (!API_KEY) {
        throw new Error("Missing VITE_TMDB_API_KEY. Create frontend/.env (see frontend/.env.example).")
    }
    if (!movieId) {
        throw new Error("Missing movieId")
    }

    const response = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`);
    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`)
    }
    return await response.json();
}

export const getMovieVideos = async (movieId) => {
    if (!API_KEY) {
        throw new Error("Missing VITE_TMDB_API_KEY. Create frontend/.env (see frontend/.env.example).")
    }
    if (!movieId) {
        throw new Error("Missing movieId")
    }

    const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`)
    }
    return await response.json();
}

export const getOMDbRatings = async (imdbId) => {
    if (!imdbId) return null;
    if (!OMDB_API_KEY) return null;

    const response = await fetch(`${OMDB_BASE_URL}/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
    const data = await response.json();
    if (data?.Response === "False") return null;
    return data;
};