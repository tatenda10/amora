const pool = require('../../db/connection');

// Handle RevenueCat Webhook
const handleWebhook = async (req, res) => {
  try {
    const { event } = req.body;
    const authHeader = req.headers.authorization;

    // Verify Authorization Header (Simple check, ideally match with env var)
    if (!authHeader) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // You should ideally check against a REVENUECAT_WEBHOOK_SECRET env var
    // if (authHeader !== process.env.REVENUECAT_WEBHOOK_SECRET) { ... }

    if (!event) {
      return res.status(400).json({ message: 'Invalid event data' });
    }

    const { type, app_user_id, expiration_at_ms, product_id } = event;
    
    console.log(`Received RevenueCat event: ${type} for user ${app_user_id}`);

    // Map RevenueCat events to our subscription status
    let subscriptionStatus = 'active';
    let subscriptionTier = 'free';
    let subscriptionEndDate = null;

    // Determine tier based on product_id (You might want to map this dynamically)
    // Example: 'amora_monthly_basic' -> 'basic', 'amora_annual_premium' -> 'premium'
    if (product_id) {
      if (product_id.includes('premium')) {
        subscriptionTier = 'premium';
      } else if (product_id.includes('basic')) {
        subscriptionTier = 'basic';
      } else {
        // Default fallback if naming convention isn't strict
        subscriptionTier = 'premium'; 
      }
    }

    if (expiration_at_ms) {
      subscriptionEndDate = new Date(expiration_at_ms);
    }

    switch (type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'UNCANCELLATION':
        subscriptionStatus = 'active';
        break;
      case 'CANCELLATION':
        // User cancelled but might still have time left
        subscriptionStatus = 'cancelled'; 
        break;
      case 'EXPIRATION':
        subscriptionStatus = 'expired';
        subscriptionTier = 'free'; // Revert to free
        break;
      case 'BILLING_ISSUE':
        subscriptionStatus = 'past_due';
        break;
      default:
        // Ignore other events like TEST, etc.
        return res.status(200).json({ message: 'Event ignored' });
    }

    // Update User in DB
    // Assuming app_user_id is our internal user ID (UUID)
    await pool.execute(
      `UPDATE users 
       SET subscription_tier = ?, 
           subscription_status = ?, 
           subscription_end_date = ? 
       WHERE id = ?`,
      [subscriptionTier, subscriptionStatus, subscriptionEndDate, app_user_id]
    );

    console.log(`Updated user ${app_user_id} to tier: ${subscriptionTier}, status: ${subscriptionStatus}`);

    res.status(200).json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Error processing RevenueCat webhook:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  handleWebhook
};
