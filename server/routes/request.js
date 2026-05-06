const express = require('express');
const router  = express.Router();
const protect = require('../middleware/auth');

// Import all controller functions
const {
  createRequest,
  getRequests,
  getMyRequests,
  getRequestById,
  respondToRequest,
  closeRequest
} = require('../controllers/requestController');

// ── All routes below require login (protect middleware runs first) ──

// POST   /api/requests        → create a new blood request
router.post('/',           protect, createRequest);

// GET    /api/requests        → get all open requests (supports ?bloodType=&district= filters)
router.get('/',            protect, getRequests);

// GET    /api/requests/my     → get only MY posted requests
// ⚠️ IMPORTANT: this must be BEFORE /:id route
// otherwise "my" gets treated as a MongoDB id and throws an error
router.get('/my',          protect, getMyRequests);

// GET    /api/requests/:id    → get one specific request by its ID
router.get('/:id',         protect, getRequestById);

// PUT    /api/requests/:id/respond → donor accepts or declines a request
router.put('/:id/respond', protect, respondToRequest);

// PUT    /api/requests/:id/close   → requester marks their request as fulfilled
router.put('/:id/close',   protect, closeRequest);

module.exports = router;