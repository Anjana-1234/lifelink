const express = require('express');
const router  = express.Router();
const Donor   = require('../models/Donor');
const protect = require('../middleware/auth');
const { checkEligibility } = require('../utils/eligibility');

// ─────────────────────────────────────────────────────────────
// @route   POST /api/donors/profile
// @desc    Create or update donor profile
// @access  Private (must be logged in)
// ─────────────────────────────────────────────────────────────
router.post('/profile', protect, async (req, res) => {
  try {
    const { bloodType, location, age, weight, healthFlags } = req.body;

    // Check eligibility based on submitted health answers
    const eligibilityResult = checkEligibility(
      healthFlags || {},
      Number(age),
      Number(weight),
      null // no previous donation on first profile creation
    );

    // Check if donor profile already exists for this user
    let donor = await Donor.findOne({ userId: req.user.id });

    if (donor) {
      // Update existing donor profile
      donor.bloodType   = bloodType;
      donor.location    = location;
      donor.age         = Number(age);
      donor.weight      = Number(weight);
      donor.healthFlags = healthFlags || {};
      donor.isEligible  = eligibilityResult.eligible;
      await donor.save();
    } else {
      // Create new donor profile linked to logged in user
      donor = await Donor.create({
        userId:      req.user.id,  // from JWT token via protect middleware
        bloodType,
        location,
        age:         Number(age),
        weight:      Number(weight),
        healthFlags: healthFlags || {},
        isEligible:  eligibilityResult.eligible
      });
    }

    res.status(201).json({
      success: true,
      donor,
      eligibility: eligibilityResult
    });

  } catch (error) {
    console.error('Donor profile error:', error.message);
    res.status(500).json({ message: 'Server error saving donor profile' });
  }
});

// ─────────────────────────────────────────────────────────────
// @route   GET /api/donors/profile
// @desc    Get current user's donor profile
// @access  Private
// ─────────────────────────────────────────────────────────────
router.get('/profile', protect, async (req, res) => {
  try {
    // Find donor profile by userId (linked to logged in user)
    const donor = await Donor.findOne({ userId: req.user.id });

    res.json({ success: true, donor });
  } catch (error) {
    console.error('Get donor profile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// @route   GET /api/donors/eligible/:bloodType/:district
// @desc    Find eligible donors by blood type and district
// @access  Private
// ─────────────────────────────────────────────────────────────
router.get('/eligible/:bloodType/:district', protect, async (req, res) => {
  try {
    const { bloodType, district } = req.params;

    const { findMatchingDonors, findCompatibleDonors } = require('../utils/matchDonors');

    // Try exact match first
    let donors = await findMatchingDonors(bloodType, district);

    // If no exact match, try compatible types
    if (donors.length === 0) {
      donors = await findCompatibleDonors(bloodType, district);
    }

    res.json({ success: true, count: donors.length, donors });
  } catch (error) {
    console.error('Find eligible donors error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;