const jwt = require('jsonwebtoken');
const pool = require('../db/connection');

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists and is active
    const [users] = await pool.execute(
      'SELECT id, email, name, role FROM users WHERE id = ? AND is_active = true',
      [decoded.id]
    );

    const user = users[0];
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists or is inactive' });
    }

    // Add user info to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    // Authentication error
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Check if user is admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin
}; 