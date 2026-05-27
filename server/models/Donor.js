const mongoose = require('mongoose');

const DonorSchema = new mongoose.Schema({
  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
    unique:   true
  },
  bloodType: {
    type:     String,
    required: true,
    enum:     ['A+','A-','B+','B-','AB+','AB-','O+','O-']
  },
  location: {
    district: { type: String, required: true },
    city:     { type: String, default: ''    }
  },
  age:    { type: Number, required: true },
  weight: { type: Number, required: true },

  healthFlags: {
    hasFever:          { type: Boolean, default: false },
    onAntibiotics:     { type: Boolean, default: false },
    recentSurgery:     { type: Boolean, default: false },
    recentTattoo:      { type: Boolean, default: false },
    isPregnant:        { type: Boolean, default: false },
    hasChronicDisease: { type: Boolean, default: false },
  },

  isEligible:       { type: Boolean, default: false },
  isAvailable:      { type: Boolean, default: true  },
  lastDonationDate: { type: Date,    default: null  },
  nextEligibleDate: { type: Date,    default: null  },
  totalDonations:   { type: Number,  default: 0     },

  // ── Reputation ───────────────────────────────────────────
  positiveRatings: { type: Number, default: 0   },
  negativeRatings: { type: Number, default: 0   },
  reputationScore: { type: Number, default: 100 },

}, { timestamps: true });

module.exports = mongoose.model('Donor', DonorSchema);