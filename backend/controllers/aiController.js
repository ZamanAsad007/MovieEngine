const { getGeminiRecommendations } = require("../services/geminiService");

// Parse movie titles from Gemini's formatted response
// Looks for lines starting with 🎬
const extractMovieTitles = (text) => {
  const lines = text.split("\n");
  const titles = [];

  for (const line of lines) {
    if (line.startsWith("🎬")) {
      // Extract title from: 🎬 The Dark Knight (2008)
      const match = line.match(/🎬\s+(.+?)\s+\((\d{4})\)/);
      if (match) {
        titles.push({
          title: match[1].trim(),
          year: match[2].trim()
        });
      }
    }
  }

  return titles;
};

const recommend = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Validate and sanitize history
    const safeHistory = Array.isArray(history) ? history.slice(-10) : [];
    // Only keep last 10 exchanges to avoid token overflow

    const { replyText, updatedHistory } = await getGeminiRecommendations(
      message.trim(),
      safeHistory
    );

    const extractedTitles = extractMovieTitles(replyText);

    res.json({
      reply: replyText,
      extractedTitles,   // [{title: "The Dark Knight", year: "2008"}, ...]
      updatedHistory     // send back to frontend to maintain conversation context
    });

  } catch (error) {
    console.error("AI recommendation error:", error.message);
    const isProd = process.env.NODE_ENV === "production";
    const msg = error?.message || "Failed to get recommendations. Please try again.";
    const isQuota = /quota|rate\s*limit|too\s*many\s*requests/i.test(msg);
    res.status(isQuota ? 429 : 500).json({
      error: isProd
        ? (isQuota
          ? "AI is temporarily rate-limited. Please try again in a bit."
          : "Failed to get recommendations. Please try again.")
        : msg,
    });
  }
};

module.exports = { recommend };
