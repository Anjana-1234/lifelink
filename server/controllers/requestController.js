const BloodRequest = require('../models/BloodRequest');
const Donor        = require('../models/Donor');
const { findMatchingDonors, findCompatibleDonors } = require('../utils/matchDonors');
const { sendDonorNotification } = require('../utils/sendEmail');
const Notification = require('../models/Notification');

// ─────────────────────────────────────────────────────────────
// @route   POST /api/requests
// @desc    Post a new blood request
// @access  Private (must be logged in)
// ─────────────────────────────────────────────────────────────
const createRequest = async (req, res) => {
  try {
    const { bloodType, hospital, location, urgency, unitsNeeded, notes } = req.body;

    // Create the blood request in DB
    // requesterId comes from JWT token via protect middleware
    const request = await BloodRequest.create({
      requesterId: req.user.id,
      bloodType,
      hospital,
      location,
      urgency:     urgency     || 'Urgent',
      unitsNeeded: unitsNeeded || 1,
      notes:       notes       || '',
      status:      'open',
      // expiresAt is auto-set to 48h from now in the model default
    });

    // ── Find matching donors ──────────────────────────────────
    // Try exact blood type match first
    let matchingDonors = await findMatchingDonors(bloodType, location.district);

    // If no exact match found, try compatible blood types
    // Important for rare blood types like AB- or O-
    if (matchingDonors.length === 0) {
      matchingDonors = await findCompatibleDonors(bloodType, location.district);
    }

    res.status(201).json({
      success: true,
      request,
      matchingDonors: matchingDonors.length,
      message: matchingDonors.length > 0
        ? `Request posted! Found ${matchingDonors.length} eligible donor(s) in ${location.district}.`
        : `Request posted! No donors found in ${location.district} right now.`
    });

    // ── Send email notifications to matching donors ───────────────
    // We use Promise.all to send all emails at the same time (parallel)
    // We DON'T await this — emails run in background so API responds fast
    // User gets instant response, emails send behind the scenes
    if (matchingDonors.length > 0) {
      Promise.all(
      matchingDonors.map(donor =>
        sendDonorNotification({
          donorEmail: donor.userId?.email,
          donorName:  donor.userId?.name  || 'Donor',
          request:    { bloodType, hospital, location, urgency }
        })
      )
      ).then(results => {
      const sent = results.filter(Boolean).length;
        console.log(`📧 Emails sent: ${sent}/${matchingDonors.length}`);
      });
    }

// ── Save in-app notifications for matching donors ─────────────
// Each donor gets a notification saved to DB
// This powers the bell icon in the navbar
if (matchingDonors.length > 0) {
  const notifications = matchingDonors.map(donor => ({
    userId:  donor.userId?._id,
    type:    'blood_request',
    message: `🩸 Urgent! ${bloodType} blood needed at ${hospital} in ${location.district}`,
    link:    `/request/${request._id}`,
    isRead:  false,
    metadata: {
      bloodType,
      hospital,
      district:  location.district,
      urgency,
      requestId: request._id
    }
  }));

  // Insert all notifications at once — more efficient than one by one
  await Notification.insertMany(notifications);
  console.log(`🔔 Saved ${notifications.length} in-app notification(s)`);
}

  } catch (error) {
    console.error('Create request error:', error.message);
    res.status(500).json({ message: 'Server error creating request' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/requests
// @desc    Get all open blood requests (with optional filters)
// @access  Private
// ─────────────────────────────────────────────────────────────
const getRequests = async (req, res) => {
  try {
    // Get optional filter params from URL query string
    // Example: GET /api/requests?bloodType=O%2B&district=Colombo
    const { bloodType, district, urgency } = req.query;

    // Build filter object — only add filters that were provided
    const filter = { status: 'open' }; // always only show open requests
    if (bloodType) filter.bloodType            = bloodType;
    if (urgency)   filter.urgency              = urgency;
    if (district)  filter['location.district'] = district;

    // Fetch matching requests, newest first
    // populate() replaces the ID reference with actual user data
    const requests = await BloodRequest.find(filter)
      .populate('requesterId', 'name phone') // get name & phone from User
      .sort({ createdAt: -1 })               // newest first
      .lean();                               // plain JS object (faster)

    // Add isOwner flag — tells frontend if user owns each request
    const requestsWithOwnership = requests.map(r => ({
      ...r,
      isOwner: r.requesterId._id.toString() === req.user.id
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
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/requests/:id
// @desc    Get a single request by its ID
// @access  Private
// ─────────────────────────────────────────────────────────────
const getRequestById = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requesterId', 'name phone email')
      .populate('respondents.donorId'); // get full donor details

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ success: true, request });
  } catch (error) {
    console.error('Get request by id error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/requests/:id/respond
// @desc    Donor responds to a blood request (accept or decline)
// @access  Private
// ─────────────────────────────────────────────────────────────
const respondToRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'decline'

    // Find the donor profile of logged-in user
    const donor = await Donor.findOne({ userId: req.user.id });
    if (!donor) {
      return res.status(400).json({
        message: 'You need a donor profile to respond to requests'
      });
    }

    // Check if donor is currently eligible to donate
    if (!donor.isEligible) {
      return res.status(400).json({
        message: 'You are not currently eligible to donate'
      });
    }

    // Find the blood request
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check request is still open
    if (request.status !== 'open') {
      return res.status(400).json({ message: 'This request is no longer open' });
    }

    // Prevent duplicate responses from same donor
    const alreadyResponded = request.respondents.find(
      r => r.donorId.toString() === donor._id.toString()
    );
    if (alreadyResponded) {
      return res.status(400).json({ message: 'You already responded to this request' });
    }

    // Add donor response to the respondents array in the request
    request.respondents.push({
      donorId:     donor._id,
      status:      action === 'accept' ? 'accepted' : 'declined',
      respondedAt: new Date()
    });

    await request.save();

    res.json({
      success: true,
      message: action === 'accept'
        ? '✅ You accepted! The requester will contact you shortly.'
        : 'You declined this request.'
    });

  } catch (error) {
    console.error('Respond error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/requests/:id/close
// @desc    Requester marks their own request as fulfilled
// @access  Private (only the person who posted it)
// ─────────────────────────────────────────────────────────────
const closeRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only the requester who posted it can close it
    // This is authorization — not just authentication
    if (request.requesterId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Not authorized — only the requester can close this'
      });
    }

    request.status = 'fulfilled';
    await request.save();

    res.json({
      success: true,
      message: 'Request marked as fulfilled. Thank you for saving a life! 🩸'
    });

  } catch (error) {
    console.error('Close request error:', error.message);
    res.status(500).json({ message: 'Server error' });
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