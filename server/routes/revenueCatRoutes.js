const express = require('express');
const router = express.Router();
const revenueCatController = require('../controllers/payments/revenueCatController');
const subscriptionController = require('../controllers/payments/subscriptionController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Webhook endpoint (no auth required - uses header auth)
router.post('/webhooks/revenuecat', revenueCatController.handleWebhook);

// Subscription endpoints (require auth)
router.get('/subscription/status', authenticateToken, subscriptionController.getSubscriptionStatus);
router.post('/subscription/sync', authenticateToken, subscriptionController.syncSubscription);

module.exports = router;
