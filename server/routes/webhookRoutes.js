const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// POST /api/webhooks/sms - Twilio SMS Webhook
router.post('/sms', webhookController.handleSms);

module.exports = router;
