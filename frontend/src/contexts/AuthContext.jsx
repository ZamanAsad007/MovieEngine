import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../services/backendApi.js";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Accept token from Google OAuth redirect (?token=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthToken = params.get("token");
    if (!oauthToken) return;

    params.delete("token");
    const next = `${location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;

    localStorage.setItem("token", oauthToken);
    setToken(oauthToken);
    navigate(next, { replace: true });
  }, [location.pathname, location.search, navigate]);

  // Keep localStorage in sync
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // Fetch /me when token changes
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await authApi.me(token);
        if (!cancelled) setUser(data.user);
      } catch (err) {
        if (cancelled) return;
        // token invalid
        setToken("");
        setUser(null);
        setError(err?.message || "Session expired");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async ({ email, password }) => {
    const data = await authApi.login({ email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async ({ name, email, password }) => {
    const data = await authApi.register({ name, email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    setToken("");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      loading,
      error,
      login,
      register,
      logout,
      googleLoginUrl: authApi.googleUrl(),
    }),
    [token, user, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
