const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieId: { type: String, required: true },   // from TMDB or whatever API you use
  title: { type: String, required: true },
  poster: { type: String },
  rating: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);