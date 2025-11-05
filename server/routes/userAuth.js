const express = require('express');
const router = express.Router();
const { login, register, googleLogin, getCurrentUser, completeProfile, changePassword } = require('../controllers/user_auth/userAuthController');
const { getProfile, upsertProfile } = require('../controllers/user_auth/userOnboardingController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', login);
router.post('/register', register);
router.post('/google', googleLogin);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.post('/complete-profile', authenticateToken, completeProfile);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, upsertProfile);
router.put('/change-password', authenticateToken, changePassword);

// Get selected companion
router.get('/selected-companion', authenticateToken, async (req, res) => {
  try {
    const pool = require('../db/connection');
    const userId = req.user.id;
    
    // Get the user's selected companion
    const [selections] = await pool.execute(`
      SELECT c.* 
      FROM companions c
      INNER JOIN user_companion_selections ucs ON c.id = ucs.companion_id
      WHERE ucs.user_id = ? AND ucs.is_primary = true
      ORDER BY ucs.created_at DESC
      LIMIT 1
    `, [userId]);
    
    if (selections.length === 0) {
      return res.status(404).json({ message: 'No companion selected' });
    }
    
    res.json({ companion: selections[0] });
  } catch (error) {
    // Error fetching selected companion
    res.status(500).json({ message: 'Error fetching selected companion' });
  }
});

module.exports = router;
