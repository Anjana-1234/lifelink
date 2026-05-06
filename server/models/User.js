const mongoose = require('mongoose');

// ── User Schema ───────────────────────────────────────────────
// Stores basic account information only
// No role field — users can be both donors and requesters
const UserSchema = new mongoose.Schema({
  name: {
    type:     String,
    required: [true, 'Name is required'],
    trim:     true
  },
  email: {
    type:     String,
    required: [true, 'Email is required'],
    unique:   true,
    lowercase: true,
    trim:     true
  },
  password: {
    type:      String,
    required:  [true, 'Password is required'],
    minlength: 6
  },
  phone: {
    type:     String,
    required: [true, 'Phone number is required']
  }
  // No role field — removed intentionally
  // Users choose to donate or request from the dashboard
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);