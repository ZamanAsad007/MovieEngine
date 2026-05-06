const BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const OMDB_BASE_URL = "https://www.omdbapi.com";
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;


export const getPopularMovies = async (page = 1) => {  
    if (!API_KEY) {
        throw new Error("Missing VITE_TMDB_API_KEY. Create frontend/.env (see frontend/.env.example).")
    }

    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`)
    }
    const data = await response.json();
    return data;
};

export const getTopRatedMovies = async (page = 1) => {
    if (!API_KEY) {
        throw new Error("Missing VITE_TMDB_API_KEY. Create frontend/.env (see frontend/.env.example).")
    }

    const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}`);
    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`)
    }
    const data = await response.json();
    return data;
};

export const searchMovies = async (query, page = 1) => {
    if (!API_KEY) {
        throw new Error("Missing VITE_TMDB_API_KEY. Create frontend/.env (see frontend/.env.example).")
    }

    const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`);
    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`)
    }
    const data = await response.json();
    return data;
}

export const getPopularTvShows = async (page = 1) => {
    if (!API_KEY) {
        throw new Error("Missing VITE_TMDB_API_KEY. Create frontend/.env (see frontend/.env.example).")
    }

    const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`);
    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`)
    }
    const data = await response.json();
    return data;
};

export const getTopRatedTvShows = async (page = 1) => {
    if (!API_KEY) {
        throw new Error("Missing VITE_TMDB_API_KEY. Create frontend/.env (see frontend/.env.example).")
    }

    const response = await fetch(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}&page=${page}`);
    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`)
    }
    const data = await response.json();
    return data;
};

export const searchTvShows = async (query, page = 1) => {
    if (!API_KEY) {
        throw new Error("Missing VITE_TMDB_API_KEY. Create frontend/.env (see frontend/.env.example).")
    }

    const response = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`);
    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`)
    }
    const data = await response.json();
    return data;
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

export const searchMovieByTitle = async (title, year) => {
    if (!API_KEY) {
        throw new Error("Missing VITE_TMDB_API_KEY. Create frontend/.env (see frontend/.env.example).");
    }
    
    const response = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(title)}&year=${year}&page=1`
    );
    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`);
    }
    const data = await response.json();
    // Return best match — first result
    return data.results?.[0] || null;
};

export const searchTvByTitle = async (title, year) => {
    if (!API_KEY) {
        throw new Error("Missing VITE_TMDB_API_KEY. Create frontend/.env (see frontend/.env.example).");
    }

    const yearParam = year ? `&first_air_date_year=${encodeURIComponent(year)}` : "";
    const response = await fetch(
        `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(title)}${yearParam}&page=1`
    );
    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`);
    }
    const data = await response.json();
    // Return best match — first result
    return data.results?.[0] || null;
};