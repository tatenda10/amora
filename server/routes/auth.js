const express = require('express');
const router = express.Router();
const { login, register, getCurrentUser } = require('../controllers/admin_auth/authController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.post('/register', authenticateToken, requireAdmin, register); // Only admins can create new users

module.exports = router; 