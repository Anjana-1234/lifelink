const mongoose = require('mongoose');

// ── Notification Schema ───────────────────────────────────────
// Stores every in-app notification for each user
// Powers the bell icon in the navbar
// When a blood request is posted → notification created for each matching donor
const NotificationSchema = new mongoose.Schema({

  // Who this notification belongs to
  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true
  },

  // Type of notification — useful for filtering/styling later
  type: {
    type:    String,
    enum:    ['blood_request', 'donor_accepted', 'request_fulfilled'],
    default: 'blood_request'
  },

  // The text shown in the bell dropdown
  message: {
    type:     String,
    required: true
  },

  // Where to navigate when this notification is clicked
  link: {
    type:    String,
    default: '/browse'
  },

  // Has the user opened/read this notification?
  // false = unread (shows red badge on bell icon)
  // true  = read   (no badge)
  isRead: {
    type:    Boolean,
    default: false
  },

  // Extra details about the blood request
  // Used to show blood type badge in notification dropdown
  metadata: {
    bloodType: String,
    hospital:  String,
    district:  String,
    urgency:   String,
    requestId: mongoose.Schema.Types.ObjectId
  }

}, { timestamps: true }); // createdAt used for "2 mins ago" display

module.exports = mongoose.model('Notification', NotificationSchema);