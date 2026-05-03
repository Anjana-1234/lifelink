const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Donor = require('../models/Donor');
const { checkEligibility } = require('../utils/eligibility');

// @route   POST /api/auth/register
// @desc    Register a new user (donor or requester)
// @access  Public

const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, donorDetails } = req.body;

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password before saving
    // Number 10 is the "salt rounds" — higher = more secure but slower
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone
    });

    // If the user is registering as a donor, save their health profile
    if (role === 'donor' && donorDetails) {

      // Check eligibility before registering as donor
      const eligibilityResult = checkEligibility(
        donorDetails.healthFlags || {},
        donorDetails.age,
        donorDetails.weight,
        null // No previous donation date on first registration
      );

      await Donor.create({
        userId: user._id,
        bloodType: donorDetails.bloodType,
        location: donorDetails.location,
        age: donorDetails.age,
        weight: donorDetails.weight,
        isEligible: eligibilityResult.eligible,
        healthFlags: donorDetails.healthFlags || {}
      });
    }

    // Generate JWT token
    // This token is sent to frontend and stored — used for all future requests
    const token = jwt.sign(
      { id: user._id, role: user.role }, // Payload (data inside token)
      process.env.JWT_SECRET,             // Secret key
      { expiresIn: process.env.JWT_EXPIRE } // Token expires in 7 days
    );

    // Send response with token and basic user info
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @route   POST /api/auth/login
// @desc    Login user and return token
// @access  Public

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare the entered password with the hashed password in DB
    // bcrypt.compare() handles the decryption automatically
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate new token on login
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private (needs token)

const getMe = async (req, res) => {
  try {
    // req.user was set by the protect middleware
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe };