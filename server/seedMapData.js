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

        const locations = [
            { cat: 'Medical Help', title: 'GH Erode - Emergency Meds', desc: 'First-aid kits and oxygen support available.', lat: 11.3450, lng: 77.7200 },
            { cat: 'Shelter', title: 'Perundurai Community Hall', desc: 'Capacity for 50 people. Blankets provided.', lat: 11.2721, lng: 77.5843 },
            { cat: 'Water & Food', title: 'Bhavani Distribution Point', desc: 'Canned food and 5L water cans.', lat: 11.4426, lng: 77.6853 },
            { cat: 'Volunteers', title: 'Cauvery Rescue Squad', desc: 'Volunteers available for evacuation near riverbeds.', lat: 11.3300, lng: 77.7100 },
        ];

        for (const loc of locations) {
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
