const mongoose = require('mongoose');

// ── Notification Schema ───────────────────────────────────────
// Every notification is stored here
// When a blood request is posted, a notification is created
// for each matching donor so they can see it in the bell icon
const NotificationSchema = new mongoose.Schema({

  // Who receives this notification
  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true
  },

  // Type of notification — makes it easy to filter later
  type: {
    type: String,
    enum: ['blood_request', 'donor_accepted', 'request_fulfilled'],
    default: 'blood_request'
  },

  // The message shown in the bell dropdown
  message: {
    type:     String,
    required: true
  },

  // Link to navigate to when notification is clicked
  link: {
    type:    String,
    default: '/browse'
  },

  // Has the user seen this notification?
  // Used to show/hide the red badge on the bell icon
  isRead: {
    type:    Boolean,
    default: false  // all notifications start as unread
  },

  // Extra data — stores request details for display
  metadata: {
    bloodType: String,
    hospital:  String,
    district:  String,
    urgency:   String,
    requestId: mongoose.Schema.Types.ObjectId
  }

}, { timestamps: true }); // createdAt tells us when notification was sent

module.exports = mongoose.model('Notification', NotificationSchema);
