const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const pool = require('../db/connection');

// Register push token for user
router.post('/register-token', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { token, platform, device_id } = req.body;

    console.log('📱 Registering push token for user:', userId);

    // Check if token already exists
    const [existingTokens] = await pool.execute(
      'SELECT id FROM user_push_tokens WHERE user_id = ? AND token = ?',
      [userId, token]
    );

    if (existingTokens.length > 0) {
      // Update existing token
      await pool.execute(
        'UPDATE user_push_tokens SET platform = ?, device_id = ?, updated_at = NOW() WHERE user_id = ? AND token = ?',
        [platform, device_id, userId, token]
      );
      console.log('✅ Updated existing push token');
    } else {
      // Insert new token
      await pool.execute(
        'INSERT INTO user_push_tokens (user_id, token, platform, device_id, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [userId, token, platform, device_id]
      );
      console.log('✅ Registered new push token');
    }

    res.json({
      success: true,
      message: 'Push token registered successfully'
    });

  } catch (error) {
    console.error('❌ Error registering push token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register push token'
    });
  }
});

// Send notification to user
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { user_id, title, body, data, type = 'message' } = req.body;

    console.log('📤 Sending notification to user:', user_id);

    // Get user's push tokens
    const [tokens] = await pool.execute(
      'SELECT token, platform FROM user_push_tokens WHERE user_id = ?',
      [user_id]
    );

    if (tokens.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No push tokens found for user'
      });
    }

    // Send notification to each token
    const results = [];
    for (const tokenData of tokens) {
      try {
        const result = await sendPushNotification({
          to: tokenData.token,
          title,
          body,
          data: {
            ...data,
            type,
            timestamp: new Date().toISOString()
          }
        });
        results.push({ token: tokenData.token, success: true, result });
      } catch (error) {
        console.error('❌ Error sending to token:', tokenData.token, error);
        results.push({ token: tokenData.token, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Notifications sent',
      results
    });

  } catch (error) {
    console.error('❌ Error sending notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send notification'
    });
  }
});

// Send message notification
router.post('/send-message', authenticateToken, async (req, res) => {
  try {
    const { recipient_id, sender_name, message_content, companion_id, conversation_id } = req.body;

    console.log('💬 Sending message notification to user:', recipient_id);

    // Get recipient's push tokens
    const [tokens] = await pool.execute(
      'SELECT token, platform FROM user_push_tokens WHERE user_id = ?',
      [recipient_id]
    );

    if (tokens.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No push tokens found for recipient'
      });
    }

    // Send WhatsApp-style notification
    const notificationData = {
      type: 'message',
      companion_id,
      conversation_id,
      sender_name,
      message_content: message_content.substring(0, 100) // Truncate for notification
    };

    const results = [];
    for (const tokenData of tokens) {
      try {
        const result = await sendPushNotification({
          to: tokenData.token,
          title: sender_name,
          body: message_content,
          data: notificationData,
          sound: 'default',
          badge: 1
        });
        results.push({ token: tokenData.token, success: true, result });
      } catch (error) {
        console.error('❌ Error sending message notification:', error);
        results.push({ token: tokenData.token, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Message notifications sent',
      results
    });

  } catch (error) {
    console.error('❌ Error sending message notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message notification'
    });
  }
});

// Send companion match notification
router.post('/send-match', authenticateToken, async (req, res) => {
  try {
    const { user_id, companion_name, companion_id } = req.body;

    console.log('🎯 Sending match notification to user:', user_id);

    // Get user's push tokens
    const [tokens] = await pool.execute(
      'SELECT token, platform FROM user_push_tokens WHERE user_id = ?',
      [user_id]
    );

    if (tokens.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No push tokens found for user'
      });
    }

    const notificationData = {
      type: 'companion_match',
      companion_id,
      companion_name
    };

    const results = [];
    for (const tokenData of tokens) {
      try {
        const result = await sendPushNotification({
          to: tokenData.token,
          title: 'New Match! 🎉',
          body: `You have a new match with ${companion_name}`,
          data: notificationData,
          sound: 'default',
          badge: 1
        });
        results.push({ token: tokenData.token, success: true, result });
      } catch (error) {
        console.error('❌ Error sending match notification:', error);
        results.push({ token: tokenData.token, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Match notifications sent',
      results
    });

  } catch (error) {
    console.error('❌ Error sending match notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send match notification'
    });
  }
});

// Helper function to send push notification via FCM
async function sendPushNotification(message) {
  try {
    // For production, you would use Firebase Admin SDK
    // For now, we'll use Expo Push Service as fallback
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Push notification failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    throw error;
  }
}

// Get user's notification settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [settings] = await pool.execute(
      'SELECT * FROM user_notification_settings WHERE user_id = ?',
      [userId]
    );

    if (settings.length === 0) {
      // Return default settings
      res.json({
        success: true,
        settings: {
          messages: true,
          matches: true,
          system: true,
          marketing: false
        }
      });
    } else {
      res.json({
        success: true,
        settings: settings[0]
      });
    }

  } catch (error) {
    console.error('❌ Error getting notification settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notification settings'
    });
  }
});

// Update user's notification settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { messages, matches, system, marketing } = req.body;

    await pool.execute(
      `INSERT INTO user_notification_settings (user_id, messages, matches, system, marketing, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW()) 
       ON DUPLICATE KEY UPDATE 
       messages = VALUES(messages), 
       matches = VALUES(matches), 
       system = VALUES(system), 
       marketing = VALUES(marketing), 
       updated_at = NOW()`,
      [userId, messages, matches, system, marketing]
    );

    res.json({
      success: true,
      message: 'Notification settings updated'
    });

  } catch (error) {
    console.error('❌ Error updating notification settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notification settings'
    });
  }
});

module.exports = router;