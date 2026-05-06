const Donor = require('../models/Donor');

// ─────────────────────────────────────────────────────────────
// Blood type compatibility chart
// Key = blood type needed, Value = blood types that can donate
// Example: Person needs A+ → donors with A+, A-, O+, O- can help
// O- is universal donor (can donate to anyone)
// AB+ is universal recipient (can receive from anyone)
// ─────────────────────────────────────────────────────────────
const COMPATIBLE_DONORS = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-'],
};

// ─────────────────────────────────────────────────────────────
// Find donors with EXACT blood type match in same district
// This is the first search — exact match is always preferred
// ─────────────────────────────────────────────────────────────
const findMatchingDonors = async (bloodType, district) => {
  try {
    const donors = await Donor.find({
      bloodType,                         // exact blood type match
      isEligible:          true,         // passed health checks
      isAvailable:         true,         // not currently unavailable
      'location.district': district      // same district
    })
    .populate('userId', 'name phone email') // get contact info from User model
    .lean(); // returns plain JS object — faster than Mongoose document

    return donors;
  } catch (error) {
    console.error('Match donors error:', error.message);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────
// Find donors with COMPATIBLE blood types in same district
// Used when no exact match is found — expands the search
// ─────────────────────────────────────────────────────────────
const findCompatibleDonors = async (bloodType, district) => {
  try {
    // Get list of compatible blood types for the needed type
    const compatibleTypes = COMPATIBLE_DONORS[bloodType] || [bloodType];

    const donors = await Donor.find({
      bloodType:           { $in: compatibleTypes }, // $in = match any in array
      isEligible:          true,
      isAvailable:         true,
      'location.district': district
    })
    .populate('userId', 'name phone email')
    .lean();

    return donors;
  } catch (error) {
    console.error('Compatible donors error:', error.message);
    return [];
  }
};

module.exports = { findMatchingDonors, findCompatibleDonors };