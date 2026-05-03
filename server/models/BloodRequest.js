const mongoose = require('mongoose');

const BloodRequestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  hospital: {
    type: String,
    required: true
  },
  location: {
    district: { type: String, required: true },
    city: { type: String }
  },
  urgency: {
    type: String,
    enum: ['Critical', 'Urgent', 'Normal'],
    default: 'Urgent'
  },
  unitsNeeded: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['open', 'fulfilled', 'expired'],
    default: 'open'
  },
  respondents: [{
    donorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' },
    status:     { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    respondedAt:{ type: Date, default: Date.now }
  }],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
  }
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);