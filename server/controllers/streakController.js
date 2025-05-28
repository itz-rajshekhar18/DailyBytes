const Streak = require('../models/Streak');
const asyncHandler = require('express-async-handler');
const { BADGE_TYPES } = require('../utils/constants');

// Helper to check and award badges based on streak
const checkAndAwardBadges = async (streak) => {
  const currentStreak = streak.currentStreak;
  const existingBadges = new Set(streak.badges.map(b => b.type));
  const newBadges = [];

  // Check for each badge type
  if (currentStreak >= 30 && !existingBadges.has(BADGE_TYPES.MONTH_STREAK)) {
    newBadges.push({ type: BADGE_TYPES.MONTH_STREAK });
  }
  if (currentStreak >= 15 && !existingBadges.has(BADGE_TYPES.BIWEEK_STREAK)) {
    newBadges.push({ type: BADGE_TYPES.BIWEEK_STREAK });
  }
  if (currentStreak >= 7 && !existingBadges.has(BADGE_TYPES.WEEK_STREAK)) {
    newBadges.push({ type: BADGE_TYPES.WEEK_STREAK });
  }

  if (newBadges.length > 0) {
    streak.badges.push(...newBadges);
    await streak.save();
  }

  return newBadges;
};

// Update user's streak
exports.updateStreak = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  let streak = await Streak.findOne({ user: userId });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!streak) {
    streak = await Streak.create({
      user: userId,
      currentStreak: 1, // Start with 1 since user just answered
      maxStreak: 1,
      lastSolvedDate: today,
      badges: []
    });
  } else {
    const lastSolved = new Date(streak.lastSolvedDate);
    lastSolved.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today - lastSolved) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Already solved today
      res.status(400);
      throw new Error('Already completed today\'s byte');
    } else if (diffDays === 1) {
      // Consecutive day
      streak.currentStreak += 1;
      if (streak.currentStreak > streak.maxStreak) {
        streak.maxStreak = streak.currentStreak;
      }
    } else {
      // Streak broken
      streak.currentStreak = 1;
    }
    
    streak.lastSolvedDate = today;
    await streak.save();
  }

  // Check and award any new badges
  const newBadges = await checkAndAwardBadges(streak);

  res.status(200).json({
    success: true,
    data: {
      currentStreak: streak.currentStreak,
      maxStreak: streak.maxStreak,
      lastSolvedDate: streak.lastSolvedDate,
      badges: streak.badges,
      newBadges
    }
  });
});

// Get user's streak info
exports.getStreakInfo = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  let streak = await Streak.findOne({ user: userId });
  
  if (!streak) {
    res.json({
      success: true,
      data: {
        currentStreak: 0,
        maxStreak: 0,
        badges: []
      }
    });
    return;
  }

  // Check if streak is broken due to missing yesterday's byte
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastSolved = new Date(streak.lastSolvedDate);
  lastSolved.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today - lastSolved) / (1000 * 60 * 60 * 24));

  if (diffDays > 1) {
    streak.currentStreak = 0;
    await streak.save();
  }

  res.json({
    success: true,
    data: {
      currentStreak: streak.currentStreak,
      maxStreak: streak.maxStreak,
      lastSolvedDate: streak.lastSolvedDate,
      badges: streak.badges
    }
  });
});
