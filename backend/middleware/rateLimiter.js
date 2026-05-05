const rateLimit = require("express-rate-limit");

// For AI endpoint — strict limit since each request costs Gemini quota
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 10, // max 10 AI requests per IP per 15 minutes
  standardHeaders: true, // sends RateLimit headers in response
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please wait a few minutes before asking for more recommendations."
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  }
});

// General API limiter — looser, for all other routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 100, // 100 requests per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please slow down."
  }
});

module.exports = { aiLimiter, generalLimiter };
