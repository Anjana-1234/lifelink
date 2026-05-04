const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const Donor  = require('../models/Donor');
const { checkEligibility } = require('../utils/eligibility');

// @route   POST /api/auth/register
// @desc    Register new user + save health profile
// @access  Public

const register = async (req, res) => {
  try {
    const { name, email, password, phone, donorDetails } = req.body;

    // Check if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password — never store plain text passwords!
    // 10 = salt rounds (how complex the hash is)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in DB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone
    });

    // Save donor health profile if provided
    // We collect this at registration so users are ready
    // to donate immediately without extra setup steps
    if (donorDetails) {

      // Check if this person is currently eligible to donate
      const eligibilityResult = checkEligibility(
        donorDetails.healthFlags || {},
        Number(donorDetails.age),    // convert string to number
        Number(donorDetails.weight), // convert string to number
        null                         // no previous donation date yet
      );

      await Donor.create({
        userId:      user._id,
        bloodType:   donorDetails.bloodType,
        location:    donorDetails.location,
        age:         Number(donorDetails.age),
        weight:      Number(donorDetails.weight),
        healthFlags: donorDetails.healthFlags || {},
        isEligible:  eligibilityResult.eligible
      });
    }

    // Generate JWT token
    // Token contains user id — used to identify user in future requests
    const token = jwt.sign(
      { id: user._id },              //  NO role — we removed role from users
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Send back token + safe user info (never send password!)
    res.status(201).json({
      success: true,
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        phone: user.phone
        //  NO role field — it doesn't exist anymore
      }
    });

  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @route   POST /api/auth/login
// @desc    Login user and return JWT token
// @access  Public

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Use same message for both cases — don't reveal which is wrong
      // (security best practice — don't tell attackers which emails exist)
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare entered password with the stored hashed password
    // bcrypt handles this automatically — never decrypt, always compare
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate a fresh token on every login
    const token = jwt.sign(
      { id: user._id },              //  NO role — removed from user model
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
        phone: user.phone
        //  NO role field
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @route   GET /api/auth/me
// @desc    Get currently logged in user's data
// @access  Private (requires valid JWT token)

const getMe = async (req, res) => {
  try {
    // req.user.id was attached by the protect middleware
    // .select('-password') means return everything EXCEPT password
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    console.error('GetMe error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe };