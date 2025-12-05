const pool = require('../../db/connection');
const { getUserSubscription } = require('../../middleware/subscriptionMiddleware');

/**
 * Sync subscription status from RevenueCat
 * This endpoint should be called after a successful purchase
 */
const syncSubscription = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get current subscription from database
    const subscription = await getUserSubscription(userId);

    res.json({
      success: true,
      subscription: {
        tier: subscription.tier,
        status: subscription.status,
        endDate: subscription.endDate,
        isActive: subscription.isActive
      }
    });
  } catch (error) {
    console.error('Error syncing subscription:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get user subscription status and limits
 */
const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { getDailyMessageCount, getCompanionCount } = require('../../middleware/subscriptionMiddleware');
    
    const subscription = await getUserSubscription(userId);
    const messageCount = await getDailyMessageCount(userId);
    const companionCount = await getCompanionCount(userId);

    // Define limits based on tier
    let messageLimit, companionLimit;
    if (subscription.tier === 'premium' && subscription.isActive) {
      messageLimit = null; // Unlimited
      companionLimit = null; // Unlimited
    } else if (subscription.tier === 'basic' && subscription.isActive) {
      messageLimit = 100;
      companionLimit = 3;
    } else {
      messageLimit = 10;
      companionLimit = 1;
    }

    res.json({
      success: true,
      subscription: {
        tier: subscription.tier,
        status: subscription.status,
        endDate: subscription.endDate,
        isActive: subscription.isActive
      },
      limits: {
        messages: {
          current: messageCount,
          limit: messageLimit,
          remaining: messageLimit ? messageLimit - messageCount : null
        },
        companions: {
          current: companionCount,
          limit: companionLimit,
          remaining: companionLimit ? companionLimit - companionCount : null
        }
      }
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  syncSubscription,
  getSubscriptionStatus
};

