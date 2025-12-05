const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const { checkCompanionLimit } = require('../../middleware/subscriptionMiddleware');
const {
  getCompanionMatches,
  getUserCompanionSelection,
  selectCompanion
} = require('../../controllers/matching/matchingController');

// Get AI-powered companion matches for the authenticated user
router.get('/matches', authenticateToken, getCompanionMatches);

// Get user's current companion selections
router.get('/selections', authenticateToken, getUserCompanionSelection);

// Select a companion for the user
router.post('/select', authenticateToken, checkCompanionLimit, selectCompanion);

module.exports = router;