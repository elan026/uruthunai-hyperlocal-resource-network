const express = require('express');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const requestRoutes = require('./routes/requestRoutes');
const listingRoutes = require('./routes/listingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const systemRoutes = require('./routes/systemRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL
].filter(Boolean).map(url => url.replace(/\/$/, ""));

// Core Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, "");
    const isAllowed = allowedOrigins.includes(cleanOrigin) ||
                      /^http:\/\/localhost(:\d+)?$/.test(cleanOrigin) ||
                      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(cleanOrigin) ||
                      cleanOrigin === 'https://uruthunaiplatform.vercel.app' ||
                      cleanOrigin.endsWith('.vercel.app');

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For Twilio webhooks
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Pass io to request and resource controllers or routes if needed, 
// OR set it globally
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // Mount Admin routes
app.use('/api/resources', resourceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/webhooks', webhookRoutes); // Mount Webhooks
app.use('/api/system', systemRoutes); // Mount System Routes

// Keep alert routes inline for now (no dedicated alertRoutes file in target structure)
const alertController = require('./controllers/alertController');
app.get('/api/alerts', alertController.getAllAlerts);
app.post('/api/alerts', alertController.createAlert);
app.patch('/api/alerts/:id/deactivate', alertController.deactivateAlert);

// Global Error Handler
app.use(errorHandler);

// SLA Task Background Job (runs every 5 mins)
// Checks for requests stuck in ACCEPTED or ACKNOWLEDGED state past the 1-hour SLA window
// AND dynamically flags requests at risk (elapsed > 30m, low trust or high distance)
const db = require('./config/db');
setInterval(async () => {
    try {
        const now = Date.now();
        const oneHourAgo = new Date(now - 60 * 60 * 1000);
        const thirtyMinsAgo = new Date(now - 30 * 60 * 1000);

        // 1. Process Actual SLA Breaches (> 1 Hour)
        const [rows] = await db.execute(
            'SELECT id, assigned_to_user_id FROM requests WHERE status IN ("ACCEPTED", "ACKNOWLEDGED") AND acknowledged_at IS NOT NULL AND acknowledged_at < ?',
            [oneHourAgo]
        );
        for (const row of rows) {
            // Transition to NOT_RECEIVED (SLA breach)
            await db.execute(
                'UPDATE requests SET status = "NOT_RECEIVED", sla_warning = "BREACHED", sla_breached_at = CURRENT_TIMESTAMP WHERE id = ?', 
                [row.id]
            );
            // Audit log
            if (row.assigned_to_user_id) {
                await db.execute(
                    'INSERT INTO request_activities (request_id, user_id, action) VALUES (?, ?, "FAILED_SLA")',
                    [row.id, row.assigned_to_user_id]
                );
                // Trust score penalty (-10) for SLA breach
                await db.execute(
                    'UPDATE users SET trust_score = GREATEST(0, trust_score - 10) WHERE id = ?',
                    [row.assigned_to_user_id]
                );
            }
            io.emit('request_status_update', { id: row.id, status: 'NOT_RECEIVED' });
        }
        if (rows.length > 0) {
            console.log(`[SLA Task] Marked ${rows.length} requests as FAILED_SLA with trust penalty.`);
        }

        // 2. Process SLA Warnings (> 30 Mins elapsed)
        const [warningRows] = await db.execute(`
            SELECT r.id, r.location_lat, r.location_lng, u.pincode, u.area_code, u.trust_score
            FROM requests r
            JOIN users u ON r.assigned_to_user_id = u.id
            WHERE r.status IN ('ACCEPTED', 'ACKNOWLEDGED')
              AND r.acknowledged_at IS NOT NULL
              AND r.acknowledged_at < ?
              AND r.acknowledged_at >= ?
              AND (r.sla_warning IS NULL OR r.sla_warning = 'NONE')
        `, [thirtyMinsAgo, oneHourAgo]);

        const LOCATION_COORDINATES = {
            '638001': { lat: 11.3410, lng: 77.7172 }, // Erode City
            '638104': { lat: 11.2721, lng: 77.7942 }, // Modakkurichi
            '638401': { lat: 11.5034, lng: 77.2444 }, // Sathyamangalam
            '638461': { lat: 11.7825, lng: 77.2917 }, // Thalavadi
            '636001': { lat: 11.6643, lng: 78.1460 }, // Salem City
            '636601': { lat: 11.7753, lng: 78.2093 }, // Yercaud
            '641001': { lat: 11.0168, lng: 76.9558 }, // Coimbatore City
            '641301': { lat: 10.3242, lng: 76.9744 }, // Valparai
        };

        const haversine = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) ** 2 +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLon / 2) ** 2;
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        };

        for (const row of warningRows) {
            let pin = row.pincode;
            if (!pin && row.area_code) {
                const match = row.area_code.match(/^(\d{6})/);
                if (match) pin = match[1];
            }

            let isHighRisk = false;
            let distance = null;

            if (pin && LOCATION_COORDINATES[pin] && row.location_lat && row.location_lng) {
                const volCoords = LOCATION_COORDINATES[pin];
                distance = haversine(
                    parseFloat(row.location_lat),
                    parseFloat(row.location_lng),
                    volCoords.lat,
                    volCoords.lng
                );
                // Flag as high risk if volunteer is further than 3km away, or trust score is low (< 60)
                if (distance > 3 || row.trust_score < 60) {
                    isHighRisk = true;
                }
            } else {
                // Fallback: If no location coordinates, flag high risk purely on trust score (< 60)
                if (row.trust_score < 60) {
                    isHighRisk = true;
                }
            }

            if (isHighRisk) {
                await db.execute(
                    'UPDATE requests SET sla_warning = "HIGH_RISK_OF_BREACH" WHERE id = ?',
                    [row.id]
                );
                io.emit('request_sla_warning', { id: row.id, warning: 'HIGH_RISK_OF_BREACH', distance, trust_score: row.trust_score });
                console.log(`[SLA Task] Warning: Request ${row.id} flagged as HIGH_RISK_OF_BREACH (Distance: ${distance ? distance.toFixed(1) : 'unknown'}km, Trust: ${row.trust_score})`);
            }
        }
    } catch (e) {
        console.error('[SLA Task] Error running task:', e);
    }
}, 5 * 60 * 1000); // 5 mins


// Socket config for Area-Based Rooms
io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);
  
  socket.on('join_area', (data) => {
    if (data.pincode) {
        socket.join(`area_${data.pincode}`);
        console.log(`Socket ${socket.id} joined area_${data.pincode}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});