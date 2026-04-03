const Bookmark = require('../models/Bookmark');

exports.getBookmarks = async (req, res) => {
  const bookmarks = await Bookmark.find({ userId: req.userId });
  res.json(bookmarks);
};

exports.addBookmark = async (req, res) => {
  const { movieId, title, poster, rating } = req.body;
  const exists = await Bookmark.findOne({ userId: req.userId, movieId });
  if (exists) return res.status(400).json({ message: 'Already bookmarked' });

  const bookmark = await Bookmark.create({ userId: req.userId, movieId, title, poster, rating });
  res.status(201).json(bookmark);
};

exports.removeBookmark = async (req, res) => {
  await Bookmark.findOneAndDelete({ userId: req.userId, movieId: req.params.movieId });
  res.json({ message: 'Bookmark removed' });
};