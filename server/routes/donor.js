const express          = require('express');
const router           = express.Router();
const Donor            = require('../models/Donor');
const protect          = require('../middleware/auth');
const { checkEligibility } = require('../utils/eligibility');

// ─────────────────────────────────────────────────────────────
// @route   POST /api/donors/profile
// @desc    Create or update donor health profile
//          Recalculates eligibility every time it's called
// @access  Private
// ─────────────────────────────────────────────────────────────
router.post('/profile', protect, async (req, res) => {
  try {
    const { bloodType, location, age, weight, healthFlags } = req.body;

    // Find existing donor profile for this user
    let donor = await Donor.findOne({ userId: req.user.id });

    // Use existing lastDonationDate when rechecking eligibility
    // So the 56-day rule is still enforced even when updating other flags
    const lastDonationDate = donor?.lastDonationDate || null;

    // Recalculate eligibility with ALL rules:
    // 1. Age check (18-65)
    // 2. Weight check (50kg+)
    // 3. 56-day cooldown since last donation
    // 4. Health flags (fever, antibiotics, tattoo, etc.)
    const eligibilityResult = checkEligibility(
      healthFlags || {},
      Number(age),
      Number(weight),
      lastDonationDate // pass existing donation date — keeps cooldown active
    );

    if (donor) {
      // ── Update existing profile ──
      donor.bloodType    = bloodType;
      donor.location     = location;
      donor.age          = Number(age);
      donor.weight       = Number(weight);
      donor.healthFlags  = healthFlags || {};
      donor.isEligible   = eligibilityResult.eligible;
      // Keep isAvailable in sync with eligibility
      donor.isAvailable  = eligibilityResult.eligible;
      await donor.save();
    } else {
      // ── Create new profile ──
      donor = await Donor.create({
        userId:      req.user.id,
        bloodType,
        location,
        age:         Number(age),
        weight:      Number(weight),
        healthFlags: healthFlags || {},
        isEligible:  eligibilityResult.eligible,
        isAvailable: eligibilityResult.eligible
      });
    }

    res.status(201).json({
      success:     true,
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

    let donors = await findMatchingDonors(bloodType, district);
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