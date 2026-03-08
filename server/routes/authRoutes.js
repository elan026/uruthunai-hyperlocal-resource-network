const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/upload');

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

// DELETE /api/auth/profile/:id — Delete user profile
router.delete('/profile/:id', authController.deleteProfile);

// POST /api/auth/profile/:id/avatar — Upload profile picture
router.post('/profile/:id/avatar', upload.single('avatar'), authController.uploadAvatar);

module.exports = router;
