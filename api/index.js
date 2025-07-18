const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
dotenv.config();

const authRoutes = require('./routes/auth.js');
const protectedRoutes = require('./routes/protected.js');
const webhookRoutes = require('./routes/webhook.js'); //  Added webhook

const { authenticate } = require('./middleware/auth.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'API is healthy ' });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/protected', protectedRoutes);

// Webhook routes (called by n8n)
app.use('/api', webhookRoutes); //  Mount webhook under /api

// Tenant-aware screen registry
app.get('/api/me/screens', authenticate, (req, res) => {
  try {
    const registryPath = path.join(__dirname, 'registry.json');
    if (!fs.existsSync(registryPath)) {
      return res.status(404).json({ message: 'Registry file not found.' });
    }

    const registryData = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    const tenantScreens = registryData[req.user.tenant];

    if (!tenantScreens) {
      return res.status(404).json({ message: 'No screens found for tenant.' });
    }

    res.json({ screens: tenantScreens });
  } catch (error) {
    console.error('Error reading registry.json:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log(' MongoDB Connected');
    app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
  })
  .catch((err) => console.error(' MongoDB connection error:', err));
