const express      = require('express');
const router       = express.Router();
const protect      = require('../middleware/auth');
const Notification = require('../models/Notification');

// ─────────────────────────────────────────────────────────────
// @route   GET /api/notifications
// @desc    Get all notifications for logged-in user
// @access  Private
// ─────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    // Get latest 20 notifications for this user
    // Most recent first
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    // Count unread notifications — used for red badge number
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
// @desc    Mark all notifications as read
// @access  Private
// ─────────────────────────────────────────────────────────────
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/notifications/:id/read
// @desc    Mark single notification as read (when clicked)
// @access  Private
// ─────────────────────────────────────────────────────────────
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;