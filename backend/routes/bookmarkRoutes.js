const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getBookmarks, addBookmark, removeBookmark } = require('../controllers/bookmarkController');

router.get('/', protect, getBookmarks);
router.post('/', protect, addBookmark);
router.delete('/:movieId', protect, removeBookmark);

module.exports = router;