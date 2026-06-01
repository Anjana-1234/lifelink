const express  = require('express');
const router   = express.Router();
const protect  = require('../middleware/auth');
const {
  sendOTPCode,
  verifyOTPCode,
  getVerificationStatus
} = require('../controllers/otpController');

// Send OTP to user's phone
router.post('/send',   protect, sendOTPCode);

// Verify OTP code entered by user
router.post('/verify', protect, verifyOTPCode);

// Check verification status
router.get('/status',  protect, getVerificationStatus);

module.exports = router;