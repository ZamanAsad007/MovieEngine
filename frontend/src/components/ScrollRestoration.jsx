import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const STORAGE_KEY = "movieengine:scroll-positions";

function loadPositions() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePositions(positions) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // ignore
  }
}

export default function ScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();

  const positionsRef = useRef(null);
  if (positionsRef.current === null) {
    positionsRef.current = loadPositions();
  }

  const keyRef = useRef(location.key);

  useEffect(() => {
    let rafId = null;

    const onScroll = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const key = keyRef.current;
        const positions = positionsRef.current || {};
        positions[key] = window.scrollY;
        positionsRef.current = positions;
        savePositions(positions);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onScroll);
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  useLayoutEffect(() => {
    const key = location.key;
    keyRef.current = key;

    if (navigationType !== "POP") return;

    const positions = positionsRef.current || {};
    const y = positions[key];
    if (typeof y !== "number") return;

    let attempts = 0;
    const restore = () => {
      window.scrollTo(0, y);
      attempts += 1;

      // If content is still loading, the browser may clamp scrollY.
      // Retry a few frames to land on the saved position once layout settles.
      if (attempts < 6 && Math.abs(window.scrollY - y) > 2) {
        window.requestAnimationFrame(restore);
      }
    };

    restore();
  }, [location.key, navigationType]);

  return null;
}
