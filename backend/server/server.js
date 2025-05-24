const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const byteRoutes = require('./routes/byteRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const cors = require('cors');

// Load env vars
dotenv.config();

// Set fallback for critical environment variables
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET="hjhi3ih34ui34rbrj"
}

// Verify Google OAuth credentials
const verifyGoogleCredentials = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID || '530698123278-3cn31ts9qdpn2ted90mnfds3rg0kbcgb.apps.googleusercontent.com';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret_for_development';

  
  if (clientSecret === 'dummy_secret_for_development') {
    console.warn('WARNING: Using dummy Google client secret. Google authentication may not work correctly!');
    console.warn('To fix: Set GOOGLE_CLIENT_SECRET environment variable with your actual Google client secret');
  }
};

// Run verification
verifyGoogleCredentials();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173'], // Allow both origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logger middleware for development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/byte', byteRoutes);
app.use('/api/users', userRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to DailyByte API',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});
module.exports = app