const BloodRequest   = require('../models/BloodRequest');
const Donor          = require('../models/Donor');
const Notification   = require('../models/Notification');
const { findMatchingDonors, findCompatibleDonors } = require('../utils/matchDonors');
const { sendDonorNotification } = require('../utils/sendEmail');

// ── Helper: Send real-time notification via Socket.io ─────────
// Safely tries to emit to a connected user
// If user is offline, notification is still saved in DB
// So they'll see it next time they open the app
const emitToUser = (userId, notification) => {
  try {
    // Lazy import to avoid circular dependency issues
    const { io, connectedUsers } = require('../index');

    const socketId = connectedUsers.get(userId.toString());

    if (socketId) {
      // User is currently online — send immediately
      io.to(socketId).emit('new_notification', notification);
      console.log(`Real-time notification sent to user ${userId}`);
    } else {
      // User is offline — notification saved in DB, they'll see it on next login
      console.log(`User ${userId} offline — notification saved to DB`);
    }
  } catch (err) {
    // Never crash the request flow because of socket errors
    console.error('Socket emit error (non-fatal):', err.message);
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/requests
// @desc    Post a new blood request
// @access  Private
// ─────────────────────────────────────────────────────────────
const createRequest = async (req, res) => {
  try {
    const {
      bloodType,
      hospital,
      location,
      urgency,
      unitsNeeded,
      notes
    } = req.body;

    // ── Validate required fields ──────────────────────────────
    if (!bloodType || !hospital || !location?.district) {
      return res.status(400).json({
        message: 'Blood type, hospital and district are required'
      });
    }

    // ── Create blood request in DB ────────────────────────────
    const request = await BloodRequest.create({
      requesterId: req.user.id,
      bloodType,
      hospital,
      location,
      urgency:     urgency     || 'Urgent',
      unitsNeeded: unitsNeeded || 1,
      notes:       notes       || '',
      status:      'open',
    });

    // ── Find matching donors ──────────────────────────────────
    // Step 1: Try exact blood type match first
    let matchingDonors = await findMatchingDonors(
      bloodType,
      location.district
    );

    // Step 2: If no exact match, try compatible blood types
    // Example: O- can donate to everyone
    if (matchingDonors.length === 0) {
      matchingDonors = await findCompatibleDonors(
        bloodType,
        location.district
      );
    }

    // ── Respond to client immediately ─────────────────────────
    // We respond BEFORE sending emails/notifications
    // This makes the API feel fast — user doesn't wait for emails
    res.status(201).json({
      success:        true,
      request,
      matchingDonors: matchingDonors.length,
      message: matchingDonors.length > 0
        ? `Request posted! Found ${matchingDonors.length} eligible donor(s) in ${location.district}.`
        : `Request posted! No donors found in ${location.district} right now. We'll notify when one registers.`
    });

    // ── Everything below runs AFTER client gets response ──────
    // This is called "fire and forget" — we don't await these
    // If they fail, the request is still posted successfully

    if (matchingDonors.length === 0) return;

    // ── Step 1: Save in-app notifications to DB ───────────────
    // Each matching donor gets a notification
    // Powers the bell icon in navbar
    let savedNotifications = [];
    try {
      const notificationDocs = matchingDonors.map(donor => ({
        userId:   donor.userId?._id,
        type:     'blood_request',
        message:  `${bloodType} blood needed at ${hospital} in ${location.district} — ${urgency} request`,
        link:     `/request/${request._id}`,
        isRead:   false,
        metadata: {
          bloodType,
          hospital,
          district:  location.district,
          urgency,
          requestId: request._id
        }
      }));

      // insertMany is much faster than saving one by one
      savedNotifications = await Notification.insertMany(notificationDocs);
      console.log(`Saved ${savedNotifications.length} in-app notification(s)`);

    } catch (notifError) {
      // Don't crash if notifications fail
      console.error('Notification save error:', notifError.message);
    }

    // ── Step 2: Send real-time Socket.io notifications ────────
    // For each donor who is currently online,
    // push the notification to their browser instantly
    // No need to wait for 30s polling anymore!
    try {
      matchingDonors.forEach((donor, index) => {
        const userId       = donor.userId?._id;
        const notification = savedNotifications[index];

        if (userId && notification) {
          emitToUser(userId, notification);
        }
      });
    } catch (socketError) {
      console.error('Socket notification error:', socketError.message);
    }

    // ── Step 3: Send email notifications ─────────────────────
    // Runs in background — parallel for all donors
    // Uses Promise.allSettled so one failure doesn't stop others
    try {
      const emailResults = await Promise.allSettled(
        matchingDonors.map(donor =>
          sendDonorNotification({
            donorEmail: donor.userId?.email,
            donorName:  donor.userId?.name || 'Donor',
            request:    {
              bloodType,
              hospital,
              location,
              urgency
            }
          })
        )
      );

      // Count successes and failures for logging
      const sent   = emailResults.filter(r => r.status === 'fulfilled' && r.value).length;
      const failed = emailResults.length - sent;

      console.log(`Emails sent: ${sent}/${matchingDonors.length}${failed > 0 ? ` (${failed} failed)` : ''}`);

    } catch (emailError) {
      console.error('Email batch error:', emailError.message);
    }

  } catch (error) {
    console.error('Create request error:', error.message);

    // Only send error response if we haven't already responded
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error creating request' });
    }
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/requests
// @desc    Get all open blood requests (with optional filters)
// @access  Private
// ─────────────────────────────────────────────────────────────
const getRequests = async (req, res) => {
  try {
    const { bloodType, district, urgency } = req.query;

    // Build filter — only add fields that were provided
    const filter = { status: 'open' };
    if (bloodType) filter.bloodType            = bloodType;
    if (urgency)   filter.urgency              = urgency;
    if (district)  filter['location.district'] = district;

    const requests = await BloodRequest.find(filter)
      .populate('requesterId', 'name phone')
      .sort({ createdAt: -1 })
      .lean();

    // Add isOwner flag so frontend knows which requests belong to current user
    const requestsWithOwnership = requests.map(r => ({
      ...r,
      isOwner: r.requesterId?._id?.toString() === req.user.id
    }));

    res.json({
      success:  true,
      count:    requests.length,
      requests: requestsWithOwnership
    });

  } catch (error) {
    console.error('Get requests error:', error.message);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/requests/my
// @desc    Get current user's own posted requests
// @access  Private
// ─────────────────────────────────────────────────────────────
const getMyRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requesterId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });

  } catch (error) {
    console.error('Get my requests error:', error.message);
    res.status(500).json({ message: 'Server error fetching your requests' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/requests/:id
// @desc    Get a single request by ID
// @access  Private
// ─────────────────────────────────────────────────────────────
const getRequestById = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requesterId',   'name phone email')
      .populate('respondents.donorId');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ success: true, request });

  } catch (error) {
    console.error('Get request by id error:', error.message);

    // Handle invalid MongoDB ID format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Request not found — invalid ID' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/requests/:id/respond
// @desc    Donor accepts or declines a blood request
// @access  Private
// ─────────────────────────────────────────────────────────────
const respondToRequest = async (req, res) => {
  try {
    const { action } = req.body;

    // Validate action
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({
        message: 'Action must be accept or decline'
      });
    }

    // Find donor profile of logged-in user
    const donor = await Donor.findOne({ userId: req.user.id });
    if (!donor) {
      return res.status(400).json({
        message: 'You need a donor profile to respond to requests'
      });
    }

    // Only eligible donors can accept
    if (action === 'accept' && !donor.isEligible) {
      return res.status(400).json({
        message: 'You are not currently eligible to donate blood'
      });
    }

    // Find the blood request
    const request = await BloodRequest.findById(req.params.id)
      .populate('requesterId', 'name');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Request must still be open
    if (request.status !== 'open') {
      return res.status(400).json({
        message: 'This request is no longer open'
      });
    }

    // Prevent owner from responding to their own request
    if (request.requesterId._id.toString() === req.user.id) {
      return res.status(400).json({
        message: 'You cannot respond to your own blood request'
      });
    }

    // Prevent duplicate responses
    const alreadyResponded = request.respondents.find(
      r => r.donorId.toString() === donor._id.toString()
    );
    if (alreadyResponded) {
      return res.status(400).json({
        message: 'You already responded to this request'
      });
    }

    // Add response to respondents array
    request.respondents.push({
      donorId:     donor._id,
      status:      action === 'accept' ? 'accepted' : 'declined',
      respondedAt: new Date()
    });

    await request.save();

    // ── Notify requester in real-time when donor accepts ──────
    if (action === 'accept') {
      try {
        // Save notification to DB for the requester
        const notification = await Notification.create({
          userId:   request.requesterId._id,
          type:     'donor_accepted',
          message:  `A donor accepted your ${request.bloodType} blood request at ${request.hospital}`,
          link:     `/request/${request._id}`,
          isRead:   false,
          metadata: {
            bloodType: request.bloodType,
            hospital:  request.hospital,
            requestId: request._id
          }
        });

        // Send real-time notification to requester if online
        emitToUser(request.requesterId._id, notification);

      } catch (notifError) {
        // Don't fail the response if notification fails
        console.error('Donor accepted notification error:', notifError.message);
      }
    }

    res.json({
      success: true,
      message: action === 'accept'
        ? 'You accepted! The requester will contact you shortly.'
        : 'You declined this request.'
    });

  } catch (error) {
    console.error('Respond error:', error.message);
    res.status(500).json({ message: 'Server error responding to request' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/requests/:id/close
// @desc    Requester marks their request as fulfilled
// @access  Private (only the requester who posted it)
// ─────────────────────────────────────────────────────────────
const closeRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Authorization — only the person who posted can close it
    if (request.requesterId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Not authorized — only the requester can close this'
      });
    }

    // Already closed?
    if (request.status === 'fulfilled') {
      return res.status(400).json({
        message: 'This request is already marked as fulfilled'
      });
    }

    // Mark as fulfilled
    request.status      = 'fulfilled';
    request.fulfilledAt = new Date();
    await request.save();

    // ── Update donor's donation record ────────────────────────
    // Find the donor who accepted and update their last donation date
    // This triggers the 56-day cooldown automatically
    try {
      const acceptedResponse = request.respondents.find(
        r => r.status === 'accepted'
      );

      if (acceptedResponse) {
        await Donor.findByIdAndUpdate(
          acceptedResponse.donorId,
          {
            lastDonationDate: new Date(),
            isEligible:       false, // start 56-day cooldown
            $inc: { totalDonations: 1 }
          }
        );
        console.log(`🩸 Donor ${acceptedResponse.donorId} donation recorded`);
      }
    } catch (donorUpdateError) {
      // Don't fail close if donor update fails
      console.error('Donor update error:', donorUpdateError.message);
    }

    res.json({
      success: true,
      message: 'Request marked as fulfilled. Thank you for saving a life! 🩸'
    });

  } catch (error) {
    console.error('Close request error:', error.message);
    res.status(500).json({ message: 'Server error closing request' });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getMyRequests,
  getRequestById,
  respondToRequest,
  closeRequest
};