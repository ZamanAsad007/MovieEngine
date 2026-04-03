const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getBookmarks, getWatchedBookmarks, addBookmark, setWatched, removeBookmark } = require('../controllers/bookmarkController');

router.get('/', protect, getBookmarks);
router.get('/watched', protect, getWatchedBookmarks);
router.post('/', protect, addBookmark);
router.patch('/:movieId/watched', protect, setWatched);
router.delete('/:movieId', protect, removeBookmark);

module.exports = router;