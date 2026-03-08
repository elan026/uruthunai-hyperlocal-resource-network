const mysql = require('mysql2/promise');
require('dotenv').config();



const randNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const firstNames = ['Arun', 'Karthik', 'Priya', 'Lakshmi', 'Suresh', 'Ramesh', 'Aarthi', 'Meena', 'Vijay', 'Ajith', 'Surya', 'Dhanush', 'Nayan', 'Trisha', 'Kamal', 'Rajini', 'Siva', 'Vignesh', 'Deepa', 'Geetha', 'Anbu', 'Maran', 'Raj', 'Ravi', 'Gopi'];
const lastNames = ['Kumar', 'Raj', 'Kannan', 'Swami', 'Murugan', 'Venkatesh', 'Prakash', 'Chandran', 'Natarajan', 'Subramaniam', 'krishnan'];
const areas = [
    '638001 - Erode Fort', '638002 - Manickampalayam', '638003 - Surampatti',
    '638004 - Veerappanchatram', '638008 - Thindal', '638009 - Kasipalayam',
    '638011 - Periyasemur', '638012 - BP Agraharam'
];
const userTypes = ['resident', 'volunteer', 'community_activist', 'skilled_support'];
const resourceCategories = ['Medical', 'Food', 'Transport', 'Shelter', 'Supplies', 'Volunteers'];
const requestCategories = ['Medical', 'Food', 'Transport', 'Shelter', 'Supplies'];
const booleanVals = [true, false];

const generateName = () => `${randPick(firstNames)} ${randPick(lastNames)}`;
const generatePhone = () => `9${randNum(100000000, 999999999)}`;
const generateLat = () => 11.3 + (Math.random() * 0.1); // Around Erode
const generateLng = () => 77.7 + (Math.random() * 0.1); // Around Erode

async function seed() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || 'root',
            database: process.env.DB_NAME || 'uruthunai',
        });

        console.log("Starting DB Seeding...");

        // 1. Generate 100 Users
        console.log("Seeding Users...");
        const usersToInsert = [];
        for (let i = 0; i < 100; i++) {
            const role = Math.random() < 0.05 ? 'admin' : 'user'; // 5% admins
            const type = randPick(userTypes);
            const status = Math.random() < 0.3 ? 'verified' : (Math.random() < 0.05 ? 'banned' : 'unverified');
            const score = randNum(10, 100);

            usersToInsert.push([
                generatePhone(),
                generateName(),
                randPick(areas),
                role,
                type,
                score,
                status,
                '["First Aid", "Driving"]',
                null
            ]);
        }

        const [userResult] = await pool.query(`
            INSERT IGNORE INTO users (phone_number, name, area_code, role, user_type, trust_score, verification_status, skills, profile_pic)
            VALUES ?
        `, [usersToInsert]);

        const totalUsers = userResult.insertId;
        console.log(`Successfully seeded ${userResult.affectedRows} users.`);

        // Fetch user IDs to use for relationships
        const [users] = await pool.query('SELECT id, role FROM users');
        const userIds = users.filter(u => u.role !== 'admin').map(u => u.id);
        const adminIds = users.filter(u => u.role === 'admin').map(u => u.id);

        if (userIds.length === 0) throw new Error("No normal users created");

        // 2. Generate 60 Resources
        console.log("Seeding Resources...");
        const resourcesToInsert = [];
        for (let i = 0; i < 60; i++) {
            resourcesToInsert.push([
                randPick(userIds),
                randPick(resourceCategories),
                `Available ${randPick(resourceCategories).toLowerCase()} supply at Erode point`,
                'We have surplus items that can be collected today. Verified supplies.',
                '24 hours',
                randPick(booleanVals), // is_emergency
                generateLat(),
                generateLng(),
                Math.random() < 0.2 ? 'Claimed' : (Math.random() < 0.1 ? 'Closed' : 'Available')
            ]);
        }
        await pool.query(`
            INSERT INTO resources (user_id, category, title, description, availability_duration, is_emergency, location_lat, location_lng, status)
            VALUES ?
        `, [resourcesToInsert]);

        // 3. Generate 60 Requests
        console.log("Seeding Requests...");
        const requestsToInsert = [];
        for (let i = 0; i < 60; i++) {
            requestsToInsert.push([
                randPick(userIds),
                randPick(requestCategories),
                `Need urgent ${randPick(requestCategories).toLowerCase()} assistance for family of 4.`,
                Math.random() < 0.2 ? 'Critical' : (Math.random() < 0.5 ? 'Essential' : 'Support'),
                generateLat(),
                generateLng(),
                Math.random() < 0.2 ? 'Fulfilled' : (Math.random() < 0.2 ? 'In Progress' : 'Open')
            ]);
        }
        await pool.query(`
            INSERT INTO requests (user_id, category, description, urgency_level, location_lat, location_lng, status)
            VALUES ?
        `, [requestsToInsert]);

        // Fetch resource and request IDs for reports
        const [resources] = await pool.query('SELECT id FROM resources');
        const [requests] = await pool.query('SELECT id FROM requests');

        // 4. Generate 20 Verification Requests
        console.log("Seeding Verification Requests...");
        const verificationsToInsert = [];
        for (let i = 0; i < 20; i++) {
            verificationsToInsert.push([
                randPick(userIds),
                randPick(['volunteer', 'community_activist']),
                '/uploads/mock-doc.pdf',
                Math.random() < 0.5 ? 'Pending' : 'Approved'
            ]);
        }
        await pool.query(`
            INSERT INTO verification_requests (user_id, requested_role, document_url, status)
            VALUES ?
        `, [verificationsToInsert]);

        // 5. Generate 15 Reports
        console.log("Seeding Reports...");
        const reportsToInsert = [];
        for (let i = 0; i < 15; i++) {
            reportsToInsert.push([
                Math.random() > 0.3 ? randPick(userIds) : null, // reported_user_id
                Math.random() > 0.5 ? randPick(resources).id : null, // resource_id
                Math.random() > 0.5 ? randPick(requests).id : null, // request_id
                randPick(userIds), // reported_by (reporter)
                randPick(['Misleading information', 'Spam/Fake request', 'Inappropriate behaviour', 'Resource not available']),
                Math.random() < 0.4 ? 'Pending' : 'Reviewed'
            ]);
        }
        await pool.query(`
            INSERT INTO reports (reported_user_id, resource_id, request_id, reported_by, reason, status)
            VALUES ?
        `, [reportsToInsert]);

        console.log("Database successfully seeded with >100 entries mapping across users, resources, requests, verifications, and reports!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed: ", err);
        process.exit(1);
    }
}

seed();
