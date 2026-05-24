const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
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
    required: [true, 'Phone number is required']
  },
  sex: {
    type: String,
    enum: ['male', 'female'],
    required: false
  },

  // ── Email Verification ──────────────────────────────────
  isEmailVerified: {
    type:    Boolean,
    default: false   // false until user clicks verification link
  },
  emailVerificationToken: {
    type:    String,
    default: null    // random token sent in email
  },
  emailVerificationExpires: {
    type:    Date,
    default: null    // token expires after 24 hours
  },

}, { timestamps: true });

// ── Generate email verification token ────────────────────────
// Called when user registers or requests new verification email
UserSchema.methods.generateVerificationToken = function() {
  // Create random 32-byte hex token
  const token = crypto.randomBytes(32).toString('hex');

  // Save hashed version to DB — never store plain tokens
  this.emailVerificationToken   = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Token expires in 24 hours
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  // Return PLAIN token — this goes in the email link
  return token;
};

module.exports = mongoose.model('User', UserSchema);