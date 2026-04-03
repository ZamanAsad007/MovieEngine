const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

async function request(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : null),
      ...(token ? { Authorization: `Bearer ${token}` } : null),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message = data?.message || `Request failed: ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const authApi = {
  register: (payload) => request("/api/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: payload }),
  me: (token) => request("/api/auth/me", { token }),
  googleUrl: () => `${BACKEND_URL}/api/auth/google`,
};

export const bookmarksApi = {
  list: (token) => request("/api/bookmarks", { token }),
  listWatched: (token) => request("/api/bookmarks/watched", { token }),
  add: (token, bookmark) => request("/api/bookmarks", { method: "POST", token, body: bookmark }),
  remove: (token, movieId) => request(`/api/bookmarks/${movieId}`, { method: "DELETE", token }),
  setWatched: (token, movieId, watched) =>
    request(`/api/bookmarks/${movieId}/watched`, { method: "PATCH", token, body: { watched } }),
};
