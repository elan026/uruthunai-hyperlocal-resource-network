const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

const updateDbV2 = async () => {
    try {
        const pool = mysql.createPool({
            host: DB_HOST || 'localhost',
            user: DB_USER || 'root',
            password: DB_PASS || 'root',
            database: DB_NAME || 'uruthunai',
        });

        console.log(`Applying Production Upgrade Schema Updates...`);

        // 1. Modify Requests Table for Lifecycle & Prioritization
        try {
            await pool.query("ALTER TABLE requests ADD COLUMN priority ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') DEFAULT 'LOW'");
        } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }
        
        try {
            await pool.query("ALTER TABLE requests ADD COLUMN assigned_to_user_id INT NULL");
            await pool.query("ALTER TABLE requests ADD FOREIGN KEY (assigned_to_user_id) REFERENCES users(id)");
        } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME' && e.code !== 'ER_FK_DUP_NAME') console.log(e.message); }

        try {
            await pool.query("ALTER TABLE requests ADD COLUMN report_count INT DEFAULT 0");
        } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }
        
        // Let's modify status Enum
        try {
            await pool.query("ALTER TABLE requests MODIFY COLUMN status ENUM('OPEN', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'HIDDEN', 'Open', 'In Progress', 'Fulfilled') DEFAULT 'OPEN'");
        } catch (e) { console.log(e.message); }

        // 2. Modify Users Table for Trust Scoring & Verified Roles
        try {
            await pool.query("ALTER TABLE users ADD COLUMN confidence_level ENUM('HIGH', 'MEDIUM', 'LOW') DEFAULT 'MEDIUM'");
        } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }

        try {
            await pool.query("ALTER TABLE users ADD COLUMN verified_role ENUM('NONE', 'MEDICAL_PROFESSIONAL', 'GOVT_RESCUE', 'NGO_VOLUNTEER') DEFAULT 'NONE'");
        } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }

        // 3. New Item Reports Table
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS item_reports (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    item_id INT NOT NULL,
                    item_type ENUM('REQUEST', 'RESOURCE') NOT NULL,
                    reported_by_user_id INT NOT NULL,
                    reason VARCHAR(255) NOT NULL,
                    status ENUM('PENDING', 'VALIDATED', 'DISMISSED') DEFAULT 'PENDING',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (reported_by_user_id) REFERENCES users(id)
                );
            `);
        } catch (e) {
            console.log('Error creating item_reports table:', e.message);
        }

        console.log("Database V2 Schema updated successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error updating database schema V2:", error);
        process.exit(1);
    }
};

updateDbV2();
