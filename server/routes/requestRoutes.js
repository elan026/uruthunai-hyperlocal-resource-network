const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

// GET /api/requests — All requests (ordered by urgency)
router.get('/', requestController.getAllRequests);

// POST /api/requests — Create a new help request
router.post('/', requestController.createRequest);

// PATCH /api/requests/:id/status — Update request status
router.patch('/:id/status', requestController.updateRequestStatus);

module.exports = router;
