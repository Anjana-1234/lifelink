const mongoose = require('mongoose');

const DonorFeedbackSchema = new mongoose.Schema({

  // Who gave the feedback (the blood requester)
  requesterId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true
  },

  // Which donor is being rated
  donorId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Donor',
    required: true
  },

  // Which blood request this is for
  requestId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'BloodRequest',
    required: true
  },

  // thumbs up or thumbs down
  rating: {
    type:     String,
    enum:     ['positive', 'negative'],
    required: true
  },

  // Optional written comment
  comment: {
    type:      String,
    default:   '',
    maxlength: 300
  },

}, { timestamps: true });

// ── Prevent duplicate feedback for same request ───────────────
// One requester can only rate one donor per request
DonorFeedbackSchema.index(
  { requesterId: 1, requestId: 1 },
  { unique: true }
);

module.exports = mongoose.model('DonorFeedback', DonorFeedbackSchema);