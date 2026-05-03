const express = require('express');
const router = express.Router();

// Import controller functions
const { register, login, getMe } = require('../controllers/authController');

// Import the protect middleware
const protect = require('../middleware/auth');

// @route POST /api/auth/register
router.post('/register', register);

// @route POST /api/auth/login
router.post('/login', login);

// @route GET /api/auth/me  (Protected — needs token)
router.get('/me', protect, getMe);

module.exports = router;