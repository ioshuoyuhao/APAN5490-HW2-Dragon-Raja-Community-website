/**
 * Night Watcher Forum - Express Server
 * 
 * Node.js server for Dragon Raja Fan Community
 * Serves static files and provides RESTful API for database access
 * 
 * Author: Steven Huo
 * Course: APAN 5490 - Assignment 4
 * Date: December 5, 2025
 * 
 * Features:
 * - Static file serving from /public directory
 * - RESTful API endpoints at /api
 * - MongoDB integration for data persistence
 * - CORS enabled for development
 * - Error handling middleware
 * - Graceful shutdown
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const { 
  connectToDatabase, 
  closeDatabaseConnection,
  initializeDatabase,
  testConnection 
} = require('./db/connection');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ===== MIDDLEWARE CONFIGURATION =====

// CORS - Enable cross-origin requests (useful for development)
app.use(cors({
  origin: NODE_ENV === 'production' ? false : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser - Parse JSON and URL-encoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  });
}

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html', 'htm'],
  index: 'index.html'
}));

// ===== ROUTES =====

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealthy = await testConnection();
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    database: dbHealthy ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// API routes - mounted at /api
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// Fallback route - serve index.html for client-side routing
// This handles any routes not matched by static files or API
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ 
      success: false, 
      error: 'API endpoint not found' 
    });
  }
  
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== ERROR HANDLING =====

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  
  // Don't leak error details in production
  const errorMessage = NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(err.status || 500).json({
    success: false,
    error: errorMessage,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ===== SERVER STARTUP =====

/**
 * Start the Express server and connect to database
 */
async function startServer() {
  try {
    console.log('🚀 Starting Night Watcher Forum Server...');
    console.log(`   Environment: ${NODE_ENV}`);
    console.log(`   Port: ${PORT}`);
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Initialize database (create collections, indexes)
    await initializeDatabase();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log('\n✅ Server running successfully!');
      console.log(`   🌐 Application: http://localhost:${PORT}`);
      console.log(`   📡 API Endpoints: http://localhost:${PORT}/api`);
      console.log(`   ❤️  Health Check: http://localhost:${PORT}/health`);
      console.log('\n   Press Ctrl+C to stop the server\n');
    });

  } catch (error) {
    console.error('\n❌ Failed to start server:', error.message);
    console.error('\n   Troubleshooting steps:');
    console.error('   1. Make sure MongoDB is running (mongod)');
    console.error('   2. Check .env configuration');
    console.error('   3. Verify port 3002 is not in use');
    console.error('   4. Run: npm install\n');
    process.exit(1);
  }
}

// ===== GRACEFUL SHUTDOWN =====

/**
 * Handle graceful shutdown on SIGINT (Ctrl+C) and SIGTERM
 */
async function gracefulShutdown(signal) {
  console.log(`\n\n🛑 Received ${signal}, shutting down gracefully...`);
  
  try {
    // Close database connection
    await closeDatabaseConnection();
    
    console.log('✅ Cleanup complete. Goodbye! 🐉\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Register shutdown handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// ===== START THE SERVER =====

startServer();

// Export app for testing purposes
module.exports = app;

