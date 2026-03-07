const express = require('express');
const router = express.Router();
const { getNearbyListings } = require('../controllers/listingController');

router.get('/nearby', getNearbyListings);

module.exports = router;
