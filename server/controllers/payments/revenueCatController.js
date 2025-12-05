const pool = require('../../db/connection');

// Handle RevenueCat Webhook
const handleWebhook = async (req, res) => {
  try {
    // Log the full webhook payload for debugging
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📦 REVENUECAT WEBHOOK RECEIVED');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Full Request Body:', JSON.stringify(req.body, null, 2));
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('═══════════════════════════════════════════════════════\n');

    const { event } = req.body;
    const authHeader = req.headers.authorization;

    // Verify Authorization Header (Simple check, ideally match with env var)
    if (!authHeader) {
      console.error('❌ No authorization header provided');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // You should ideally check against a REVENUECAT_WEBHOOK_SECRET env var
    // if (authHeader !== process.env.REVENUECAT_WEBHOOK_SECRET) { ... }

    if (!event) {
      console.error('❌ No event in request body');
      return res.status(400).json({ message: 'Invalid event data' });
    }

    // Extract all available fields from RevenueCat event
    const {
      type,                    // Event type: INITIAL_PURCHASE, RENEWAL, CANCELLATION, etc.
      app_user_id,             // User ID (should be our internal UUID)
      expiration_at_ms,         // Subscription expiration timestamp
      product_id,               // Product identifier (e.g., "amora_basic:basic")
      entitlements,             // Active entitlements object
      period_type,              // Subscription period: NORMAL, TRIAL, INTRO
      purchased_at_ms,          // Purchase timestamp
      price,                    // Product price
      currency,                 // Currency code
      store,                    // Store: APP_STORE, PLAY_STORE, STRIPE, etc.
      transaction_id,           // Transaction identifier
      original_transaction_id,  // Original transaction ID
      is_family_share,          // Family sharing enabled
      takehome_percentage,      // Revenue share percentage
      revenue,                  // Revenue amount
      price_in_purchased_currency, // Price in original currency
      subscriber_attributes,     // Custom user attributes
      presented_offering_id,     // Offering ID if applicable
      environment,              // Environment: SANDBOX, PRODUCTION
      aliases,                  // User aliases
      original_app_user_id,     // Original user ID before alias
    } = event;
    
    console.log(`\n📊 Event Type: ${type}`);
    console.log(`👤 User ID: ${app_user_id}`);
    console.log(`   ⚠️  If this is an anonymous ID (starts with $RCAnonymousID), the user was not logged in!`);
    console.log(`📦 Product ID: ${product_id}`);
    console.log(`💰 Price: ${price} ${currency}`);
    console.log(`🏪 Store: ${store}`);
    console.log(`🆔 Transaction ID: ${transaction_id}`);
    console.log(`📅 Purchased At: ${purchased_at_ms ? new Date(purchased_at_ms).toISOString() : 'N/A'}`);
    console.log(`⏰ Expires At: ${expiration_at_ms ? new Date(expiration_at_ms).toISOString() : 'N/A'}`);
    console.log(`🎫 Entitlements:`, JSON.stringify(entitlements, null, 2));
    console.log(`🌍 Environment: ${environment || 'N/A'}`);
    
    // Check if user ID is anonymous
    if (app_user_id && app_user_id.startsWith('$RCAnonymousID:')) {
      console.error(`\n❌ WARNING: User ID is anonymous! This means the user was not logged in to RevenueCat.`);
      console.error(`   The purchase will be associated with an anonymous ID, not our internal UUID.`);
      console.error(`   Make sure to call Purchases.logIn(userId) when user logs in.\n`);
    } else {
      console.log(`✅ User ID looks valid (not anonymous)\n`);
    }

    // Map RevenueCat events to our subscription status
    let subscriptionStatus = 'active';
    let subscriptionTier = 'free';
    let subscriptionEndDate = null;

    // First, try to determine tier from entitlements (more reliable)
    if (entitlements && entitlements.active) {
      const activeEntitlements = Object.keys(entitlements.active);
      console.log('Active entitlements:', activeEntitlements);
      
      if (activeEntitlements.includes('premium') || activeEntitlements.includes('pro_access')) {
        subscriptionTier = 'premium';
      } else if (activeEntitlements.includes('basic')) {
        subscriptionTier = 'basic';
      }
    }

    // Fallback to product_id if entitlements don't give us a tier
    if (subscriptionTier === 'free' && product_id) {
      if (product_id.includes('premium')) {
        subscriptionTier = 'premium';
      } else if (product_id.includes('basic')) {
        subscriptionTier = 'basic';
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

    // Check if app_user_id is anonymous
    if (app_user_id && app_user_id.startsWith('$RCAnonymousID:')) {
      console.error(`\n❌ CRITICAL: Cannot update user - app_user_id is anonymous: ${app_user_id}`);
      console.error(`   This purchase cannot be linked to a user in our database.`);
      console.error(`   The user needs to log in to the app so RevenueCat can identify them.`);
      console.error(`   Consider checking aliases or original_app_user_id for a valid UUID.\n`);
      
      // Try to find user by aliases if available
      if (aliases && aliases.length > 0) {
        console.log(`   Checking aliases: ${JSON.stringify(aliases)}`);
        for (const alias of aliases) {
          if (alias && !alias.startsWith('$RCAnonymousID:')) {
            console.log(`   Trying alias as user ID: ${alias}`);
            const [aliasResult] = await pool.execute(
              `UPDATE users 
               SET subscription_tier = ?, 
                   subscription_status = ?, 
                   subscription_end_date = ? 
               WHERE id = ?`,
              [subscriptionTier, subscriptionStatus, subscriptionEndDate, alias]
            );
            if (aliasResult.affectedRows > 0) {
              console.log(`   ✅ Updated user using alias: ${alias}`);
              return res.status(200).json({ message: 'Webhook processed successfully (using alias)' });
            }
          }
        }
      }
      
      // Return error but don't fail webhook (RevenueCat will retry)
      return res.status(200).json({ 
        message: 'Webhook received but user ID is anonymous - cannot update database',
        warning: 'User needs to log in to link purchase to account'
      });
    }

    // Update User in DB using app_user_id (should be our internal UUID)
    const [updateResult] = await pool.execute(
      `UPDATE users 
       SET subscription_tier = ?, 
           subscription_status = ?, 
           subscription_end_date = ? 
       WHERE id = ?`,
      [subscriptionTier, subscriptionStatus, subscriptionEndDate, app_user_id]
    );

    if (updateResult.affectedRows === 0) {
      console.error(`\n❌ WARNING: No user found with ID: ${app_user_id}`);
      console.error(`   The user ID in the webhook doesn't match any user in our database.`);
      console.error(`   This could mean:`);
      console.error(`   1. User ID was never set in RevenueCat (user not logged in)`);
      console.error(`   2. User ID format doesn't match our UUID format`);
      console.error(`   3. User was deleted from database\n`);
    } else {
      console.log(`✅ Updated user ${app_user_id} to tier: ${subscriptionTier}, status: ${subscriptionStatus}`);
    }

    res.status(200).json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Error processing RevenueCat webhook:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  handleWebhook
};
