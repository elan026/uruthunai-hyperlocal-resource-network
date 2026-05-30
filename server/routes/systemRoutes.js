const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');

// GET /api/system/emergency
router.get('/emergency', systemController.getEmergencyStatus);

// GET /api/system/stats
router.get('/stats', systemController.getGlobalStats);

module.exports = router;
