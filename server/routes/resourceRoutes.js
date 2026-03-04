const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

// GET /api/resources — All resources
router.get('/', resourceController.getAllResources);

// GET /api/resources/:id — Single resource by ID
router.get('/:id', resourceController.getResourceById);

// POST /api/resources — Create a new resource
router.post('/', resourceController.createResource);

// PATCH /api/resources/:id/status — Update resource status
router.patch('/:id/status', resourceController.updateResourceStatus);

module.exports = router;
