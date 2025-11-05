const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../../db/connection');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// User login with email and password
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Login start
    
    // Input validation
    if (!email || !password) {
      // Missing email or password
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Get user from database
    // Querying database for user
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND is_active = true',
      [email]
    );
    // Users found

    const user = users[0];

    // Check if user exists
    if (!user) {
      // User not found
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // User found

    // Check password
    // Checking password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      // Invalid password
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Password valid, updating last login

    // Update last login
    await pool.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generating JWT token

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: 'user' 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Token generated, checking profile status

    // Check if user has completed onboarding profile
    const [profiles] = await pool.execute(
      'SELECT onboarding_completed FROM user_profiles WHERE user_id = ? LIMIT 1',
      [user.id]
    );
    const profileCompleted = profiles[0]?.onboarding_completed === 1;

    // Check if user has selected any companions
    const [companionSelections] = await pool.execute(
      'SELECT COUNT(*) as count FROM user_companion_selections WHERE user_id = ?',
      [user.id]
    );
    const hasSelectedCompanion = companionSelections[0].count > 0;

    // Profile completed

    // Return user info and token
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: 'user',
        lastLogin: user.last_login,
        profile_completed: !!user.profile_completed || profileCompleted,
        onboarding_completed: profileCompleted,
        has_selected_companion: hasSelectedCompanion
      },
      token
    });
    
    // Login success
  } catch (error) {
    // Login error
    res.status(500).json({ message: 'Internal server error' });
  }
};

// User registration with email and password
const register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // Input validation
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    // Check if email already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const userId = uuidv4();
    await pool.execute(
      'INSERT INTO users (id, email, password_hash, name, role, is_active, profile_completed) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, name, 'user', true, false]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: userId, 
        email: email, 
        role: 'user' 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({ 
      user: {
        id: userId,
        email,
        name,
        role: 'user',
        profile_completed: false
      },
      token
    });
  } catch (error) {
    // Registration error
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Google OAuth login
const googleLogin = async (req, res) => {
  const { accessToken, email, name, photo } = req.body;

  // Google login request received

  try {
    // Verify the Google access token by fetching user info
    const userInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );
    
    // Google API response status
    
    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      // Google API error
      return res.status(400).json({ 
        message: 'Invalid Google access token',
        details: errorText 
      });
    }
    
    const userInfo = await userInfoResponse.json();
    // Google user info received
    
    const googleEmail = userInfo.email;

    // Verify that the email matches
    if (googleEmail !== email) {
      return res.status(400).json({ message: 'Email mismatch' });
    }

    // Check if user exists
    let [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    let user = users[0];

    if (!user) {
      // Create new user
      const userId = uuidv4();
      await pool.execute(
        'INSERT INTO users (id, email, name, profile_image_url, auth_provider, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, email, name, photo, 'google', true]
      );

      user = {
        id: userId,
        email,
        name,
        profile_image_url: photo,
        auth_provider: 'google'
      };
    } else {
      // Update existing user's Google info
      await pool.execute(
        'UPDATE users SET name = ?, profile_image_url = ?, auth_provider = ?, last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [name, photo, 'google', user.id]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: 'user' 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_image_url: user.profile_image_url,
        role: 'user',
        auth_provider: user.auth_provider
      },
      token
    });
  } catch (error) {
    // Google login error
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get current user info
const getCurrentUser = async (req, res) => {
  try {
    // Get current user
    
    const [users] = await pool.execute(
      'SELECT id, email, name, profile_image_url, role, last_login, created_at, auth_provider, profile_completed FROM users WHERE id = ?',
      [req.user.id]
    );

    const user = users[0];
    // User found
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // fetch profile summary for onboarding gate
    const [profiles] = await pool.execute(
      'SELECT onboarding_completed FROM user_profiles WHERE user_id = ? LIMIT 1',
      [req.user.id]
    );
    // Profile found

    const onboardingCompleted = profiles[0]?.onboarding_completed === 1;
    // Onboarding completed
    
    // Check if user has selected any companions
    const [companionSelections] = await pool.execute(
      'SELECT COUNT(*) as count FROM user_companion_selections WHERE user_id = ?',
      [user.id]
    );
    const hasSelectedCompanion = companionSelections[0].count > 0;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_image_url: user.profile_image_url,
        role: user.role,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        auth_provider: user.auth_provider,
        profile_completed: !!user.profile_completed || onboardingCompleted,
        onboarding_completed: onboardingCompleted,
        has_selected_companion: hasSelectedCompanion
      }
    }); 
    // Response sent successfully
  } catch (error) {
    // Get current user error
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark profile as completed and save interests
const completeProfile = async (req, res) => {
  try {
    const { interests } = req.body;
    await pool.execute(
      'UPDATE users SET profile_completed = ?, interests = ? WHERE id = ?',
      [true, interests ? JSON.stringify(interests) : null, req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    // Complete profile error
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Change password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    // Input validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Get user from database
    const [users] = await pool.execute(
      'SELECT password_hash FROM users WHERE id = ? AND is_active = true',
      [userId]
    );

    const user = users[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has a password (might be using Google/Apple auth)
    if (!user.password_hash) {
      return res.status(400).json({ message: 'Password change not available for OAuth users' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  login,
  register,
  googleLogin,
  getCurrentUser,
  completeProfile,
  changePassword
};
