const express = require('express');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const requestRoutes = require('./routes/requestRoutes');
const listingRoutes = require('./routes/listingRoutes');
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
app.use(cors());
app.use(express.json());

// Pass io to request and resource controllers or routes if needed, 
// OR set it globally
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/listings', listingRoutes);

// Keep alert routes inline for now (no dedicated alertRoutes file in target structure)
const alertController = require('./controllers/alertController');
app.get('/api/alerts', alertController.getAllAlerts);
app.post('/api/alerts', alertController.createAlert);
app.patch('/api/alerts/:id/deactivate', alertController.deactivateAlert);

// Global Error Handler
app.use(errorHandler);

// Socket config
io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});