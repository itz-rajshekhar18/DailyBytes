const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleAuth,
  googleCallback,
  getUserProfile,
} = require('../controllers/userController');
const { validateUserRegistration } = require('../middleware/validation');
const { protect } = require('../middleware/authMiddleware');

// Register and login routes
router.post('/', validateUserRegistration, registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/profile', protect, getUserProfile);

module.exports = router; 