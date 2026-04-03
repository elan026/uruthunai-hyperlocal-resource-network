const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

const updateDb = async () => {
    try {
        const pool = mysql.createPool({
            host: DB_HOST || 'localhost',
            user: DB_USER || 'root',
            password: DB_PASS || 'root',
            database: DB_NAME || 'uruthunai',
        });

        console.log(`Updating database tables...`);

        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS otps (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    phone_number VARCHAR(20) NOT NULL,
                    otp VARCHAR(6) NOT NULL,
                    expires_at DATETIME NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log('Created otps table.');
        } catch (e) {
            console.log('Error creating otps table:', e);
        }

        try {
            await pool.query('ALTER TABLE alerts ADD COLUMN location_lat DECIMAL(10, 8) NULL, ADD COLUMN location_lng DECIMAL(11, 8) NULL');
            console.log('Added location_lat and location_lng to alerts table.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME' && e.code !== 'ER_BAD_TABLE_ERROR') throw e;
        }

        try {
            await pool.query('ALTER TABLE resources ADD COLUMN visibility_status ENUM("visible", "hidden") DEFAULT "visible"');
            console.log('Added visibility_status to resources table.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME' && e.code !== 'ER_BAD_TABLE_ERROR') throw e;
        }

        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS system_settings (
                    setting_key VARCHAR(50) PRIMARY KEY,
                    setting_value VARCHAR(255) NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                );
            `);
            await pool.query(`INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES ('is_emergency_active', 'false')`);
            console.log('Created system_settings table.');
        } catch (e) {
            console.log('Error creating system_settings table:', e);
        }

        try {
            console.log('Migrating users table roles and types...');
            // Step 1: Add new columns if they don't exist
            let columnsAdded = false;
            try {
                await pool.query('ALTER TABLE users ADD COLUMN user_type ENUM("resident", "volunteer", "activist", "skilled_support") DEFAULT "resident"');
                columnsAdded = true;
            } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }

            try {
                await pool.query('ALTER TABLE users ADD COLUMN verification_status ENUM("unverified", "verified") DEFAULT "unverified"');
            } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }

            try {
                await pool.query('ALTER TABLE users ADD COLUMN skills VARCHAR(255)');
            } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }

            // Disable strict mode temporarly for mapping
            await pool.query("SET sql_mode=''");

            if (columnsAdded) {
                // Map old values to user_type
                await pool.query('UPDATE users SET user_type = "volunteer" WHERE role = "Volunteer"');
                await pool.query('UPDATE users SET user_type = "skilled_support" WHERE role = "Medical Support"');
                await pool.query('UPDATE users SET user_type = "resident" WHERE role = "Resident"');

                // Change Admin to lowercase admin, others to user
                await pool.query('UPDATE users SET role = "admin" WHERE role = "Admin"');
                await pool.query('UPDATE users SET role = "user" WHERE role != "admin"');
            }

            // Now safe to modify role column definition
            console.log('Updating role column schema...');
            await pool.query('ALTER TABLE users MODIFY COLUMN role ENUM("admin", "user") DEFAULT "user"');

        } catch (e) {
            console.log('Migration error:', e);
        }

        console.log("Database schema updated successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error updating database schema:", error);
        process.exit(1);
    }
};

updateDb();
