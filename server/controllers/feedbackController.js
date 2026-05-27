const DonorFeedback = require('../models/DonorFeedback');
const BloodRequest  = require('../models/BloodRequest');
const Donor         = require('../models/Donor');
const Notification  = require('../models/Notification');
const { emitToUser } = require('../utils/socketHelper');

// ─────────────────────────────────────────────────────────────
// @route   POST /api/feedback
// @desc    Requester submits feedback about a donor
// @access  Private
// ─────────────────────────────────────────────────────────────
const submitFeedback = async (req, res) => {
  try {
    const { requestId, donorId, rating, comment } = req.body;

    // Validate inputs
    if (!requestId || !donorId || !rating) {
      return res.status(400).json({
        message: 'requestId, donorId and rating are required'
      });
    }

    if (!['positive', 'negative'].includes(rating)) {
      return res.status(400).json({
        message: 'Rating must be positive or negative'
      });
    }

    // Find blood request
    const request = await BloodRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only the requester can give feedback
    if (request.requesterId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Only the requester can submit feedback'
      });
    }

    // Request must be fulfilled first
    if (request.status !== 'fulfilled') {
      return res.status(400).json({
        message: 'Can only give feedback on fulfilled requests'
      });
    }

    // Find donor
    const donor = await Donor.findById(donorId);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    // Check for duplicate feedback
    const existing = await DonorFeedback.findOne({
      requesterId: req.user.id,
      requestId
    });
    if (existing) {
      return res.status(400).json({
        message: 'You already submitted feedback for this request'
      });
    }

    // ── Save feedback ─────────────────────────────────────────
    const feedback = await DonorFeedback.create({
      requesterId: req.user.id,
      donorId,
      requestId,
      rating,
      comment:     comment?.trim() || ''
    });

    // ── Update donor reputation ───────────────────────────────
    if (rating === 'positive') {
      donor.positiveRatings += 1;
    } else {
      donor.negativeRatings += 1;
    }

    const total          = donor.positiveRatings + donor.negativeRatings;
    donor.reputationScore = Math.round((donor.positiveRatings / total) * 100);
    await donor.save();

    console.log(
      `⭐ Donor ${donorId} reputation updated: ${donor.reputationScore}%`
    );

    // ── Notify donor about feedback received ──────────────────
    try {
      const emoji   = rating === 'positive' ? '⭐' : '📝';
      const message = rating === 'positive'
        ? `${emoji} You received positive feedback for your donation at ${request.hospital}!`
        : `${emoji} You received feedback for your donation at ${request.hospital}.`;

      const notification = await Notification.create({
        userId:   donor.userId,
        type:     'feedback_received',
        message,
        link:     `/request/${requestId}`,
        isRead:   false,
        metadata: {
          rating,
          requestId,
          hospital: request.hospital
        }
      });

      // Send real-time if donor is online
      emitToUser(donor.userId, notification);

    } catch (notifErr) {
      console.error('Feedback notification error:', notifErr.message);
    }

    res.status(201).json({
      success:            true,
      message:            'Feedback submitted! Thank you.',
      newReputationScore: donor.reputationScore
    });

  } catch (error) {
    // Handle duplicate key error from MongoDB
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You already submitted feedback for this request'
      });
    }
    console.error('Submit feedback error:', error.message);
    res.status(500).json({ message: 'Server error submitting feedback' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/feedback/check/:requestId
// @desc    Check if feedback already submitted for a request
// @access  Private
// ─────────────────────────────────────────────────────────────
const checkFeedback = async (req, res) => {
  try {
    const feedback = await DonorFeedback.findOne({
      requesterId: req.user.id,
      requestId:   req.params.requestId
    });

    res.json({
      success:     true,
      hasFeedback: !!feedback,
      feedback:    feedback || null
    });

  } catch (error) {
    console.error('Check feedback error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/feedback/donor/:donorId
// @desc    Get reputation history for a donor
// @access  Private
// ─────────────────────────────────────────────────────────────
const getDonorFeedback = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.donorId);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const feedbackList = await DonorFeedback.find({
      donorId: req.params.donorId
    })
      .populate('requesterId', 'name')
      .populate('requestId',   'hospital location bloodType')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success:         true,
      feedbackList,
      reputationScore: donor.reputationScore  || 100,
      positiveRatings: donor.positiveRatings  || 0,
      negativeRatings: donor.negativeRatings  || 0,
      totalRatings:    (donor.positiveRatings || 0) +
                       (donor.negativeRatings || 0)
    });

  } catch (error) {
    console.error('Get donor feedback error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitFeedback,
  checkFeedback,
  getDonorFeedback
};