require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const applianceRoutes = require('./routes/appliances');
const usageRoutes = require('./routes/usage');
const settingsRoutes = require('./routes/settings');
const authRoutes = require('./routes/auth'); // BARU

// Initialize express
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '⚡ Welcome to Voltify API',
    version: '2.0.0', // UPDATED
    endpoints: {
      auth: '/api/auth', // BARU
      appliances: '/api/appliances',
      usage: '/api/usage',
      settings: '/api/settings'
    }
  });
});

app.use('/api/auth', authRoutes); // BARU
app.use('/api/appliances', applianceRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Voltify Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(`🔐 Auth endpoints available at /api/auth`);
});