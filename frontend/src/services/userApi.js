const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const getMyProfile = async (token) => {
  const res = await fetch(`${BACKEND_URL}/api/user/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
};

export const updateProfile = async (token, data) => {
  const res = await fetch(`${BACKEND_URL}/api/user/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Update failed");
  }

  return res.json();
};

export const updatePassword = async (token, data) => {
  const res = await fetch(`${BACKEND_URL}/api/user/me/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Password update failed");
  }

  return res.json();
};

export const getPublicProfile = async (username) => {
  const res = await fetch(`${BACKEND_URL}/api/user/u/${username}`);
  if (!res.ok) throw new Error("Profile not found");
  return res.json();
};
