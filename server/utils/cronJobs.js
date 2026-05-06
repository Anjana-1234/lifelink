const cron         = require('node-cron');
const BloodRequest = require('../models/BloodRequest');
const Donor        = require('../models/Donor');

// ─────────────────────────────────────────────────────────────
// CRON JOB 1: Auto-expire old blood requests
// Runs every hour — finds requests older than 48h and expires them
// Cron syntax '0 * * * *' means: at minute 0 of every hour
// ─────────────────────────────────────────────────────────────
const expireOldRequests = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();

      // Find all open requests where expiresAt has passed
      const result = await BloodRequest.updateMany(
        {
          status:    'open',
          expiresAt: { $lt: now } // $lt = less than (already expired)
        },
        { status: 'expired' }
      );

      if (result.modifiedCount > 0) {
        console.log(`⏰ Expired ${result.modifiedCount} blood request(s)`);
      }
    } catch (error) {
      console.error('Cron expire error:', error.message);
    }
  });

  console.log('✅ Request expiry cron job started');
};

// ─────────────────────────────────────────────────────────────
// CRON JOB 2: Re-enable donors after 56-day cooldown
// Runs every day at midnight
// Cron syntax '0 0 * * *' means: at 00:00 every day
// ─────────────────────────────────────────────────────────────
const unlockEligibleDonors = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const now = new Date();

      // Find donors whose 56-day cooldown has ended
      const result = await Donor.updateMany(
        {
          isEligible:       false,
          nextEligibleDate: { $lt: now } // cooldown has passed
        },
        {
          isEligible:  true,
          isAvailable: true
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`🩸 ${result.modifiedCount} donor(s) unlocked`);
      }
    } catch (error) {
      console.error('Cron donor unlock error:', error.message);
    }
  });

  console.log('✅ Donor eligibility cron job started');
};

module.exports = { expireOldRequests, unlockEligibleDonors };