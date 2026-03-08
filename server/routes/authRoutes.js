const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/send-otp
router.post('/send-otp', authController.sendOtp);

// POST /api/auth/verify-otp — Verify and Login/Register
router.post('/verify-otp', authController.verifyOtp);

// (Legacy support purely just in case some other code was using it, though we refactor everything here)
router.post('/login', authController.verifyOtp);

// GET /api/auth/profile/:id — Get user profile with stats
router.get('/profile/:id', authController.getProfile);

// PUT /api/auth/profile/:id — Update user profile (name, area, role switching)
router.put('/profile/:id', authController.updateProfile);

module.exports = router;
