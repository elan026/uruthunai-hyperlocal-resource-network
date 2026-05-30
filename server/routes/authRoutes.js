const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/upload');
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute (reduced from 10m for testing)
    max: 1000, // Limit each IP to 1000 requests per `window` to avoid dev annoyance
    message: { error: 'Too many OTP requests from this IP, please try again after 1 minute' },
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /api/auth/google-login
router.post('/google-login', authController.googleLogin);

// POST /api/auth/send-otp (Legacy/Deprecated)
router.post('/send-otp', otpLimiter, authController.sendOtp);

// POST /api/auth/verify-otp (Legacy/Deprecated)
router.post('/verify-otp', otpLimiter, authController.verifyOtp);

// (Legacy support purely just in case some other code was using it, though we refactor everything here)
router.post('/login', authController.verifyOtp);

// POST /api/auth/logout — Clear HttpOnly cookie
router.post('/logout', (req, res) => {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/profile/:id — Get user profile with stats
router.get('/profile/:id', authController.getProfile);

// PUT /api/auth/profile/:id — Update user profile (name, area, skills only — NO role changes)
router.put('/profile/:id', authController.updateProfile);

// POST /api/auth/profile/:id/role-request — Request role upgrade (queued for admin approval)
router.post('/profile/:id/role-request', authController.requestRoleChange);

// DELETE /api/auth/profile/:id — Delete user profile
router.delete('/profile/:id', authController.deleteProfile);

// POST /api/auth/profile/:id/avatar — Upload profile picture
router.post('/profile/:id/avatar', upload.single('avatar'), authController.uploadAvatar);

// GET /api/auth/volunteers — Get all verified volunteers
router.get('/volunteers', authController.getVolunteers);

module.exports = router;
