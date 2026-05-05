import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getAIRecommendations } from "../services/aiApi";
import { searchMovieByTitle } from "../services/Api";
import "../css/AIChatSidebar.css";
import { useAuth } from "../contexts/AuthContext.jsx";

const MOOD_CHIPS = [
  { label: "😴 Something chill", value: "I want something relaxing and chill to watch" },
  { label: "🔥 Action packed", value: "I want an action packed thriller" },
  { label: "😂 Make me laugh", value: "I want a comedy that will make me laugh out loud" },
  { label: "😢 Let me cry", value: "I want an emotional movie that will make me cry" },
  { label: "😱 Scare me", value: "I want a really scary horror movie" },
  { label: "🧠 Mind-bending", value: "I want a mind-bending psychological thriller" },
  { label: "❤️ Romance", value: "I want a romantic movie" },
  { label: "🚀 Sci-Fi", value: "I want a great science fiction movie" },
];

export default function AIChatSidebar({ isOpen, onClose }) {
  const { isAuthenticated, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!chatWindowRef.current) return;
    chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [isOpen]);

  // ESC closes
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const handleSend = async (messageText) => {
    if (!isAuthenticated) return;
    const userMessage = (messageText ?? input).trim();
    if (!userMessage || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: userMessage, movies: [] }]);
    setInput("");
    setLoading(true);

    try {
      const { reply, extractedTitles, updatedHistory } = await getAIRecommendations(
        userMessage,
        history,
        token
      );

      setHistory(updatedHistory);

      const movies = await Promise.all(
        (extractedTitles || []).map(({ title, year }) => searchMovieByTitle(title, year))
      );
      const validMovies = movies.filter(Boolean);

      setMessages((prev) => [...prev, { role: "ai", text: reply, movies: validMovies }]);
    } catch (error) {
      console.error("AI sidebar error:", error);
      const isDev = import.meta.env.DEV;
      const tooMany = error?.message === "TOO_MANY_REQUESTS";
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: tooMany
            ? "You have made too many requests. Please wait a few minutes and try again."
            : (isDev
              ? (error?.message || "AI request failed")
              : "Sorry, I couldn't get recommendations right now. Please try again!"),
          movies: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`ai-sidebar-backdrop ${isOpen ? "open" : ""}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <aside className={`ai-sidebar ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
        <div className="ai-sidebar-header">
          <div className="ai-sidebar-title">
            <span className="ai-sidebar-emoji">🎬</span>
            <span>Tell me your mood</span>
          </div>
          <button
            type="button"
            className="ai-sidebar-close"
            onClick={onClose}
            aria-label="Close AI recommender"
          >
            ×
          </button>
        </div>

        <div className="ai-sidebar-subtitle">I will suggest 4 movies.</div>

        <div className="ai-chat-window" ref={chatWindowRef}>
          {!isAuthenticated ? (
            <div className="ai-login-prompt">
              <div className="ai-login-title">Authentication required</div>
              <div className="ai-login-text">
                To use the AI Movie Recommender, please log in to your account.
              </div>
              <div className="ai-login-actions">
                <Link to="/login" className="ai-login-button" onClick={onClose}>Log in</Link>
                <Link to="/register" className="ai-register-link" onClick={onClose}>Create an account</Link>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="ai-mood-chips">
              {MOOD_CHIPS.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  className="ai-mood-chip"
                  onClick={() => handleSend(chip.value)}
                  disabled={loading}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`ai-message-row ${msg.role}`}>
                <div className={`ai-message-bubble ${msg.role}`}>
                  <p>{msg.text}</p>

                  {msg.movies?.length > 0 && (
                    <div className="ai-movies-grid">
                      {msg.movies.map((movie) => (
                        <Link
                          key={movie.id}
                          to={`/movie/${movie.id}`}
                          className="ai-movie-card"
                          onClick={onClose}
                        >
                          {movie.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                              alt={movie.title}
                            />
                          ) : (
                            <div className="ai-no-poster">No Image</div>
                          )}
                          <span className="ai-movie-title">{movie.title}</span>
                          <span className="ai-movie-year">
                            {movie.release_date?.split("-")[0]}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="ai-message-row ai">
              <div className="ai-message-bubble ai">
                <div className="ai-typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="ai-chat-input-row">
          <input
            ref={inputRef}
            type="text"
            className="ai-chat-input"
            placeholder="Tell me what you're in the mood for..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            disabled={loading || !isAuthenticated}
          />
          <button
            type="button"
            className="ai-send-button"
            onClick={() => handleSend()}
            disabled={loading || !isAuthenticated || !input.trim()}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </aside>
    </>
  );
}
