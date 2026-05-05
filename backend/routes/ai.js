const express = require("express");
const router = express.Router();
const { recommend } = require("../controllers/aiController");

const protect = require("../middleware/authMiddleware");
const { aiLimiter } = require("../middleware/rateLimiter");

router.post("/recommend", aiLimiter, protect, recommend);

module.exports = router;
