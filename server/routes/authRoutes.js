const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/upload');
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // Limit each IP to 5 requests per `window`
    message: { error: 'Too many OTP requests from this IP, please try again after 10 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /api/auth/send-otp
router.post('/send-otp', otpLimiter, authController.sendOtp);

// POST /api/auth/verify-otp — Verify and Login/Register
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

// PUT /api/auth/profile/:id — Update user profile (name, area, role switching)
router.put('/profile/:id', authController.updateProfile);

// DELETE /api/auth/profile/:id — Delete user profile
router.delete('/profile/:id', authController.deleteProfile);

// POST /api/auth/profile/:id/avatar — Upload profile picture
router.post('/profile/:id/avatar', upload.single('avatar'), authController.uploadAvatar);

module.exports = router;
