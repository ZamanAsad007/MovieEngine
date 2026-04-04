const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, me } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

function getFrontendRedirectBase() {
  const raw = process.env.FRONTEND_ORIGIN;
  if (!raw) return 'http://localhost:5173';
  const first = raw.split(',').map(s => s.trim()).filter(Boolean)[0];
  return first || 'http://localhost:5173';
}

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${getFrontendRedirectBase()}?error=oauth_failed`,
  }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // Redirect to frontend with token in URL
    const frontend = getFrontendRedirectBase();
    res.redirect(`${frontend}?token=${token}`);
  }
);

module.exports = router;