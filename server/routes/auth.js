const express = require('express');
const router  = express.Router();
const protect = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  updateProfile,
  verifyEmail,
  resendVerification
} = require('../controllers/authController');

// Public
router.post('/register',            register);
router.post('/login',               login);
router.get('/verify-email/:token',  verifyEmail);

// Private
router.get('/me',                   protect, getMe);
router.put('/update',               protect, updateProfile);
router.post('/resend-verification', protect, resendVerification);

module.exports = router;