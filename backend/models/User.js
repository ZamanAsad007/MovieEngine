const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // null for Google users
  googleId: { type: String }, // null for email users
  avatar: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);