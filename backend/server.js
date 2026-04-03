const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const app = express();
dotenv.config();
require('./config/passport');

const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const allowedOrigins = FRONTEND_ORIGIN.split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin / server-to-server / Postman
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.get('/', (req, res) => {
  res.send('MovieEngine API is running');
});

const authRoutes = require('./routes/authRoutes')
const bookmarkRoutes = require('./routes/bookmarkRoutes')

app.use('/api/auth', authRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

const mongoUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
if (!mongoUri) {
  console.error('Missing MONGO_URI / MONGO_URI_TEST in environment');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));