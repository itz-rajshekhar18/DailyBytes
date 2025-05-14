const asyncHandler = require('express-async-handler');
const Byte = require('../models/Byte');

// @desc    Create a new byte
// @route   POST /api/byte
// @access  Public
const createByte = asyncHandler(async (req, res) => {
  const byte = await Byte.create(req.body);
  res.status(201).json({
    success: true,
    data: byte,
  });
});

// @desc    Get today's byte
// @route   GET /api/byte/today
// @access  Public
const getTodayByte = asyncHandler(async (req, res) => {
  // Get today's date (start and end)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Find byte published today
  const byte = await Byte.findOne({
    datePublished: {
      $gte: today,
      $lt: tomorrow,
    },
  }).sort({ datePublished: -1 });

  if (!byte) {
    // If no byte for today, get the most recent one
    const latestByte = await Byte.findOne().sort({ datePublished: -1 });
    
    if (!latestByte) {
      res.status(404);
      throw new Error('No bytes found');
    }
    
    return res.status(200).json({
      success: true,
      data: latestByte,
      message: 'No byte for today, showing the most recent one',
    });
  }

  res.status(200).json({
    success: true,
    data: byte,
  });
});

// @desc    Get all bytes by category
// @route   GET /api/byte/category/:categoryName
// @access  Public
const getBytesByCategory = asyncHandler(async (req, res) => {
  const bytes = await Byte.find({ category: req.params.categoryName }).sort({
    datePublished: -1,
  });

  if (bytes.length === 0) {
    res.status(404);
    throw new Error(`No bytes found in category: ${req.params.categoryName}`);
  }

  res.status(200).json({
    success: true,
    count: bytes.length,
    data: bytes,
  });
});

// @desc    Get all bytes
// @route   GET /api/byte
// @access  Public
const getAllBytes = asyncHandler(async (req, res) => {
  const bytes = await Byte.find().sort({ datePublished: -1 });

  res.status(200).json({
    success: true,
    count: bytes.length,
    data: bytes,
  });
});

// @desc    Get list of all categories
// @route   GET /api/byte/category
// @access  Public
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Byte.distinct('category');

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

module.exports = {
  createByte,
  getTodayByte,
  getBytesByCategory,
  getAllBytes,
  getAllCategories,
};
