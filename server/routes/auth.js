const express = require('express');
const router  = express.Router();
const protect = require('../middleware/auth');
const { register, login, getMe, updateProfile } = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login',    login);

// Private routes
router.get('/me',       protect, getMe);
router.put('/update',   protect, updateProfile); // ← uses updateProfile now

module.exports = router;