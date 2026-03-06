const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

const seedMapData = async () => {
    try {
        const pool = mysql.createPool({
            host: DB_HOST || 'localhost',
            user: DB_USER || 'root',
            password: DB_PASS || 'root',
            database: DB_NAME || 'uruthunai',
        });

        console.log(`Seeding mock map data...`);

        // First, ensure a user exists
        await pool.query(`INSERT IGNORE INTO users (id, phone_number, name, role) VALUES (1, '9999999999', 'Admin Seed', 'Admin')`);

        const mockLocations = [
            { cat: 'Medical Help', title: 'Apollo Pharmacy - Emergency Meds', desc: 'First-aid kits and oxygen support available.', lat: 13.0033, lng: 80.2555 },
            { cat: 'Shelter', title: 'Adyar Community Hall', desc: 'Capacity for 50 people. Blankets provided.', lat: 13.0100, lng: 80.2500 },
            { cat: 'Water & Food', title: 'Mylapore Distribution Point', desc: 'Canned food and 5L water cans.', lat: 13.0333, lng: 80.2666 },
            { cat: 'Volunteers', title: 'Coastal Rescue Squad', desc: 'Volunteers available for evacuation.', lat: 13.0222, lng: 80.2777 },
        ];

        for (const loc of mockLocations) {
            await pool.query(
                `INSERT INTO resources (user_id, category, title, description, location_lat, location_lng, status) 
                 VALUES (?, ?, ?, ?, ?, ?, 'Available')`,
                [1, loc.cat, loc.title, loc.desc, loc.lat, loc.lng]
            );
        }

        console.log("Mock data inserted successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding map data:", error);
        process.exit(1);
    }
};

seedMapData();
