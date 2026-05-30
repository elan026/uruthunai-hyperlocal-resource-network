const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { protect, volunteerOrAbove } = require('../middleware/authMiddleware');

// GET /api/requests — All requests (ordered by priority)
router.get('/', requestController.getAllRequests);

// POST /api/requests — Create a new help request
router.post('/', requestController.createRequest);

// PATCH /api/requests/:id/state — Update request status (Real-Time State Machine)
// Requires authentication. Volunteer-only guard is enforced inside the controller
// for ACCEPTED state, since admins also need access for other transitions.
router.patch('/:id/state', protect, requestController.updateRequestState);

// POST /api/requests/:id/report — Report request & Auto-Hide Policy
router.post('/:id/report', requestController.reportRequest);

module.exports = router;
