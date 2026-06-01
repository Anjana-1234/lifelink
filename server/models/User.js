const mongoose = require('mongoose');
const crypto   = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type:     String,
    required: [true, 'Name is required'],
    trim:     true
  },
  email: {
    type:      String,
    required:  [true, 'Email is required'],
    unique:    true,
    lowercase: true,
    trim:      true
  },
  password: {
    type:      String,
    required:  [true, 'Password is required'],
    minlength: 6
  },
  phone: {
    type:     String,
    required: [true, 'Phone is required']
  },
  sex: {
    type:     String,
    enum:     ['male', 'female'],
    required: false
  },

  // ── Email Verification ──────────────────────────────────
  isEmailVerified: {
    type:    Boolean,
    default: false
  },
  emailVerificationToken: {
    type:    String,
    default: null
  },
  emailVerificationExpires: {
    type:    Date,
    default: null
  },

  // ── Phone Verification ──────────────────────────────────
  isPhoneVerified: {
    type:    Boolean,
    default: false
  },

}, { timestamps: true });

// ── Generate email verification token ────────────────────────
UserSchema.methods.generateVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken   = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

module.exports = mongoose.model('User', UserSchema);