const DEFAULT_BACKEND_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://movieengine.onrender.com";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL;

export const getAIRecommendations = async (message, history = [], token) => {
  const response = await fetch(`${BACKEND_URL}/api/ai/recommend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : null),
    },
    body: JSON.stringify({ message, history })
  });

  if (response.status === 429) {
    throw new Error("TOO_MANY_REQUESTS");
  }

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const messageFromServer = data?.error || data?.message;
    throw new Error(messageFromServer || `Failed to fetch recommendations (${response.status})`);
  }

  return data;
  // Returns: { reply, extractedTitles, updatedHistory }
};
