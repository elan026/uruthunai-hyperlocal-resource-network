const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdminToken } = require('../middleware/adminAuth');

// Public admin routes (Login)
router.post('/login', adminController.login);

// Protected admin routes
router.use(verifyAdminToken);

router.get('/dashboard', adminController.getDashboard);
router.get('/reports', adminController.getReports);
router.post('/reports/moderate', adminController.moderateAction);

router.get('/verifications', adminController.getVerifications);
router.post('/verifications/process', adminController.verifyUser);

router.get('/emergency', adminController.getEmergencyState);
router.post('/emergency', adminController.activateEmergency);

module.exports = router;
