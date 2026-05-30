const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

const updateDbV5 = async () => {
    try {
        const pool = mysql.createPool({
            host: DB_HOST || 'localhost',
            user: DB_USER || 'root',
            password: DB_PASS || 'root',
            database: DB_NAME || 'uruthunai',
        });

        console.log(`Applying V5 Schema Updates (Fixing missing ENUM values)...`);

        // Fix request status Enum to include NOT_RECEIVED and ACKNOWLEDGED (Standardized to UPPERCASE to avoid duplicate errors)
        try {
            await pool.query("ALTER TABLE requests MODIFY COLUMN status ENUM('OPEN', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'HIDDEN', 'FULFILLED', 'NOT_RECEIVED', 'ACKNOWLEDGED') DEFAULT 'OPEN'");
            console.log('✓ requests status enum expanded and standardized');
        } catch (e) { 
            console.error('Error modifying requests status enum:', e.message); 
        }

        // Fix request_activities action enum just in case
        try {
            await pool.query("ALTER TABLE request_activities MODIFY COLUMN action ENUM('POSTED', 'ACCEPTED', 'ACKNOWLEDGED', 'FULFILLED', 'FAILED_SLA', 'REASSIGNED_BY_ADMIN', 'SLA_BREACH') NOT NULL");
            console.log('✓ request_activities action enum expanded');
        } catch (e) { 
            console.error('Error modifying request_activities enum:', e.message); 
        }

        console.log("\n✅ Database V5 Schema updated successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error updating database schema V5:", error);
        process.exit(1);
    }
};

updateDbV5();
