const mongoose = require('mongoose');

const DonationLogSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: true
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest',
    required: true
  },
  donationDate: {
    type: Date,
    default: Date.now
  },
  nextEligibleDate: {
    type: Date,
    required: true
  },
  hospital: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('DonationLog', DonationLogSchema);