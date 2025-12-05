const pool = require('../db/connection');

/**
 * Get user subscription details
 */
async function getUserSubscription(userId) {
  try {
    const [users] = await pool.execute(
      `SELECT 
        subscription_tier, 
        subscription_status, 
        subscription_end_date,
        role
      FROM users 
      WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return { tier: 'free', status: null, isActive: false };
    }

    const user = users[0];
    const tier = user.subscription_tier || 'free';
    const status = user.subscription_status;
    const endDate = user.subscription_end_date;
    
    // Check if subscription is active
    const isActive = (tier === 'premium' || tier === 'basic') && 
                     (status === 'active' || status === null) &&
                     (!endDate || new Date(endDate) > new Date());

    // Legacy role check (for backward compatibility)
    const hasPremiumRole = user.role === 'premium';

    return {
      tier: hasPremiumRole ? 'premium' : tier,
      status,
      endDate,
      isActive: isActive || hasPremiumRole
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return { tier: 'free', status: null, isActive: false };
  }
}

/**
 * Check daily message count for user
 */
async function getDailyMessageCount(userId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [result] = await pool.execute(
      `SELECT COUNT(*) as count 
       FROM messages m
       INNER JOIN conversations c ON m.conversation_id = c.id
       WHERE c.user_id = ? 
         AND m.sender_type = 'user'
         AND m.created_at >= ? 
         AND m.created_at < ?`,
      [userId, today, tomorrow]
    );

    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error getting daily message count:', error);
    return 0;
  }
}

/**
 * Check companion count for user
 */
async function getCompanionCount(userId) {
  try {
    const [result] = await pool.execute(
      `SELECT COUNT(*) as count 
       FROM user_companion_selections 
       WHERE user_id = ?`,
      [userId]
    );

    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error getting companion count:', error);
    return 0;
  }
}

/**
 * Middleware to check message limits before sending
 */
const checkMessageLimit = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const subscription = await getUserSubscription(userId);
    
    // Premium users have unlimited messages
    if (subscription.tier === 'premium' && subscription.isActive) {
      req.subscription = subscription;
      return next();
    }

    // Basic users have 100 messages per day
    if (subscription.tier === 'basic' && subscription.isActive) {
      const messageCount = await getDailyMessageCount(userId);
      if (messageCount >= 100) {
        return res.status(403).json({
          message: 'Daily message limit reached',
          limit: 100,
          current: messageCount,
          tier: 'basic',
          upgradeRequired: true
        });
      }
      req.subscription = subscription;
      req.messageCount = messageCount;
      return next();
    }

    // Free users have 10 messages per day
    const messageCount = await getDailyMessageCount(userId);
    if (messageCount >= 10) {
      return res.status(403).json({
        message: 'Daily message limit reached. Upgrade to Basic (100/day) or Premium (unlimited)',
        limit: 10,
        current: messageCount,
        tier: 'free',
        upgradeRequired: true
      });
    }

    req.subscription = subscription;
    req.messageCount = messageCount;
    next();
  } catch (error) {
    console.error('Error in checkMessageLimit middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware to check companion limit
 */
const checkCompanionLimit = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const subscription = await getUserSubscription(userId);
    
    // Premium users have unlimited companions
    if (subscription.tier === 'premium' && subscription.isActive) {
      req.subscription = subscription;
      return next();
    }

    // Basic users can have up to 3 companions
    if (subscription.tier === 'basic' && subscription.isActive) {
      const companionCount = await getCompanionCount(userId);
      if (companionCount >= 3) {
        return res.status(403).json({
          message: 'Companion limit reached. Basic plan allows up to 3 companions. Upgrade to Premium for unlimited companions.',
          limit: 3,
          current: companionCount,
          tier: 'basic',
          upgradeRequired: true
        });
      }
      req.subscription = subscription;
      req.companionCount = companionCount;
      return next();
    }

    // Free users can have 1 companion
    const companionCount = await getCompanionCount(userId);
    if (companionCount >= 1) {
      return res.status(403).json({
        message: 'Companion limit reached. Free plan allows 1 companion. Upgrade to Basic (3 companions) or Premium (unlimited)',
        limit: 1,
        current: companionCount,
        tier: 'free',
        upgradeRequired: true
      });
    }

    req.subscription = subscription;
    req.companionCount = companionCount;
    next();
  } catch (error) {
    console.error('Error in checkCompanionLimit middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware to require subscription (basic or premium)
 */
const requireSubscription = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const subscription = await getUserSubscription(userId);
    
    if (!subscription.isActive || (subscription.tier !== 'basic' && subscription.tier !== 'premium')) {
      return res.status(403).json({
        message: 'Subscription required',
        tier: subscription.tier,
        upgradeRequired: true
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Error in requireSubscription middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getUserSubscription,
  getDailyMessageCount,
  getCompanionCount,
  checkMessageLimit,
  checkCompanionLimit,
  requireSubscription
};

