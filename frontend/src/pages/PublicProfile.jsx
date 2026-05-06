import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPublicProfile } from "../services/userApi.js";
import "../css/PublicProfile.css";

const AVATARS = [
  { id: "bottts-cosmos", url: "https://api.dicebear.com/7.x/bottts/svg?seed=cosmos" },
  { id: "bottts-nova", url: "https://api.dicebear.com/7.x/bottts/svg?seed=nova" },
  { id: "bottts-pixel", url: "https://api.dicebear.com/7.x/bottts/svg?seed=pixel" },
  { id: "bottts-cipher", url: "https://api.dicebear.com/7.x/bottts/svg?seed=cipher" },
  { id: "bottts-matrix", url: "https://api.dicebear.com/7.x/bottts/svg?seed=matrix" },
  { id: "bottts-nebula", url: "https://api.dicebear.com/7.x/bottts/svg?seed=nebula" },
  { id: "bottts-orbit", url: "https://api.dicebear.com/7.x/bottts/svg?seed=orbit" },
  { id: "bottts-pulsar", url: "https://api.dicebear.com/7.x/bottts/svg?seed=pulsar" },
  { id: "bottts-quasar", url: "https://api.dicebear.com/7.x/bottts/svg?seed=quasar" },
  { id: "bottts-zenith", url: "https://api.dicebear.com/7.x/bottts/svg?seed=zenith" },
];

const getAvatarUrl = (avatarId) => {
  const found = AVATARS.find((a) => a.id === avatarId);
  return found?.url ?? "https://api.dicebear.com/7.x/bottts/svg?seed=default";
};

const resolvePosterUrl = (poster) => {
  const value = String(poster || "").trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  // If stored as TMDB path like "/abc.jpg"
  if (value.startsWith("/")) return `https://image.tmdb.org/t/p/w500${value}`;
  return value;
};

function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bookmarkTab, setBookmarkTab] = useState("movies");
  const [watchedTab, setWatchedTab] = useState("movies");

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getPublicProfile(username);
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Profile not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [username]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      window.prompt("Copy this URL:", window.location.href);
    }
  };

  const memberSince = useMemo(() => {
    const createdAt = data?.user?.memberSince;
    if (!createdAt) return "";
    try {
      return new Date(createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      });
    } catch {
      return "";
    }
  }, [data?.user?.memberSince]);

  const bookmarkList = useMemo(() => {
    const key = bookmarkTab === "tv" ? "tv" : "movies";
    const list = data?.bookmarks?.[key];
    return Array.isArray(list) ? list : [];
  }, [data, bookmarkTab]);

  const watchedList = useMemo(() => {
    const key = watchedTab === "tv" ? "tv" : "movies";
    const list = data?.watched?.[key];
    return Array.isArray(list) ? list : [];
  }, [data, watchedTab]);

  const openDetail = (item) => {
    const id = item?.movieId;
    const type = item?.mediaType === "tv" ? "tv" : "movie";
    if (!id) return;
    navigate(`/${type}/${id}`);
  };

  if (loading) {
    return (
      <div className="public-profile-page">
        <div className="public-profile-loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-profile-page">
        <div className="public-profile-error">
          <h2>Profile not found</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data?.user) return null;

  const avatarUrl = getAvatarUrl(data.user.avatar);

  return (
    <div className="public-profile-page">
      <header className="public-profile-header">
        <img
          src={avatarUrl}
          alt={data.user.name || data.user.username}
          className="public-profile-avatar"
        />
        <div className="public-profile-meta">
          <div className="public-profile-name">{data.user.name}</div>
          <div className="public-profile-username">@{data.user.username}</div>
          {memberSince ? (
            <div className="public-profile-since">Member since {memberSince}</div>
          ) : null}
          <button type="button" className="share-btn" onClick={handleShare}>
            {copied ? "Copied!" : "Share profile"}
          </button>
        </div>
      </header>

      <section className="profile-section">
        <h2 className="profile-section-title">🔖 Bookmarks</h2>
        <div className="media-tabs">
          <button
            type="button"
            className={`media-tab ${bookmarkTab === "movies" ? "active" : ""}`}
            onClick={() => setBookmarkTab("movies")}
          >
            Movies
          </button>
          <button
            type="button"
            className={`media-tab ${bookmarkTab === "tv" ? "active" : ""}`}
            onClick={() => setBookmarkTab("tv")}
          >
            TV Shows
          </button>
        </div>

        {bookmarkList.length === 0 ? (
          <p className="empty-state">
            No {bookmarkTab === "tv" ? "TV shows" : "movies"} here yet.
          </p>
        ) : (
          <div className="profile-cards-grid">
            {bookmarkList.map((item) => (
              <button
                key={`${item.mediaType}-${item.movieId}`}
                type="button"
                className="profile-movie-card"
                onClick={() => openDetail(item)}
              >
                <div className="profile-movie-poster">
                  {resolvePosterUrl(item.poster) ? (
                    <img src={resolvePosterUrl(item.poster)} alt={item.title} />
                  ) : (
                    <div className="profile-movie-poster--empty" />
                  )}
                </div>
                <div className="profile-movie-info">
                  <div className="profile-movie-title">{item.title}</div>
                  <div className="profile-movie-year">—</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="profile-section">
        <h2 className="profile-section-title">✅ Watched</h2>
        <div className="media-tabs">
          <button
            type="button"
            className={`media-tab ${watchedTab === "movies" ? "active" : ""}`}
            onClick={() => setWatchedTab("movies")}
          >
            Movies
          </button>
          <button
            type="button"
            className={`media-tab ${watchedTab === "tv" ? "active" : ""}`}
            onClick={() => setWatchedTab("tv")}
          >
            TV Shows
          </button>
        </div>

        {watchedList.length === 0 ? (
          <p className="empty-state">
            No {watchedTab === "tv" ? "TV shows" : "movies"} here yet.
          </p>
        ) : (
          <div className="profile-cards-grid">
            {watchedList.map((item) => (
              <button
                key={`${item.mediaType}-${item.movieId}-${item.watchedAt || ""}`}
                type="button"
                className="profile-movie-card"
                onClick={() => openDetail(item)}
              >
                <div className="profile-movie-poster">
                  {resolvePosterUrl(item.poster) ? (
                    <img src={resolvePosterUrl(item.poster)} alt={item.title} />
                  ) : (
                    <div className="profile-movie-poster--empty" />
                  )}
                </div>
                <div className="profile-movie-info">
                  <div className="profile-movie-title">{item.title}</div>
                  <div className="profile-movie-year">—</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default PublicProfile;
