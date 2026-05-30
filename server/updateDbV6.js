const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

const updateDbV6 = async () => {
    try {
        const pool = mysql.createPool({
            host: DB_HOST || 'localhost',
            user: DB_USER || 'root',
            password: DB_PASS || 'root',
            database: DB_NAME || 'uruthunai',
        });

        console.log(`Applying V6 Schema Updates (Enabling Google OAuth 2.0 fields)...`);

        // 1. Make phone_number nullable
        try {
            await pool.query("ALTER TABLE users MODIFY COLUMN phone_number VARCHAR(20) NULL");
            console.log('✓ users.phone_number changed to nullable');
        } catch (e) {
            console.error('Error modifying phone_number column:', e.message);
        }

        // 2. Add google_id column
        try {
            await pool.query("ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE NULL AFTER password");
            console.log('✓ users.google_id column added');
        } catch (e) {
            console.error('Error adding google_id column:', e.message);
        }

        // 3. Add email column
        try {
            await pool.query("ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE NULL AFTER google_id");
            console.log('✓ users.email column added');
        } catch (e) {
            console.error('Error adding email column:', e.message);
        }

        console.log("\n✅ Database V6 Schema updated successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error updating database schema V6:", error);
        process.exit(1);
    }
};

updateDbV6();
