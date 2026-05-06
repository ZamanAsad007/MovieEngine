const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // null for Google users
  googleId: { type: String }, // null for email users
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpiry: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);