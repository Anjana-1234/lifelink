const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const User   = require('../models/User');
const Donor  = require('../models/Donor');
const { checkEligibility }      = require('../utils/eligibility');
const { sendVerificationEmail } = require('../utils/sendEmail');

// ── Helper: generate JWT ──────────────────────────────────────
const generateToken = (userId) => jwt.sign(
  { id: userId },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE }
);

// ── Helper: safe user object ──────────────────────────────────
const safeUser = (user) => ({
  id:              user._id,
  name:            user.name,
  email:           user.email,
  phone:           user.phone,
  sex:             user.sex,
  isEmailVerified: user.isEmailVerified || false
});

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, phone, sex, donorDetails } = req.body;

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password:        hashedPassword,
      phone,
      sex,
      isEmailVerified: false
    });

    // Create donor profile
    if (donorDetails) {
      try {
        const eligibilityResult = checkEligibility(
          donorDetails.healthFlags || {},
          Number(donorDetails.age),
          Number(donorDetails.weight),
          null
        );
        await Donor.create({
          userId:      user._id,
          bloodType:   donorDetails.bloodType  || 'A+',
          location:    donorDetails.location   || { district: 'Colombo' },
          age:         Number(donorDetails.age),
          weight:      Number(donorDetails.weight),
          healthFlags: donorDetails.healthFlags || {},
          isEligible:  eligibilityResult.eligible
        });
      } catch (donorErr) {
        console.error('Donor create error:', donorErr.message);
      }
    }

    // Generate verification token and send email
    try {
      const verificationToken = user.generateVerificationToken();
      await user.save();

      const verificationUrl =
        `${process.env.FRONTEND_URL}/email-verified` +
        `?token=${verificationToken}&status=pending`;

      // Actually for backend redirect, use backend URL:
      const backendVerifyUrl =
        `${process.env.BACKEND_URL || 'http://localhost:5000'}` +
        `/api/auth/verify-email/${verificationToken}`;

      sendVerificationEmail({
        userEmail:       user.email,
        userName:        user.name,
        verificationUrl: backendVerifyUrl
      }).catch(err =>
        console.error('Verification email send error:', err.message)
      );
    } catch (emailErr) {
      console.error('Verification token error:', emailErr.message);
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user:    safeUser(user),
      message: 'Account created! Check your email to verify. 🩸'
    });

  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user:    safeUser(user)
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/auth/verify-email/:token
// @access  Public — called from email link
// ─────────────────────────────────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    console.log('🔍 Verifying token:', req.params.token.substring(0, 10) + '...');

    // Hash the token to compare with DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken:   hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('❌ Token invalid or expired');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/email-verified?status=error`);
    }

    // Mark verified + clear token
    user.isEmailVerified          = true;
    user.emailVerificationToken   = null;
    user.emailVerificationExpires = null;
    await user.save();

    console.log(`✅ Email verified: ${user.email}`);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/email-verified?status=success`);

  } catch (error) {
    console.error('Verify email error:', error.message);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/email-verified?status=error`);
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/resend-verification
// @access  Private
// ─────────────────────────────────────────────────────────────
const resendVerification = async (req, res) => {
  try {
    console.log('📧 Resend verification for user:', req.user.id);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // ── Use Railway backend URL ───────────────────────────
    // Falls back to localhost for local development
    const backendUrl =
      process.env.BACKEND_URL ||
      process.env.RAILWAY_STATIC_URL ||
      'https://lifelink-production-0edd.up.railway.app';

    const verificationUrl =
      `${backendUrl}/api/auth/verify-email/${verificationToken}`;

    console.log('📧 Sending verification to:', user.email);
    console.log('🔗 Verification URL:', verificationUrl);

    const sent = await sendVerificationEmail({
      userEmail:       user.email,
      userName:        user.name,
      verificationUrl: verificationUrl
    });

    if (sent) {
      console.log(`✅ Verification email sent to ${user.email}`);
      return res.json({
        success: true,
        message: 'Verification email sent! Check your inbox.'
      });
    } else {
      return res.status(500).json({
        message: 'Email failed to send. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Resend verification error:', error.message);
    res.status(500).json({
      message: 'Server error: ' + error.message
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    console.error('GetMe error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/auth/update
// @access  Private
// ─────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone, sex } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, sex },
      { new: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  verifyEmail,
  resendVerification
};