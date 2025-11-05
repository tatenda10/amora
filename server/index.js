require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const http = require('http');
const socketIo = require('socket.io');

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
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// Initialize Socket.IO manager
const socketManager = new SocketManager(io);
app.set('io', io); // Make io available to routes

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware for debugging (disabled for production)
app.use((req, res, next) => {
  console.log('\n=== INCOMING REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Path:', req.path);
  console.log('Original URL:', req.originalUrl);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', req.body);
  }
  console.log('=== END REQUEST ===\n');
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes); // Admin auth
app.use('/api/user', userAuthRoutes); // User auth
app.use('/api/companions', companionRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/user-profile', userProfileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
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
  
  // console.error(err.stack); // Disabled for production
  res.status(500).json({ 
    message: 'Internal server error' 
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Catch-all route for debugging - should be last
app.use('*', (req, res) => {
  console.log('⚠️  No route matched for:', req.method, req.originalUrl);
  console.log('Available routes:');
  console.log('  POST /api/user/login');
  console.log('  POST /api/user/register');
  console.log('  GET /api/user/me');
  res.status(404).json({ 
    message: 'Route not found',
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl
  });
});

// Start server
const PORT = process.env.PORT || 6000;
const HOST = process.env.HOST || '0.0.0.0'; // Bind to all interfaces

server.listen(PORT, HOST, () => {
  // Server started successfully
});