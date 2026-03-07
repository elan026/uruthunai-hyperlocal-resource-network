const Listing = require('../models/listingModel');

const getNearbyListings = async (req, res, next) => {
    try {
        const { lat, lng, radius } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
        }

        const radiusKm = parseFloat(radius) || 5;
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);

        let listings = await Listing.findNearby(latitude, longitude, radiusKm);

        // Privacy Protection Layer
        listings = listings.map(listing => {
            return {
                ...listing,
                location_lat: parseFloat((parseFloat(listing.location_lat) + (Math.random() - 0.5) * 0.001).toFixed(4)),
                location_lng: parseFloat((parseFloat(listing.location_lng) + (Math.random() - 0.5) * 0.001).toFixed(4)),
                actual_distance_km: listing.distance,
                distance: listing.distance < 1 ? `${Math.round(listing.distance * 1000)}m` : `${listing.distance.toFixed(1)}km`
            };
        });

        res.status(200).json({ success: true, data: listings });
    } catch (error) {
        next(error);
    }
};

module.exports = { getNearbyListings };
