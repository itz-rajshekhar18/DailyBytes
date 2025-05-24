const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Configure OAuth client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Google OAuth login/register
// @route   POST /api/users/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, googleId, profilePicture } = req.body;

  // Check if user exists
  let user = await User.findOne({ email });

  if (user) {
    // Update Google ID if it doesn't exist
    if (!user.googleId) {
      user.googleId = googleId;
      user.profilePicture = profilePicture || user.profilePicture;
      await user.save();
    }
  } else {
    // Create new user
    user = await User.create({
      firstName,
      lastName,
      email,
      googleId,
      profilePicture,
    });
  }

  if (user) {
    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Google OAuth callback
// @route   GET /api/users/google/callback
// @access  Public
const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=Missing+authorization+code`);
  }
  
  try {
    // Create a test user for development
    const testUser = {
      _id: '123456789012345678901234',
      firstName: null,
      lastName: null,
      email: 'test.user@example.com',
      profilePicture: 'https://ui-avatars.com/api/?name=T+U&background=0D8ABC&color=fff'
    };
    
    // Generate token for the test user
    const token = generateToken(testUser._id);
    
    return res.redirect(`${process.env.FRONTEND_URL}/google-auth-success?token=${token}&userId=${testUser._id}&firstName=${encodeURIComponent(testUser.firstName)}&lastName=${encodeURIComponent(testUser.lastName)}&email=${encodeURIComponent(testUser.email)}&profilePicture=${encodeURIComponent(testUser.profilePicture)}`);
    
  } catch (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication+failed&details=${encodeURIComponent(error.message)}`);
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePicture: user.profilePicture,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  googleCallback,
  getUserProfile,
}; 