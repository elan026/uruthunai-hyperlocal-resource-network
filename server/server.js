const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const requestRoutes = require('./routes/requestRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/requests', requestRoutes);

// Keep alert routes inline for now (no dedicated alertRoutes file in target structure)
const alertController = require('./controllers/alertController');
app.get('/api/alerts', alertController.getAllAlerts);
app.post('/api/alerts', alertController.createAlert);
app.patch('/api/alerts/:id/deactivate', alertController.deactivateAlert);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});