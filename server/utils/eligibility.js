// This file contains all the logic to check if a donor is eligible to donate
// Based on WHO (World Health Organization) blood donation guidelines

const checkEligibility = (healthFlags, age, weight, lastDonationDate) => {

  // Rule 1: Age must be between 18 and 65
  if (age < 18 || age > 65) {
    return {
      eligible: false,
      reason: 'Age must be between 18 and 65 years'
    };
  }

  // Rule 2: Weight must be at least 50kg
  if (weight < 50) {
    return {
      eligible: false,
      reason: 'Weight must be at least 50kg'
    };
  }

  // Rule 3: Must wait 56 days (8 weeks) between donations
  if (lastDonationDate) {
    const daysSinceLastDonation = Math.floor(
      (Date.now() - new Date(lastDonationDate)) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastDonation < 56) {
      const daysRemaining = 56 - daysSinceLastDonation;
      return {
        eligible: false,
        reason: `Must wait ${daysRemaining} more days before donating again`
      };
    }
  }

  // Rule 4: Check health flags (temporary disqualifications)
  if (healthFlags.hasFever) {
    return { eligible: false, reason: 'Cannot donate with fever' };
  }

  if (healthFlags.onAntibiotics) {
    return { eligible: false, reason: 'Cannot donate while on antibiotics' };
  }

  if (healthFlags.recentSurgery) {
    return { eligible: false, reason: 'Cannot donate within 6 months of surgery' };
  }

  if (healthFlags.recentTattoo) {
    return { eligible: false, reason: 'Cannot donate within 6 months of getting a tattoo' };
  }

  if (healthFlags.isPregnant) {
    return { eligible: false, reason: 'Cannot donate while pregnant or breastfeeding' };
  }

  // Rule 5: Permanent disqualifications
  if (healthFlags.hasChronicDisease) {
    return { eligible: false, reason: 'Chronic disease disqualifies from donation' };
  }

  // All checks passed — donor is eligible!
  return { eligible: true, reason: 'Eligible to donate' };
};

// Calculate the next eligible date (56 days from donation date)
const getNextEligibleDate = (donationDate) => {
  const next = new Date(donationDate);
  next.setDate(next.getDate() + 56);
  return next;
};

module.exports = { checkEligibility, getNextEligibleDate };