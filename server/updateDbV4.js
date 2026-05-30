const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

const updateDbV4 = async () => {
    try {
        const pool = mysql.createPool({
            host: DB_HOST || 'localhost',
            user: DB_USER || 'root',
            password: DB_PASS || 'root',
            database: DB_NAME || 'uruthunai',
        });

        console.log(`Applying V4 Schema Updates (Security & SLA fixes)...`);

        // 1. Expand request_activities action enum to include ACCEPTED, REASSIGNED_BY_ADMIN, SLA_BREACH
        try {
            await pool.query("ALTER TABLE request_activities MODIFY COLUMN action ENUM('POSTED', 'ACCEPTED', 'ACKNOWLEDGED', 'FULFILLED', 'FAILED_SLA', 'REASSIGNED_BY_ADMIN', 'SLA_BREACH') NOT NULL");
            console.log('✓ request_activities action enum expanded');
        } catch (e) { console.log('request_activities enum:', e.message); }

        // 2. Add sla_breached_at column to requests for tracking
        try {
            await pool.query("ALTER TABLE requests ADD COLUMN sla_breached_at TIMESTAMP NULL");
            console.log('✓ sla_breached_at column added to requests');
        } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }

        // 3. Ensure verification_requests table has reviewed_at and reviewed_by columns
        try {
            await pool.query("ALTER TABLE verification_requests ADD COLUMN reviewed_at TIMESTAMP NULL");
            console.log('✓ reviewed_at column added to verification_requests');
        } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }
        try {
            await pool.query("ALTER TABLE verification_requests ADD COLUMN reviewed_by INT NULL");
            console.log('✓ reviewed_by column added to verification_requests');
        } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }

        // 4. Standardize user_type enum to include organization (not just org)
        try {
            await pool.query("ALTER TABLE users MODIFY COLUMN user_type ENUM('resident', 'volunteer', 'activist', 'community_activist', 'skilled_support', 'organization', 'ngo') DEFAULT 'resident'");
            console.log('✓ user_type enum standardized');
        } catch (e) { console.log('user_type enum:', e.message); }

        console.log("\n✅ Database V4 Schema updated successfully (Security & SLA).");
        process.exit(0);
    } catch (error) {
        console.error("Error updating database schema V4:", error);
        process.exit(1);
    }
};

updateDbV4();
