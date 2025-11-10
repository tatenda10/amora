require('dotenv').config();
const express = require('express');
const compression = require('compression');
const path = require('path');
const multer = require('multer');
const http = require('http');
const socketIo = require('socket.io');
const pool = require('./db/connection');

// Import middleware
const { corsOptions, securityHeaders } = require('./middleware/securityMiddleware');
const { apiLimiter, messageLimiter, authLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const userAuthRoutes = require('./routes/userAuth');
const companionRoutes = require('./routes/companions');
const matchingRoutes = require('./routes/matching/matchingRoutes');
const conversationRoutes = require('./routes/conversations');
const notificationRoutes = require('./routes/notifications');
const userProfileRoutes = require('./routes/userProfile');

// Import Socket.IO manager
const SocketManager = require('./socket/socketManager');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// Initialize Socket.IO manager
const socketManager = new SocketManager(io);
app.set('io', io); // Make io available to routes

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'OPENAI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error('FATAL ERROR: Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Security middleware (must be first)
app.use(securityHeaders);

// Compression middleware
app.use(compression());

// CORS middleware
app.use(require('cors')(corsOptions));

// Body parsing middleware with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    logger.debug('Incoming request:', req.method, req.path);
    next();
  });
}

// Rate limiting (applied to all routes)
app.use('/api', apiLimiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint (before rate limiting)
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.execute('SELECT 1');
    res.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
});

// API Routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes); // Admin auth with strict rate limiting
app.use('/api/user', authLimiter, userAuthRoutes); // User auth with strict rate limiting
app.use('/api/companions', companionRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/conversations', messageLimiter, conversationRoutes); // Message routes with message rate limiting
app.use('/api/notifications', notificationRoutes);
app.use('/api/user-profile', userProfileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  // Rate limit error
  if (err.status === 429) {
    return res.status(429).json({ 
      message: err.message || 'Too many requests, please try again later.'
    });
  }

  // Multer file upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File is too large. Maximum size is 5MB' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Too many files. Maximum is 10 files' 
      });
    }
    return res.status(400).json({ 
      message: 'File upload error' 
    });
  }

  // CORS error
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ 
      message: 'CORS policy violation' 
    });
  }
  
  // Log error (always log errors, but format differently in production)
  logger.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Return generic error in production, detailed in development
  res.status(err.status || 500).json({ 
    message: process.env.NODE_ENV === 'development' 
      ? err.message || 'Internal server error'
      : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Route not found:', req.method, req.originalUrl);
  }
  res.status(404).json({ 
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Bind to all interfaces

server.listen(PORT, HOST, () => {
  logger.log(`Server running on ${HOST}:${PORT}`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.log('HTTP server closed');
    pool.end(() => {
      logger.log('Database pool closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.log('HTTP server closed');
    pool.end(() => {
      logger.log('Database pool closed');
      process.exit(0);
    });
  });
});