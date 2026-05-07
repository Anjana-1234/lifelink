// ─────────────────────────────────────────────────────────────
// Check if a donor is eligible to donate blood
// Based on WHO blood donation guidelines
// Returns { eligible: true/false, reason: 'why' }
// ─────────────────────────────────────────────────────────────
const checkEligibility = (healthFlags, age, weight, lastDonationDate) => {

  // Rule 1: Age must be 18–65
  if (age < 18 || age > 65) {
    return { eligible: false, reason: 'Age must be between 18 and 65 years' };
  }

  // Rule 2: Weight must be at least 50kg
  if (weight < 50) {
    return { eligible: false, reason: 'Weight must be at least 50kg' };
  }

  // Rule 3: Must wait 56 days between donations
  if (lastDonationDate) {
    const daysSince = Math.floor(
      (Date.now() - new Date(lastDonationDate)) / (1000 * 60 * 60 * 24)
    );
    if (daysSince < 56) {
      const daysLeft = 56 - daysSince;
      return {
        eligible: false,
        reason:   `Must wait ${daysLeft} more days before donating again (56-day rule)`
      };
    }
  }

  // Rule 4: Temporary health disqualifications
  // These can change — user can update their profile to reflect recovery
  if (healthFlags.hasFever) {
    return { eligible: false, reason: 'Cannot donate while having fever or flu' };
  }
  if (healthFlags.onAntibiotics) {
    return { eligible: false, reason: 'Cannot donate while on antibiotics' };
  }
  if (healthFlags.recentSurgery) {
    return { eligible: false, reason: 'Cannot donate within 6 months of surgery' };
  }
  if (healthFlags.recentTattoo) {
    return { eligible: false, reason: 'Cannot donate within 6 months of a tattoo or piercing' };
  }
  if (healthFlags.isPregnant) {
    return { eligible: false, reason: 'Cannot donate while pregnant or breastfeeding' };
  }

  // Rule 5: Permanent disqualifications
  if (healthFlags.hasChronicDisease) {
    return { eligible: false, reason: 'Chronic disease disqualifies from donation' };
  }

  // All checks passed
  return { eligible: true, reason: 'Eligible to donate' };
};

// Calculate next eligible donation date (56 days from last donation)
const getNextEligibleDate = (donationDate) => {
  const next = new Date(donationDate);
  next.setDate(next.getDate() + 56);
  return next;
};

module.exports = { checkEligibility, getNextEligibleDate };