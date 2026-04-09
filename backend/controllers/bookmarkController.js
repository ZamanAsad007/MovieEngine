const Bookmark = require('../models/Bookmark');

exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.userId });
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getWatchedBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.userId, watched: true });
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addBookmark = async (req, res) => {
  try {
    const { movieId, title, poster, rating } = req.body;

    if (!movieId || !title) {
      return res.status(400).json({ message: 'movieId and title are required' });
    }

    const exists = await Bookmark.findOne({ userId: req.userId, movieId });
    if (exists) return res.status(400).json({ message: 'Already bookmarked' });

    const bookmark = await Bookmark.create({
      userId: req.userId,
      movieId,
      title,
      poster,
      rating,
    });
    res.status(201).json(bookmark);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.setWatched = async (req, res) => {
  try {
    const { watched } = req.body;
    const isWatched = Boolean(watched);

    const { title, poster, rating } = req.body;

    const filter = { userId: req.userId, movieId: req.params.movieId };
    const update = {
      $set: { watched: isWatched, watchedAt: isWatched ? new Date() : null },
      ...(isWatched
        ? {
            $setOnInsert: {
              userId: req.userId,
              movieId: req.params.movieId,
              ...(title ? { title } : null),
              ...(poster ? { poster } : null),
              ...(rating !== undefined ? { rating } : null),
            },
          }
        : null),
    };

    const updated = await Bookmark.findOneAndUpdate(filter, update, {
      new: true,
      upsert: isWatched,
      setDefaultsOnInsert: true,
    });

    if (!updated) return res.status(404).json({ message: 'Bookmark not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    await Bookmark.findOneAndDelete({ userId: req.userId, movieId: req.params.movieId });
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};