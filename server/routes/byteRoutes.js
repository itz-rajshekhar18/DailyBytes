const express = require('express');
const router = express.Router();
const { validateByteData } = require('../middleware/validation');
const {
  createByte,
  getTodayByte,
  getBytesByCategory,
  getAllBytes,
  getAllCategories,
} = require('../controllers/byteControllers');

// Create a new byte
router.post('/', validateByteData, createByte);

// Get today's byte
router.get('/today', getTodayByte);

// Get all bytes by category
router.get('/category/:categoryName', getBytesByCategory);

// Get all bytes
router.get('/', getAllBytes);

// Get list of all categories
router.get('/category', getAllCategories);

module.exports = router;
