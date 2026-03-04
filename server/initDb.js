const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

const initDb = async () => {
    try {
        const pool = mysql.createPool({
            host: DB_HOST || 'localhost',
            user: DB_USER || 'root',
            password: DB_PASS || 'root',
        });

        console.log(`Creating database ${DB_NAME || 'uruthunai'} if not exists...`);
        await pool.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME || 'uruthunai'}\`;`);
        await pool.query(`USE \`${DB_NAME || 'uruthunai'}\`;`);

        // Create Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                phone_number VARCHAR(20) UNIQUE NOT NULL,
                name VARCHAR(100),
                area_code VARCHAR(20),
                role ENUM('Resident', 'Volunteer', 'Medical Support', 'Admin') DEFAULT 'Resident',
                trust_score INT DEFAULT 50,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create Resources Table (Offers)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS resources (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                category VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                availability_duration VARCHAR(100),
                is_emergency BOOLEAN DEFAULT FALSE,
                location_lat DECIMAL(10, 8),
                location_lng DECIMAL(11, 8),
                status ENUM('Available', 'Claimed', 'Closed') DEFAULT 'Available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // Create Requests Table (Needs)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                category VARCHAR(50) NOT NULL,
                description TEXT,
                urgency_level ENUM('Critical', 'Essential', 'Support') DEFAULT 'Support',
                location_lat DECIMAL(10, 8),
                location_lng DECIMAL(11, 8),
                status ENUM('Open', 'In Progress', 'Fulfilled') DEFAULT 'Open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // Create Alerts Table (For Admins)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS alerts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                admin_id INT NOT NULL,
                alert_type VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        console.log("Database tables created successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error setting up database:", error);
        process.exit(1);
    }
};

initDb();
