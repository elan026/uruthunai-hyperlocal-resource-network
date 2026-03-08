const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdminToken } = require('../middleware/adminAuth');

// Public admin routes (Login)
router.post('/login', adminController.login);

// Protected admin routes
router.use(verifyAdminToken);

router.get('/dashboard', adminController.getDashboard);

// User Management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetail);
router.patch('/users/:id/trust', adminController.updateUserTrust);
router.post('/users/:id/ban', adminController.banUser);
router.post('/users/:id/unban', adminController.unbanUser);

// Activity
router.get('/activity', adminController.getActivity);

// Reports & Moderation
router.get('/reports', adminController.getReports);
router.get('/reports/all', adminController.getAllReports);
router.post('/reports/moderate', adminController.moderateAction);

// Verification
router.get('/verifications', adminController.getVerifications);
router.post('/verifications/process', adminController.verifyUser);

// Emergency
router.get('/emergency', adminController.getEmergencyState);
router.post('/emergency', adminController.activateEmergency);

// System Health
router.get('/health', adminController.getSystemHealth);

module.exports = router;
