const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const reportLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // Limit each IP to 3 reports per window
    message: { error: 'Too many reports from this IP, please try again after 5 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// GET /api/resources — All resources
router.get('/', resourceController.getAllResources);

// GET /api/resources/:id — Single resource by ID
router.get('/:id', resourceController.getResourceById);

// POST /api/resources — Create a new resource
router.post('/', resourceController.createResource);

// PATCH /api/resources/:id/status — Update resource status
router.patch('/:id/status', protect, resourceController.updateResourceStatus);

// POST /api/resources/:id/report — Report misleading info
router.post('/:id/report', protect, reportLimiter, resourceController.reportResource);

module.exports = router;
