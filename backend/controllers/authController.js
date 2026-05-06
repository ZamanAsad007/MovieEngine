const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../services/emailService');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const AVATARS = [
  { id: 'bottts-cosmos', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=cosmos' },
  { id: 'bottts-nova', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=nova' },
  { id: 'bottts-pixel', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=pixel' },
  { id: 'bottts-cipher', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=cipher' },
  { id: 'bottts-matrix', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=matrix' },
  { id: 'bottts-nebula', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=nebula' },
  { id: 'bottts-orbit', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=orbit' },
  { id: 'bottts-pulsar', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=pulsar' },
  { id: 'bottts-quasar', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=quasar' },
  { id: 'bottts-zenith', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=zenith' },
];

const getAvatarUrl = (avatarId) => {
  const found = AVATARS.find((a) => a.id === avatarId);
  return found?.url ?? 'https://api.dicebear.com/7.x/bottts/svg?seed=default';
};

const normalizeUsernameBase = (value) => String(value || '')
  .toLowerCase()
  .trim()
  .replace(/\s+/g, '')
  .replace(/[^a-z0-9_]/g, '');

const generateUsername = async ({ name, email }) => {
  const baseRaw = normalizeUsernameBase(name) || normalizeUsernameBase(String(email || '').split('@')[0]);
  const base = baseRaw.length >= 3 ? baseRaw : `user${baseRaw}`;

  for (let i = 0; i < 8; i++) {
    const suffix = String(Math.floor(Math.random() * 999));
    const trimmedBase = base.slice(0, Math.max(3, 20 - suffix.length));
    const candidate = `${trimmedBase}${suffix}`.slice(0, 20);
    // eslint-disable-next-line no-await-in-loop
    const taken = await User.findOne({ username: candidate });
    if (!taken) return candidate;
  }

  return `${base.slice(0, 17)}${Date.now().toString().slice(-3)}`.slice(0, 20);
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(String(password), 10);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const generatedUsername = await generateUsername({ name, email });

    const user = new User({
      name,
      email,
      password: hashed,
      username: generatedUsername,
      isVerified: false,
      verificationToken,
      verificationTokenExpiry,
    });
    await user.save();

    const backendBase = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const verificationLink = `${backendBase}/api/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    // Fire-and-forget: user is registered even if email fails
    sendVerificationEmail(email, name, verificationLink).catch((emailErr) => {
      console.error('Verification email failed to send:', emailErr?.message || emailErr);
    });

    return res.status(201).json({
      message:
        'Account created! Please check your email to verify your account before logging in.',
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Only block explicitly-unverified accounts (old accounts without this field won't be locked out)
    if (user.isVerified === false) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        resend: true,
      });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: getAvatarUrl(user.avatar),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('_id name email avatar username');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        // Keep navbar unchanged: return a resolved URL here
        avatar: getAvatarUrl(user.avatar),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};