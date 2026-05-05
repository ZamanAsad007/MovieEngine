const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const getGeminiUrl = () => {
  if (!GEMINI_API_KEY || typeof GEMINI_API_KEY !== "string" || GEMINI_API_KEY.trim() === "") {
    throw new Error("Missing GEMINI_API_KEY in backend/.env");
  }

  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
};

const SYSTEM_PROMPT = `You are CineAI, a friendly and knowledgeable movie recommendation assistant for MovieEngine.

Your job is to suggest movies based on the user's mood, feelings, preferences, genre interests, or any description they give.

Rules:
- Always suggest exactly 4 movies per response
- Only suggest real, well-known movies that exist on TMDB
- For each movie provide:
  1. Title — exact English title as it appears on TMDB (very important for search)
  2. Year — release year in brackets e.g. (2008)
  3. Reason — one sentence explaining why it matches the user's mood or request

Format your response EXACTLY like this every time, no deviation:
🎬 [Title] ([Year])
[One sentence reason]

🎬 [Title] ([Year])
[One sentence reason]

(repeat for all 4 movies)

After the 4 movies, add one short friendly follow-up line asking if they want different suggestions or have more preferences.

Never recommend TV shows, documentaries, or anime unless the user specifically asks.
Never go off-topic from movies.
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
