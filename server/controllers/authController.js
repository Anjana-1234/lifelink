const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const Donor  = require('../models/Donor');
const { checkEligibility } = require('../utils/eligibility');

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register new user + save health profile
// @access  Public
// ─────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    // Extract all fields including sex from request body
    const { name, email, password, phone, sex, donorDetails } = req.body;

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password — never store plain text passwords!
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in DB — includes sex field
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      sex  // male or female
    });

    // Save donor health profile if provided
    // Collected at registration so matching works instantly in emergencies
    if (donorDetails) {
      const eligibilityResult = checkEligibility(
        donorDetails.healthFlags || {},
        Number(donorDetails.age),
        Number(donorDetails.weight),
        null // no previous donation date on first registration
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

    // Generate JWT token — contains user id for future requests
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Return token + safe user info (never send password!)
    res.status(201).json({
      success: true,
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
        sex:   user.sex  // include sex in response
      }
    });

  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login user and return JWT token
// @access  Public
// ─────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Same message for both cases — don't reveal which field is wrong
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare entered password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate fresh token on every login
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
        sex:   user.sex
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get currently logged in user's data
// @access  Private (requires valid JWT token)
// ─────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user.id was set by protect middleware
    // .select('-password') returns everything EXCEPT password
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    console.error('GetMe error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/auth/update
// @desc    Update user personal info (name, phone, sex)
// @access  Private
// ─────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone, sex } = req.body;

    // Find user and update — return updated document with { new: true }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, sex },
      { new: true }  // return updated doc not original
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

module.exports = { register, login, getMe, updateProfile };