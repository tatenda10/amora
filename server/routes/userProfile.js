const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db/connection');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = 'uploads/users';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage for user profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with user ID and timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

// Helper function to delete old profile image
const deleteOldProfileImage = async (userId) => {
  try {
    const [users] = await pool.execute(
      'SELECT profile_image_url FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length > 0 && users[0].profile_image_url) {
      const oldImagePath = path.join(__dirname, '..', users[0].profile_image_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
  } catch (error) {
    console.error('Error deleting old profile image:', error);
  }
};

// Upload profile picture
router.post('/upload-profile-picture', upload.single('profile_image'), authenticateToken, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const userId = req.user.id;
    const profileImageUrl = `/${req.file.path.replace(/\\/g, '/')}`;

    // Delete old profile image
    await deleteOldProfileImage(userId);

    // Update user profile image URL in database
    await pool.execute(
      'UPDATE users SET profile_image_url = ? WHERE id = ?',
      [profileImageUrl, userId]
    );

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      profile_image_url: profileImageUrl
    });

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ 
      message: 'Error uploading profile picture',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user profile information
router.put('/update-profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // Check if email is being changed and if it's already taken
    if (email) {
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Update user profile
    await pool.execute(
      'UPDATE users SET name = ?, email = COALESCE(?, email) WHERE id = ?',
      [name.trim(), email || null, userId]
    );

    // Get updated user data
    const [users] = await pool.execute(
      'SELECT id, email, name, profile_image_url, role, last_login, created_at, auth_provider, profile_completed FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_image_url: user.profile_image_url,
        role: user.role,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        auth_provider: user.auth_provider,
        profile_completed: !!user.profile_completed
      }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.execute(
      'SELECT id, email, name, profile_image_url, role, last_login, created_at, auth_provider, profile_completed FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_image_url: user.profile_image_url,
        role: user.role,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        auth_provider: user.auth_provider,
        profile_completed: !!user.profile_completed
      }
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      message: 'Error fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
