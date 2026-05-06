const User = require("../models/User");
const Bookmark = require("../models/Bookmark");
const bcrypt = require("bcryptjs");

const AVATARS = [
  { id: "bottts-cosmos", url: "https://api.dicebear.com/7.x/bottts/svg?seed=cosmos" },
  { id: "bottts-nova", url: "https://api.dicebear.com/7.x/bottts/svg?seed=nova" },
  { id: "bottts-pixel", url: "https://api.dicebear.com/7.x/bottts/svg?seed=pixel" },
  { id: "bottts-cipher", url: "https://api.dicebear.com/7.x/bottts/svg?seed=cipher" },
  { id: "bottts-matrix", url: "https://api.dicebear.com/7.x/bottts/svg?seed=matrix" },
  { id: "bottts-nebula", url: "https://api.dicebear.com/7.x/bottts/svg?seed=nebula" },
  { id: "bottts-orbit", url: "https://api.dicebear.com/7.x/bottts/svg?seed=orbit" },
  { id: "bottts-pulsar", url: "https://api.dicebear.com/7.x/bottts/svg?seed=pulsar" },
  { id: "bottts-quasar", url: "https://api.dicebear.com/7.x/bottts/svg?seed=quasar" },
  { id: "bottts-zenith", url: "https://api.dicebear.com/7.x/bottts/svg?seed=zenith" },
];

const isValidAvatarId = (avatarId) => {
  if (typeof avatarId !== "string") return false;
  return AVATARS.some((a) => a.id === avatarId);
};

const isValidUsername = (value) => {
  const username = String(value || "").trim().toLowerCase();
  if (username.length < 3 || username.length > 20) return false;
  return /^[a-z0-9_]+$/.test(username);
};

// GET /api/user/me
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "_id name email avatar username googleId password createdAt"
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      username: user.username,
      memberSince: user.createdAt,
      isGoogleUser: Boolean(user.googleId),
      hasPassword: Boolean(user.password),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/user/me
// Update name, avatar, username
const updateProfile = async (req, res) => {
  try {
    const { name, avatar, username } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (typeof username !== "undefined") {
      const nextUsername = String(username || "").trim().toLowerCase();
      if (nextUsername && nextUsername !== user.username) {
        if (!isValidUsername(nextUsername)) {
          return res
            .status(400)
            .json({ error: "Username must be 3–20 chars and use a-z, 0-9, _ only" });
        }

        const taken = await User.findOne({ username: nextUsername });
        if (taken && String(taken._id) !== String(user._id)) {
          return res.status(400).json({ error: "Username already taken" });
        }

        user.username = nextUsername;
      }
    }

    if (typeof name === "string") {
      const trimmed = name.trim();
      if (!trimmed) return res.status(400).json({ error: "Name is required" });
      user.name = trimmed;
    }

    if (typeof avatar !== "undefined") {
      if (avatar === null || avatar === "") {
        user.avatar = undefined;
      } else {
        if (!isValidAvatarId(avatar)) {
          return res.status(400).json({ error: "Invalid avatar selection" });
        }
        user.avatar = avatar;
      }
    }

    await user.save();
    res.json({
      message: "Profile updated",
      user: {
        name: user.name,
        avatar: user.avatar,
        username: user.username,
      },
    });
  } catch (err) {
    // Duplicate key (username)
    if (err && err.code === 11000) {
      return res.status(400).json({ error: "Username already taken" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/user/me/password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.password) {
      return res.status(400).json({
        error: "Password change is not available for Google accounts.",
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both fields are required" });
    }

    if (String(newPassword).length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    const isMatch = await bcrypt.compare(String(currentPassword), user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(String(newPassword), 10);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/user/u/:username — public
const getPublicProfile = async (req, res) => {
  try {
    const username = String(req.params.username || "").trim().toLowerCase();
    const user = await User.findOne({ username }).select(
      "name avatar username createdAt"
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    const bookmarks = await Bookmark.find({ userId: user._id, watched: false })
      .sort({ createdAt: -1 })
      .select("title poster mediaType movieId rating");

    const watched = await Bookmark.find({ userId: user._id, watched: true })
      .sort({ watchedAt: -1, createdAt: -1 })
      .select("title poster mediaType movieId rating watchedAt");

    res.json({
      user: {
        name: user.name,
        avatar: user.avatar,
        username: user.username,
        memberSince: user.createdAt,
      },
      bookmarks: {
        movies: bookmarks.filter((b) => b.mediaType === "movie"),
        tv: bookmarks.filter((b) => b.mediaType === "tv"),
      },
      watched: {
        movies: watched.filter((w) => w.mediaType === "movie"),
        tv: watched.filter((w) => w.mediaType === "tv"),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getMyProfile, updateProfile, updatePassword, getPublicProfile };
