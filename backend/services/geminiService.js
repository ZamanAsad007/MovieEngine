const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const getGeminiUrl = () => {
  if (!GEMINI_API_KEY || typeof GEMINI_API_KEY !== "string" || GEMINI_API_KEY.trim() === "") {
    throw new Error("Missing GEMINI_API_KEY in backend/.env");
  }

  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
};

const SYSTEM_PROMPT = `You are CineAI, a friendly and knowledgeable recommendation assistant for MovieEngine.

Your job is to suggest movies and TV shows based on the user's mood, feelings, preferences, genre interests, or any description they give.

Rules:
- Always suggest exactly 4 titles per response
- Only suggest real, well-known titles that exist on TMDB
- Choose what to recommend based on the user's intent:
  - If they ask for movies/films: recommend movies
  - If they ask for TV/series/shows: recommend TV shows
  - If it’s ambiguous: you may mix movies and TV shows

For each title provide:
  1. Title — exact English title as it appears on TMDB (very important for search)
  2. Year — release year in brackets e.g. (2008) for movies, first air year e.g. (2016) for TV
  3. Reason — one sentence explaining why it matches the user's mood or request

Format your response EXACTLY like this every time, no deviation:
🎬 [Movie Title] ([Year])
[One sentence reason]

📺 [TV Show Title] ([Year])
[One sentence reason]

(repeat until you list exactly 4 titles total)

After the 4 titles, add one short friendly follow-up line asking if they want different suggestions or have more preferences.

Keep tone warm, casual and enthusiastic.`;

const getGeminiRecommendations = async (userMessage, conversationHistory = []) => {
  const contents = [
    ...conversationHistory,
    {
      role: "user",
      parts: [{ text: userMessage }]
    }
  ];

  const response = await fetch(getGeminiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents,
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 1024,
        topP: 0.9
      }
    })
  });

  if (!response.ok) {
    const raw = await response.text();
    let err;
    try {
      err = raw ? JSON.parse(raw) : null;
    } catch {
      err = raw;
    }

    const message = err?.error?.message || err?.message || (typeof err === "string" ? err : null);
    throw new Error(message || `Gemini API error (${response.status})`);
  }

  const data = await response.json();
  const replyText = data.candidates[0].content.parts[0].text;
  const updatedHistory = [
    ...contents,
    {
      role: "model",
      parts: [{ text: replyText }]
    }
  ];

  return { replyText, updatedHistory };
};

module.exports = { getGeminiRecommendations };
