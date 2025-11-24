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

    let user;

    if (decoded.role === 'user') {
      // Check if user still exists and is active in users table
      const [users] = await pool.execute(
        'SELECT id, email, name, role FROM users WHERE id = ? AND is_active = true',
        [decoded.id]
      );
      user = users[0];
    } else {
      // Check if user still exists and is active in system_users table (for admins/moderators)
      const [systemUsers] = await pool.execute(
        'SELECT id, username, role FROM system_users WHERE id = ? AND is_active = true',
        [decoded.id]
      );
      user = systemUsers[0];
    }

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
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Check if user is admin middleware
const requireAdmin = (req, res, next) => {
  // Allow if role is admin or moderator (from system_users)
  // Note: system_users roles are 'admin', 'moderator', etc.
  // users roles are 'user', 'admin' (maybe?)

  if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin
};