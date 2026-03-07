const db = require('../config/db');

const Listing = {
    findNearby: async (lat, lng, radiusKm) => {
        const query = `
            SELECT * FROM (
                SELECT 
                    r.id, 
                    'offer' AS type, 
                    r.category, 
                    r.title AS title_or_description,
                    r.is_emergency,
                    NULL AS urgency_level,
                    r.location_lat, 
                    r.location_lng,
                    r.status,
                    r.created_at,
                    u.name AS user_name,
                    (6371 * acos(
                        cos(radians(?)) * cos(radians(r.location_lat)) * 
                        cos(radians(r.location_lng) - radians(?)) + 
                        sin(radians(?)) * sin(radians(r.location_lat))
                    )) AS distance
                FROM resources r
                JOIN users u ON r.user_id = u.id
                WHERE r.location_lat IS NOT NULL AND r.location_lng IS NOT NULL
                
                UNION ALL
                
                SELECT 
                    req.id, 
                    'request' AS type, 
                    req.category, 
                    req.description AS title_or_description,
                    0 AS is_emergency,
                    req.urgency_level,
                    req.location_lat, 
                    req.location_lng,
                    req.status,
                    req.created_at,
                    u.name AS user_name,
                    (6371 * acos(
                        cos(radians(?)) * cos(radians(req.location_lat)) * 
                        cos(radians(req.location_lng) - radians(?)) + 
                        sin(radians(?)) * sin(radians(req.location_lat))
                    )) AS distance
                FROM requests req
                JOIN users u ON req.user_id = u.id
                WHERE req.location_lat IS NOT NULL AND req.location_lng IS NOT NULL
            ) AS combined_listings
            WHERE distance <= ?
            ORDER BY distance ASC
        `;

        const params = [lat, lng, lat, lat, lng, lat, radiusKm];
        const [rows] = await db.execute(query, params);
        return rows;
    }
};

module.exports = Listing;
