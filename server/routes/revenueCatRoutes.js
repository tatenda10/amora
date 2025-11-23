const express = require('express');
const router = express.Router();
const revenueCatController = require('../controllers/payments/revenueCatController');

// Webhook endpoint
router.post('/webhooks/revenuecat', revenueCatController.handleWebhook);

module.exports = router;
