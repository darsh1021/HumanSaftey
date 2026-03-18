const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require('./routes/authRoutes');
const cameraRoutes = require('./routes/cameraRoutes');
const aiRoutes = require('./routes/aiRoutes');
const violationRoutes = require('./routes/violationRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Basic Test Route
app.get('/', (req, res) => {
  res.send('API Running');
});

// Configure Routes
app.use('/api/auth', authRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/reports', reportRoutes);

module.exports = app;
