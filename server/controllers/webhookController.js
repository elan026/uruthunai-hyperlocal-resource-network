const User = require('../models/userModel');
const db = require('../config/db');

// In a real scenario, you map pin codes to approximate coordinates. 
// For demo purposes, we will hardcode a few or generic center.
const PINCODE_MAP = {
    '600042': { lat: 12.9782, lng: 80.2222 }, // Velachery
    '600100': { lat: 12.9460, lng: 80.2081 }, // Pallikaranai
    'DEFAULT': { lat: 13.0827, lng: 80.2707 } // Chennai Master
};

// POST /api/webhooks/sms
// Twilio sends Body and From
exports.handleSms = async (req, res, next) => {
    try {
        const { Body, From } = req.body;
        
        if (!Body || !From) {
            return res.status(400).send('Missing Body or From');
        }

        console.log(`[SMS Webhook] Received SMS tightly from ${From}: ${Body}`);

        // Example Format: "HELP FOOD 600042 10PEOPLE" or "NEED BOAT 600100"
        const tokens = Body.trim().toUpperCase().split(' ');
        
        if (tokens.length < 2) {
            return res.status(200).send('<Response><Message>Format: HELP [CATEGORY] [PINCODE] [DESC]</Message></Response>');
        }

        const command = tokens[0]; // HELP or NEED
        const category = tokens[1]; // FOOD, BOAT, RESCUE, MEDICAL
        const pincode = tokens.length > 2 ? tokens[2] : 'DEFAULT';
        const description = tokens.slice(3).join(' ') || 'SMS Offline Ping';

        const coordinates = PINCODE_MAP[pincode] || PINCODE_MAP['DEFAULT'];

        // Find user by phone
        let user = await User.findByPhone(From);
        let userId;

        if (!user) {
            // Auto register the user silently if they don't exist
            const newUser = await User.create({
                phone_number: From,
                name: 'SMS Requestor',
                area_code: pincode,
                role: 'user',
                user_type: 'resident',
                skills: ''
            });
            userId = newUser.id;
        } else {
            userId = user.id;
        }

        // Insert as Request
        const [result] = await db.execute(
            `INSERT INTO requests 
            (user_id, category, description, urgency_level, location_lat, location_lng, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, category, description, command === 'HELP' ? 'Critical' : 'Essential', coordinates.lat, coordinates.lng, 'Open']
        );

        // Notify socket clients (Fire and forget)
        try {
            const io = req.app.get('io');
            if (io) {
                io.emit('new_listing_created', {
                    id: result.insertId,
                    type: 'request',
                    category,
                    title_or_description: description,
                    urgency_level: command === 'HELP' ? 'Critical' : 'Essential',
                    location_lat: coordinates.lat,
                    location_lng: coordinates.lng,
                    user_name: user ? user.name : 'SMS Requestor',
                    status: 'Open',
                    created_at: new Date().toISOString()
                });
            }
        } catch (e) { console.log(e); }

        res.set('Content-Type', 'text/xml');
        res.status(200).send('<Response><Message>Request Received. Stay Safe.</Message></Response>');
    } catch (err) {
        console.error('Webhook Error:', err);
        res.status(500).send('<Response><Message>System Error. Try again.</Message></Response>');
    }
};
