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

// Core Middleware
app.use(cors({
  origin: "http://localhost:5173", // Need to configure properly for production
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
const db = require('./config/db');
setInterval(async () => {
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        // Check both ACCEPTED and ACKNOWLEDGED states — the clock starts at accept
        const [rows] = await db.execute(
            'SELECT id, assigned_to_user_id FROM requests WHERE status IN ("ACCEPTED", "ACKNOWLEDGED") AND acknowledged_at IS NOT NULL AND acknowledged_at < ?',
            [oneHourAgo]
        );
        for (const row of rows) {
            // Transition to NOT_RECEIVED (SLA breach)
            await db.execute(
                'UPDATE requests SET status = "NOT_RECEIVED", sla_breached_at = CURRENT_TIMESTAMP WHERE id = ?', 
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