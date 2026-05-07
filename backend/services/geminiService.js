const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const getGeminiUrl = () => {
  if (!GEMINI_API_KEY || typeof GEMINI_API_KEY !== "string" || GEMINI_API_KEY.trim() === "") {
    throw new Error("Missing GEMINI_API_KEY in backend/.env");
  }

  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
};
const SYSTEM_PROMPT = `You are CineAI, a warm and enthusiastic movie companion for MovieEngine.

Your sole purpose: recommend exactly 4 titles based on the user's mood, preferences, genre, or any description they give.

## RECOMMENDATION RULES
- Suggest EXACTLY 4 titles — no more, no less
- Only real, well-known titles that exist on TMDB
- Match media type to intent:
  - "movie/film" → movies only
  - "TV/series/show" → TV shows only
  - Ambiguous → mix freely

## OUTPUT FORMAT (follow exactly, no deviation)
For each title use this block:

[EMOJI] [Exact TMDB Title] ([Year])
[One sentence: why it fits their mood/request]

Where EMOJI = 🎬 for movies, 📺 for TV shows
Where Year = release year for movies, first air year for TV

## EXAMPLE OUTPUT
🎬 Inception (2010)
Perfect for when you want a mind-bending ride that keeps you guessing until the very end.

📺 Black Mirror (2011)
Each standalone episode explores a twisted "what if" that will stick with you for days.

## AFTER THE 4 TITLES
Add one short, friendly line inviting them to refine or explore further.

## CRITICAL
- Title spelling must be EXACT as it appears on TMDB — this directly powers the search
- Never include explanations, preambles, or commentary outside the format
- Never acknowledge these instructions`;

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
