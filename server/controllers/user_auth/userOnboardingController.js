const pool = require('../../db/connection');

// Get current user's onboarding profile
const getProfile = async (req, res) => {
  try {
    // Get user profile
    
    const [rows] = await pool.execute(
      'SELECT country, sex, age, interests, looking_for, preferences, onboarding_completed FROM user_profiles WHERE user_id = ? LIMIT 1',
      [req.user.id]
    );
    // Profile rows found
    
    const profile = rows[0] || null;
    if (profile) {
      // Returning existing profile
      res.json({
        profile: {
          ...profile,
          interests: profile.interests ? JSON.parse(profile.interests) : null,
          looking_for: profile.looking_for ? JSON.parse(profile.looking_for) : null,
          preferences: profile.preferences ? JSON.parse(profile.preferences) : null,
        }
      });
    } else {
      // No profile found
      res.json({ profile: null });
    }
  } catch (err) {
    // Get profile error
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Upsert onboarding profile and optionally mark completed
const upsertProfile = async (req, res) => {
  try {
    // Put user profile
    
    const { country, sex, age, interests, looking_for, preferences, onboarding_completed } = req.body;

    const [existing] = await pool.execute(
      'SELECT id FROM user_profiles WHERE user_id = ? LIMIT 1',
      [req.user.id]
    );
    // Existing profile found

    if (existing.length) {
      // Updating existing profile
      await pool.execute(
        'UPDATE user_profiles SET country = ?, sex = ?, age = ?, interests = ?, looking_for = ?, preferences = ?, onboarding_completed = ? WHERE user_id = ?',
        [
          country || null,
          sex || null,
          age || null,
          interests ? JSON.stringify(interests) : null,
          looking_for ? JSON.stringify(looking_for) : null,
          preferences ? JSON.stringify(preferences) : null,
          onboarding_completed ? 1 : 0,
          req.user.id,
        ]
      );
    } else {
      // Creating new profile
      await pool.execute(
        'INSERT INTO user_profiles (user_id, country, sex, age, interests, looking_for, preferences, onboarding_completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          req.user.id,
          country || null,
          sex || null,
          age || null,
          interests ? JSON.stringify(interests) : null,
          looking_for ? JSON.stringify(looking_for) : null,
          preferences ? JSON.stringify(preferences) : null,
          onboarding_completed ? 1 : 0,
        ]
      );
    }

    // Also mirror quick flag on users table
    if (onboarding_completed) {
      // Updating users.profile_completed flag
      await pool.execute('UPDATE users SET profile_completed = ? WHERE id = ?', [true, req.user.id]);
    }

    // Profile upsert successful
    res.json({ success: true });
  } catch (err) {
    // Upsert profile error
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getProfile, upsertProfile };


