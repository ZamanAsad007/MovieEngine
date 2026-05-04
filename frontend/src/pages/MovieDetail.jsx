import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMovieDetails, getOMDbRatings, getTvDetails } from "../services/Api.js";
import { useMovieContext } from "../contexts/MovieContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useUi } from "../contexts/UiContext.jsx";
import "../css/MovieDetail.css";

const IMG_BASE = "https://image.tmdb.org/t/p/";

function formatRuntime(runtime) {
  const mins = Number(runtime);
  if (!Number.isFinite(mins) || mins <= 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  if (m <= 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function MovieDetail({ mediaType: mediaTypeProp = "movie" }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const mediaType = mediaTypeProp === "tv" ? "tv" : "movie";

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [castIndex, setCastIndex] = useState(0);
  const [omdbData, setOmdbData] = useState(null);
  const [omdbLoading, setOmdbLoading] = useState(false);

  useLayoutEffect(() => {
    // Always start detail pages at the top.
    // useLayoutEffect prevents the "loads in the middle/footer" flicker.
    window.scrollTo(0, 0);
  }, [id]);

  const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useUi();

  const movieId = id ? Number(id) : null;
  const favorite = movieId ? isFavorite(movieId) : false;

  useEffect(() => {
    let cancelled = false;

    setCastIndex(0);

    // OMDb is supplementary: reset per-movie, but don't block TMDB loading.
    setOmdbData(null);
    setOmdbLoading(false);

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = mediaType === "tv" ? await getTvDetails(id) : await getMovieDetails(id);
        if (!cancelled) {
          setMovie(data);
          const imdbId = mediaType === "tv" ? data?.external_ids?.imdb_id : data?.imdb_id;
          // If imdb_id exists, show skeleton immediately on first paint.
          setOmdbLoading(Boolean(imdbId));
        }

        const imdbId = mediaType === "tv" ? data?.external_ids?.imdb_id : data?.imdb_id;
        if (!cancelled && imdbId) {
          getOMDbRatings(imdbId)
            .then((ratings) => {
              if (!cancelled) setOmdbData(ratings);
            })
            .catch(() => {
              // Silent failure (supplementary)
              if (!cancelled) setOmdbData(null);
            })
            .finally(() => {
              if (!cancelled) setOmdbLoading(false);
            });
        }
      } catch (err) {
        if (!cancelled) {
          setMovie(null);
          setError(err?.message || "Failed to load movie details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, mediaType]);

  useEffect(() => {
    const title = mediaType === "tv" ? movie?.name : movie?.title;
    if (!title) return;
    document.title = `${title} — MovieEngine`;
  }, [movie?.title, movie?.name, mediaType]);

  const trailer = useMemo(() => {
    const results = movie?.videos?.results;
    if (!Array.isArray(results) || results.length === 0) return null;

    const yt = results.filter((v) => v?.site === "YouTube" && v?.key);
    if (yt.length === 0) return null;

    const hasTrailerWord = (name) => String(name || "").toLowerCase().includes("trailer");
    const isPreferredType = (type) => ["Trailer", "Teaser", "Clip"].includes(type);

    // Rank candidates: Trailer > Teaser > Clip, and prefer names containing "trailer".
    const typeScore = (type) => {
      if (type === "Trailer") return 3;
      if (type === "Teaser") return 2;
      if (type === "Clip") return 1;
      return 0;
    };

    const sorted = [...yt].sort((a, b) => {
      const aScore = typeScore(a?.type) + (hasTrailerWord(a?.name) ? 1 : 0) + (isPreferredType(a?.type) ? 0.25 : 0);
      const bScore = typeScore(b?.type) + (hasTrailerWord(b?.name) ? 1 : 0) + (isPreferredType(b?.type) ? 0.25 : 0);
      return bScore - aScore;
    });

    return sorted[0] || null;
  }, [movie?.videos?.results]);

  const trailerKey = trailer?.key || null;

  const backdropUrl = movie?.backdrop_path ? `${IMG_BASE}w1280${movie.backdrop_path}` : null;
  const posterUrl = movie?.poster_path ? `${IMG_BASE}w500${movie.poster_path}` : null;

  const getRating = (source) => {
    if (!omdbData?.Ratings || !Array.isArray(omdbData.Ratings)) return null;
    const found = omdbData.Ratings.find((r) => r?.Source === source);
    return found?.Value || null;
  };

  const imdbRating = getRating("Internet Movie Database");
  const rtRating = getRating("Rotten Tomatoes");
  const metacriticRating = getRating("Metacritic");
  const imdbVotes = omdbData?.imdbVotes || null;

  const getIMDbClass = (value) => {
    const num = parseFloat(String(value).split("/")[0]);
    if (!Number.isFinite(num)) return "";
    if (num >= 7.5) return "good";
    if (num >= 6.0) return "ok";
    return "bad";
  };

  const getRTClass = (value) => {
    const num = parseInt(value);
    if (!Number.isFinite(num)) return "";
    if (num >= 75) return "fresh";
    if (num >= 60) return "mixed";
    return "rotten";
  };

  const getMetaClass = (value) => {
    const num = parseInt(value);
    if (!Number.isFinite(num)) return "";
    if (num >= 61) return "positive";
    if (num >= 40) return "mixed";
    return "negative";
  };

  function onBookmarkClick() {
    if (!movie?.id) return;

    if (favorite) {
      removeFromFavorites(movie.id);
      return;
    }

    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    addToFavorites(movie);
  }

  if (loading) {
    return (
      <div className="movie-detail-container">
        <div className="movie-loading" role="status" aria-live="polite">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-detail-container">
        <div className="movie-error">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <div className="movie-error-actions">
            <button type="button" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const title = mediaType === "tv" ? movie?.name : movie?.title;
  const releaseDate = mediaType === "tv" ? movie?.first_air_date : movie?.release_date;
  const releaseYear = releaseDate ? releaseDate.split("-")[0] : "—";
  const runtimeValue =
    mediaType === "tv"
      ? Array.isArray(movie?.episode_run_time)
        ? movie.episode_run_time[0]
        : null
      : movie?.runtime;

  const genres = Array.isArray(movie?.genres) ? movie.genres : [];
  const rawCast = Array.isArray(movie?.credits?.cast) ? movie.credits.cast : [];
  const crew = Array.isArray(movie?.credits?.crew) ? movie.credits.crew : [];
  const director = crew.find((p) => p?.job === "Director") || null;

  const creator = mediaType === "tv" && Array.isArray(movie?.created_by) && movie.created_by.length
    ? movie.created_by[0]
    : null;

  const cast = (() => {
    const topCast = rawCast.slice(0, 10);
    const lead = mediaType === "tv" ? creator : director;
    if (!lead) return topCast;

    const leadCard = {
      id: lead.id || (mediaType === "tv" ? "creator" : "director"),
      credit_id: lead.credit_id || (mediaType === "tv" ? "creator" : "director"),
      name: lead.name,
      character: mediaType === "tv" ? "Creator" : "Director",
      profile_path: lead.profile_path,
    };

    const withoutLead = topCast.filter((c) => (lead.id ? c?.id !== lead.id : true));
    // Keep total list size consistent: lead + 9 cast
    return [leadCard, ...withoutLead.slice(0, 9)];
  })();
  const CAST_PAGE_SIZE = 4;
  const canPrevCast = castIndex > 0;
  const canNextCast = castIndex + CAST_PAGE_SIZE < cast.length;
  const visibleCast = cast.slice(castIndex, castIndex + CAST_PAGE_SIZE);

  return (
    <div className="movie-detail-container">
      <button type="button" className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <section className="movie-hero" style={backdropUrl ? { backgroundImage: `url(${backdropUrl})` } : undefined}>
        <div className="movie-hero-overlay">
          <div className="movie-hero-content">
            {posterUrl ? (
              <img className="movie-poster" src={posterUrl} alt={title} />
            ) : (
              <div className="movie-poster placeholder" aria-hidden="true" />
            )}

            <div className="movie-info">
              <div className="movie-title-row">
                <h1 className="movie-title">
                  {title} <span className="movie-year">({releaseYear})</span>
                </h1>
                <button
                  type="button"
                  className={`bookmark-btn ${favorite ? "active" : ""}`}
                  onClick={onBookmarkClick}
                >
                  {favorite ? "Bookmarked" : "Bookmark"}
                </button>
              </div>

              {movie?.tagline ? <p className="movie-tagline">{movie.tagline}</p> : null}

              <div className="movie-stats">
                <div className="stat">
                  <span className="stat-label">Release</span>
                  <span className="stat-value">{releaseDate || "—"}</span>
                </div>
                {mediaType === "tv" ? (
                  <div className="stat">
                    <span className="stat-label">Seasons</span>
                    <span className="stat-value">{movie?.number_of_seasons ?? "—"}</span>
                  </div>
                ) : null}
                <div className="stat">
                  <span className="stat-label">Runtime</span>
                  <span className="stat-value">{formatRuntime(runtimeValue)}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Status</span>
                  <span className="stat-value">{movie.status || "—"}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Language</span>
                  <span className="stat-value">{movie.original_language?.toUpperCase?.() || "—"}</span>
                </div>
              </div>

              {genres.length ? (
                <div className="genre-chips" aria-label="Genres">
                  {genres.map((g) => (
                    <span key={g.id || g.name} className="genre-chip">
                      {g.name}
                    </span>
                  ))}
                </div>
              ) : null}

              {omdbLoading ? (
                <div className="ratings-section" aria-label="Ratings loading">
                  <h3 className="section-title">Ratings</h3>
                  <div className="ratings-grid">
                    <div className="rating-card rating-skeleton" />
                    <div className="rating-card rating-skeleton" />
                    <div className="rating-card rating-skeleton" />
                  </div>
                </div>
              ) : (imdbRating || rtRating || metacriticRating) ? (
                <div className="ratings-section">
                  <h3 className="section-title">Ratings</h3>
                  <div className="ratings-grid">
                    {imdbRating ? (
                      <div className={`rating-card imdb ${getIMDbClass(imdbRating)}`}>
                        <span className="rating-logo">⭐ IMDb</span>
                        <span className="rating-value">{imdbRating}</span>
                        {imdbVotes ? <span className="rating-votes">{imdbVotes} votes</span> : null}
                      </div>
                    ) : null}

                    {rtRating ? (
                      <div className={`rating-card rt ${getRTClass(rtRating)}`}>
                        <span className="rating-logo">🍅 Rotten Tomatoes</span>
                        <span className="rating-value">{rtRating}</span>
                      </div>
                    ) : null}

                    {metacriticRating ? (
                      <div className={`rating-card metacritic ${getMetaClass(metacriticRating)}`}>
                        <span className="rating-logo">🎯 Metacritic</span>
                        <span className="rating-value">{metacriticRating}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {movie?.overview ? (
                <div className="overview">
                  <h2 className="section-title">Overview</h2>
                  <p>{movie.overview}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="section cast-trailer-row">
        <div className="cast-panel">
          <div className="panel-header">
            <h2 className="section-title">Cast</h2>
            {cast.length > CAST_PAGE_SIZE ? (
              <div className="cast-nav" aria-label="Cast navigation">
                <button
                  type="button"
                  className="cast-nav-btn"
                  onClick={() => setCastIndex((i) => Math.max(0, i - CAST_PAGE_SIZE))}
                  disabled={!canPrevCast}
                  aria-label="Previous cast"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="cast-nav-btn"
                  onClick={() => setCastIndex((i) => Math.min(Math.max(0, cast.length - CAST_PAGE_SIZE), i + CAST_PAGE_SIZE))}
                  disabled={!canNextCast}
                  aria-label="Next cast"
                >
                  →
                </button>
              </div>
            ) : null}
          </div>

          {visibleCast.length ? (
            <div className="cast-carousel" role="list">
              {visibleCast.map((person) => {
                const profileUrl = person?.profile_path ? `${IMG_BASE}w185${person.profile_path}` : null;
                return (
                  <div key={person.cast_id || person.credit_id || person.id} className="cast-item" role="listitem">
                    {profileUrl ? (
                      <img src={profileUrl} alt={person.name} loading="lazy" />
                    ) : (
                      <div className="cast-placeholder" aria-hidden="true" />
                    )}
                    <div className="cast-meta">
                      <div className="cast-name">{person.name}</div>
                      <div className="cast-character">{person.character}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="panel-empty">No cast available.</div>
          )}
        </div>

        <div className="trailer-panel">
          <div className="panel-header">
            <h2 className="section-title">Trailer</h2>
          </div>
          {trailerKey ? (
            <div className="trailer-wrapper">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailerKey}`}
                title={trailer?.name || "YouTube trailer"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="panel-empty">Trailer not available.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default MovieDetail;
