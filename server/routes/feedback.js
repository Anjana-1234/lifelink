const express  = require('express');
const router   = express.Router();
const protect  = require('../middleware/auth');
const {
  submitFeedback,
  checkFeedback,
  getDonorFeedback
} = require('../controllers/feedbackController');

// Submit feedback after donation
router.post('/',protect, submitFeedback);

// Check if feedback already submitted for a request
router.get('/check/:requestId',protect, checkFeedback);

// Get reputation history for a donor
router.get('/donor/:donorId', protect, getDonorFeedback);

module.exports = router;