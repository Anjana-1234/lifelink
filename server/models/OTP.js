const mongoose = require('mongoose');

// ── OTP Model ─────────────────────────────────────────────────
// Stores temporary OTP codes for phone verification
// Each OTP expires after 10 minutes automatically
const OTPSchema = new mongoose.Schema({

  // Which user this OTP belongs to
  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true
  },

  // The phone number OTP was sent to
  phone: {
    type:     String,
    required: true
  },

  // 6-digit code (stored as hashed for security)
  code: {
    type:     String,
    required: true
  },

  // OTP expires after 10 minutes
  // MongoDB TTL index auto-deletes expired documents
  expiresAt: {
    type:    Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 min
    index:   { expireAfterSeconds: 0 } // MongoDB auto-deletes
  },

  // Track attempts to prevent brute force
  attempts: {
    type:    Number,
    default: 0
  },

  // Whether this OTP has been used
  isUsed: {
    type:    Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model('OTP', OTPSchema);