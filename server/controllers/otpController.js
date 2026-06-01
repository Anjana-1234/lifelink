const crypto = require('crypto');
const OTP    = require('../models/OTP');
const User   = require('../models/User');
const { sendOTP, generateOTP, formatSriLankaPhone } = require('../utils/smsHelper');

// Max OTP attempts before lockout
const MAX_ATTEMPTS = 3;

// ─────────────────────────────────────────────────────────────
// @route   POST /api/otp/send
// @desc    Send OTP to user's phone number
// @access  Private
// ─────────────────────────────────────────────────────────────
const sendOTPCode = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.isPhoneVerified) {
      return res.status(400).json({
        message: 'Phone number already verified'
      });
    }

    // Format phone number for Sri Lanka
    const formattedPhone = formatSriLankaPhone(user.phone);

    // Delete any existing unused OTPs for this user
    // So only one active OTP exists at a time
    await OTP.deleteMany({ userId: req.user.id, isUsed: false });

    // Generate new 6-digit OTP
    const otpCode = generateOTP();

    // Hash OTP before saving — never store plain OTP in DB
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otpCode)
      .digest('hex');

    // Save OTP to DB
    await OTP.create({
      userId:    req.user.id,
      phone:     formattedPhone,
      code:      hashedOTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      attempts:  0,
      isUsed:    false
    });

    // Send SMS
    const result = await sendOTP(formattedPhone, otpCode);

    if (!result.success) {
      return res.status(500).json({
        message: 'Failed to send SMS. Please try again.',
        error:   result.error
      });
    }

    // Don't reveal the OTP in response — it's in the SMS!
    res.json({
      success: true,
      message: `OTP sent to ${formattedPhone}. Check your SMS!`,
      phone:   formattedPhone // show formatted number to user
    });

  } catch (error) {
    console.error('Send OTP error:', error.message);
    res.status(500).json({ message: 'Server error sending OTP' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/otp/verify
// @desc    Verify the OTP code entered by user
// @access  Private
// ─────────────────────────────────────────────────────────────
const verifyOTPCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || code.length !== 6) {
      return res.status(400).json({
        message: 'Please enter the 6-digit code'
      });
    }

    // Find the latest OTP for this user
    const otpDoc = await OTP.findOne({
      userId: req.user.id,
      isUsed: false
    }).sort({ createdAt: -1 });

    // No OTP found
    if (!otpDoc) {
      return res.status(400).json({
        message: 'No active OTP found. Please request a new code.'
      });
    }

    // Check if expired
    if (new Date() > otpDoc.expiresAt) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({
        message: 'OTP has expired. Please request a new code.'
      });
    }

    // Check attempt limit — prevent brute force
    if (otpDoc.attempts >= MAX_ATTEMPTS) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({
        message: 'Too many failed attempts. Please request a new code.'
      });
    }

    // Hash the entered code to compare with stored hash
    const hashedInput = crypto
      .createHash('sha256')
      .update(code.trim())
      .digest('hex');

    // Wrong code
    if (hashedInput !== otpDoc.code) {
      // Increment attempt counter
      otpDoc.attempts += 1;
      await otpDoc.save();

      const remaining = MAX_ATTEMPTS - otpDoc.attempts;
      return res.status(400).json({
        message: remaining > 0
          ? `Wrong code. ${remaining} attempt(s) remaining.`
          : 'Too many failed attempts. Please request a new code.'
      });
    }

    // ── OTP is correct ────────────────────────────────────────
    // Mark OTP as used
    otpDoc.isUsed = true;
    await otpDoc.save();

    // Mark user's phone as verified
    await User.findByIdAndUpdate(req.user.id, {
      isPhoneVerified: true
    });

    console.log(`✅ Phone verified for user ${req.user.id}`);

    res.json({
      success: true,
      message: '📱 Phone number verified successfully!'
    });

  } catch (error) {
    console.error('Verify OTP error:', error.message);
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/otp/status
// @desc    Check if user's phone is verified
// @access  Private
// ─────────────────────────────────────────────────────────────
const getVerificationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('phone isPhoneVerified');

    res.json({
      success:         true,
      isPhoneVerified: user.isPhoneVerified || false,
      phone:           user.phone
    });

  } catch (error) {
    console.error('Get status error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { sendOTPCode, verifyOTPCode, getVerificationStatus };