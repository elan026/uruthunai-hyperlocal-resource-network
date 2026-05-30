const { URL } = require('url');
require('dotenv').config();

const parseDatabaseUrl = (urlStr) => {
    if (!urlStr) {
        return {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306', 10),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || 'root',
            database: process.env.DB_NAME || 'uruthunai'
        };
    }

    try {
        const parsed = new URL(urlStr);
        return {
            host: parsed.hostname,
            port: parseInt(parsed.port || '3306', 10),
            user: parsed.username,
            password: decodeURIComponent(parsed.password || ''),
            database: parsed.pathname ? parsed.pathname.replace(/^\//, '') : 'uruthunai'
        };
    } catch (e) {
        console.error('Error parsing DATABASE_URL, using defaults:', e.message);
        return {
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'root',
            database: 'uruthunai'
        };
    }
};

const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);

module.exports = dbConfig;
