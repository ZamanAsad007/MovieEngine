import React, { useState, useEffect, useRef } from "react";
import "../css/FloatingAI.css";

export default function FloatingAI({ onOpen }) {
  const [highlighted, setHighlighted] = useState(false);
  const expandTimerRef = useRef(null);
  const collapseTimerRef = useRef(null);
  const isHoveringRef = useRef(false);

  useEffect(() => {
    // Auto-highlight on every load
    expandTimerRef.current = setTimeout(() => {
      setHighlighted(true);

      // Auto remove highlight after 4 seconds (but don't collapse while hovering)
      collapseTimerRef.current = setTimeout(() => {
        if (!isHoveringRef.current) setHighlighted(false);
      }, 4000);
    }, 3000);

    return () => {
      clearTimeout(expandTimerRef.current);
      clearTimeout(collapseTimerRef.current);
    };
  }, []);

  return (
    <div className="floating-ai-wrapper">
      {/* Pulse rings — purely decorative */}
      <span className="floating-ai-pulse-ring" />
      <span className="floating-ai-pulse-ring floating-ai-pulse-ring--delay" />

      <button
        type="button"
        className={`floating-ai-btn ${highlighted ? "floating-ai-btn--highlighted" : ""}`}
        aria-label="Open AI movie recommender"
        onClick={onOpen}
        onMouseEnter={() => {
          isHoveringRef.current = true;
          setHighlighted(true);
        }}
        onMouseLeave={() => {
          isHoveringRef.current = false;
          setHighlighted(false);
        }}
      >
        <span className="floating-ai-icon">🎬</span>
        <span className={`floating-ai-text ${highlighted ? "floating-ai-text--visible" : ""}`}>
          Tell Me Your Mood
        </span>
      </button>
    </div>
  );
}
