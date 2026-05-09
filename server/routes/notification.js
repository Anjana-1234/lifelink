const express      = require('express');
const router       = express.Router();
const protect      = require('../middleware/auth');
const Notification = require('../models/Notification');

// ─────────────────────────────────────────────────────────────
// @route   GET /api/notifications
// @desc    Get all notifications for the logged-in user
//          Also returns unread count for the bell badge
// @access  Private
// ─────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    // Get latest 20 notifications, newest first
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    // Count unread — this number shows on the red badge
    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false
    });

    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/notifications/read-all
// @desc    Mark ALL notifications as read
//          Called when user opens the bell dropdown
// @access  Private
// ─────────────────────────────────────────────────────────────
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/notifications/:id/read
// @desc    Mark ONE notification as read
//          Called when user clicks a specific notification
// @access  Private
// ─────────────────────────────────────────────────────────────
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;