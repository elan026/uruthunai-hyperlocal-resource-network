const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login — Login or Register
router.post('/login', authController.login);

// GET /api/auth/profile/:id — Get user profile with stats
router.get('/profile/:id', authController.getProfile);

module.exports = router;
