const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const User   = require('../models/User');
const Donor  = require('../models/Donor');
const { checkEligibility }      = require('../utils/eligibility');
const { sendVerificationEmail } = require('../utils/sendEmail');

// ── Helper: generate JWT ──────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// ── Helper: safe user object (no password) ────────────────────
const safeUser = (user) => ({
  id:              user._id,
  name:            user.name,
  email:           user.email,
  phone:           user.phone,
  sex:             user.sex,
  isEmailVerified: user.isEmailVerified
});

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, phone, sex, donorDetails } = req.body;

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      sex,
      isEmailVerified: false  // must verify email
    });

    // ── Create donor profile ──────────────────────────────────
    if (donorDetails) {
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
    }

    // ── Send verification email ───────────────────────────────
    // Generate token and save to user
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Build verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    // Send email in background — don't block registration
    sendVerificationEmail({
      userEmail:       user.email,
      userName:        user.name,
      verificationUrl: verificationUrl
    }).catch(err => console.error('Verification email error:', err.message));

    // Generate JWT and respond
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: safeUser(user),
      message: 'Account created! Please check your email to verify your account.'
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
      user: safeUser(user)
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/auth/verify-email/:token
// @desc    Verify email address from link in email
// @access  Public
// ─────────────────────────────────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    // Hash the token from URL to compare with DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      emailVerificationToken:   hashedToken,
      emailVerificationExpires: { $gt: Date.now() } // not expired
    });

    if (!user) {
      return res.status(400).json({
        message: 'Verification link is invalid or has expired'
      });
    }

    // Mark email as verified and clear token
    user.isEmailVerified          = true;
    user.emailVerificationToken   = null;
    user.emailVerificationExpires = null;
    await user.save();

    console.log(`✅ Email verified for ${user.email}`);

    // Redirect to frontend with success
    res.redirect(
      `${process.env.FRONTEND_URL}/email-verified?status=success`
    );

  } catch (error) {
    console.error('Verify email error:', error.message);
    res.redirect(
      `${process.env.FRONTEND_URL}/email-verified?status=error`
    );
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Private
// ─────────────────────────────────────────────────────────────
const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: 'Email is already verified'
      });
    }

    // Generate new token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    const verificationUrl =
      `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    await sendVerificationEmail({
      userEmail:       user.email,
      userName:        user.name,
      verificationUrl: verificationUrl
    });

    res.json({
      success: true,
      message: 'Verification email resent! Check your inbox.'
    });

  } catch (error) {
    console.error('Resend verification error:', error.message);
    res.status(500).json({ message: 'Failed to resend verification email' });
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