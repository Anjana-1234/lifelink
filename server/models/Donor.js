const mongoose = require('mongoose');

const DonorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  location: {
    district: { type: String, required: true },
    city: { type: String }
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 65
  },
  weight: {
    type: Number,
    required: true,
    min: 50
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isEligible: {
    type: Boolean,
    default: true
  },
  lastDonationDate: {
    type: Date,
    default: null
  },
  nextEligibleDate: {
    type: Date,
    default: null
  },
  totalDonations: {
    type: Number,
    default: 0
  },
  healthFlags: {
    isPregnant:         { type: Boolean, default: false },
    hasChronicDisease:  { type: Boolean, default: false },
    onAntibiotics:      { type: Boolean, default: false },
    recentSurgery:      { type: Boolean, default: false },
    recentTattoo:       { type: Boolean, default: false },
    hasFever:           { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('Donor', DonorSchema);