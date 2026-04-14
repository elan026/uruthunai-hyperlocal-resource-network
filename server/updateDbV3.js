const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

const updateDbV3 = async () => {
    try {
        const pool = mysql.createPool({
            host: DB_HOST || 'localhost',
            user: DB_USER || 'root',
            password: DB_PASS || 'root',
            database: DB_NAME || 'uruthunai',
        });

        console.log(`Applying V3 Schema Updates...`);

        // 1. Users Table Enhancements
        try {
            await pool.query("ALTER TABLE users ADD COLUMN pincode VARCHAR(20)");
        } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }
        
        try {
            await pool.query("ALTER TABLE users ADD COLUMN area_name VARCHAR(100)");
        } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }

        try {
            await pool.query("ALTER TABLE users MODIFY COLUMN user_type ENUM('resident', 'volunteer', 'activist', 'skilled_support', 'organization', 'ngo') DEFAULT 'resident'");
        } catch (e) { console.log(e.message); }

        try {
            await pool.query("ALTER TABLE users ADD COLUMN verification_method ENUM('TRUST_SCORE', 'CALL', 'DOCUMENT') DEFAULT 'TRUST_SCORE'");
        } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }

        // 2. Area Settings Table
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS Area_Settings (
                    area_code VARCHAR(100) PRIMARY KEY,
                    is_emergency_mode BOOLEAN DEFAULT FALSE,
                    emergency_reason VARCHAR(255) NULL,
                    is_hill_station BOOLEAN DEFAULT FALSE,
                    is_danger_mode BOOLEAN DEFAULT FALSE
                );
            `);
        } catch (e) { console.log(e.message); }

        // 3. Modifying Requests Table
        try { await pool.query("ALTER TABLE requests ADD COLUMN quantity_needed VARCHAR(100)"); } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }
        try { await pool.query("ALTER TABLE requests ADD COLUMN is_shelter_needed BOOLEAN DEFAULT FALSE"); } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }
        try { await pool.query("ALTER TABLE requests ADD COLUMN is_path_reachable BOOLEAN DEFAULT TRUE"); } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }
        try { await pool.query("ALTER TABLE requests ADD COLUMN emergency_type VARCHAR(100)"); } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }
        try { await pool.query("ALTER TABLE requests ADD COLUMN area_name VARCHAR(100)"); } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }
        try { await pool.query("ALTER TABLE requests ADD COLUMN location_type ENUM('CITY', 'RURAL', 'HILL') DEFAULT 'CITY'"); } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }
        try { await pool.query("ALTER TABLE requests ADD COLUMN acknowledged_by_user_id INT NULL"); } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }
        try { await pool.query("ALTER TABLE requests ADD COLUMN acknowledged_at TIMESTAMP NULL"); } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }
        // Let's modify request status Enum
        try {
            await pool.query("ALTER TABLE requests MODIFY COLUMN status ENUM('OPEN', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'HIDDEN', 'Open', 'In Progress', 'Fulfilled', 'NOT_RECEIVED', 'ACKNOWLEDGED') DEFAULT 'OPEN'");
        } catch (e) { console.log(e.message); }

        // 4. Modifying Resources Table
        try { await pool.query("ALTER TABLE resources ADD COLUMN quantity VARCHAR(100)"); } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }
        try { await pool.query("ALTER TABLE resources ADD COLUMN is_available BOOLEAN DEFAULT TRUE"); } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }
        // Let's modify resource status Enum
        try {
            await pool.query("ALTER TABLE resources MODIFY COLUMN status ENUM('Available', 'Claimed', 'Closed', 'Unavailable', 'NOT_AVAILABLE') DEFAULT 'Available'");
        } catch (e) { console.log(e.message); }

        // 5. Create Request Activity Audit Log Table
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS request_activities (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    request_id INT NOT NULL,
                    user_id INT NOT NULL,
                    action ENUM('POSTED', 'ACKNOWLEDGED', 'FULFILLED', 'FAILED_SLA') NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );
            `);
        } catch (e) {
            console.log('Error creating request_activities table:', e.message);
        }

        console.log("Database V3 Schema updated successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error updating database schema V3:", error);
        process.exit(1);
    }
};

updateDbV3();
