const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  getMyProfile,
  updateProfile,
  updatePassword,
  getPublicProfile,
} = require("../controllers/userController");

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateProfile);
router.put("/me/password", protect, updatePassword);
router.get("/u/:username", getPublicProfile);

module.exports = router;
