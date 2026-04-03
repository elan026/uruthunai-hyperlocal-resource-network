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