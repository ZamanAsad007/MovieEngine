const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, me } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../services/emailService');

function getFrontendRedirectBase() {
  const raw = process.env.FRONTEND_ORIGIN;
  if (!raw) return 'http://localhost:5173';
  const first = raw.split(',').map(s => s.trim()).filter(Boolean)[0];
  return first || 'http://localhost:5173';
}

function getFrontendVerifyBase() {
  return process.env.FRONTEND_URL || getFrontendRedirectBase();
}

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);

// GET /api/auth/verify-email?token=xxx&email=xxx
router.get('/verify-email', async (req, res) => {
  try {
    const { token, email } = req.query;
    const frontend = getFrontendVerifyBase();

    if (!token || !email) {
      return res.redirect(`${frontend}/verify?status=invalid`);
    }

    const decodedEmail = decodeURIComponent(String(email));
    const user = await User.findOne({ email: decodedEmail });
    if (!user) {
      return res.redirect(`${frontend}/verify?status=invalid`);
    }

    if (user.isVerified) {
      return res.redirect(`${frontend}/verify?status=already`);
    }

    const expired = !user.verificationTokenExpiry || user.verificationTokenExpiry < new Date();
    if (user.verificationToken !== token || expired) {
      return res.redirect(`${frontend}/verify?status=expired`);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    return res.redirect(`${frontend}/verify?status=success`);
  } catch (err) {
    console.error('Email verification error:', err);
    return res.redirect(`${getFrontendVerifyBase()}/verify?status=error`);
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: String(email).trim() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Google OAuth users skip verification entirely
    if (user.googleId && !user.password) {
      return res.status(400).json({ message: 'Google accounts do not require verification' });
    }

    // Only resend for explicitly-unverified accounts
    if (user.isVerified !== false) {
      return res.status(400).json({ message: 'This account is already verified' });
    }

    user.verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const backendBase = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const verificationLink = `${backendBase}/api/auth/verify-email?token=${user.verificationToken}&email=${encodeURIComponent(user.email)}`;

    await sendVerificationEmail(user.email, user.name, verificationLink);

    return res.json({ message: 'Verification email resent. Please check your inbox.' });
  } catch (err) {
    console.error('Resend verification error:', err);
    return res.status(500).json({ message: 'Failed to resend email. Please try again.' });
  }
});

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