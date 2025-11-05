const jwt = require('jsonwebtoken');
const pool = require('../db/connection');

class SocketManager {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // Map to store user_id -> socket_id
    this.socketUsers = new Map(); // Map to store socket_id -> user_id
    
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        // Remove 'Bearer ' prefix if present
        const cleanToken = token.replace('Bearer ', '');
        
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
        socket.userId = decoded.userId || decoded.id;
        
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected with socket ${socket.id}`);
      
      // Store user socket mapping
      this.userSockets.set(socket.userId, socket.id);
      this.socketUsers.set(socket.id, socket.userId);

      // Join user's personal room
      socket.join(`user_${socket.userId}`);

      // Handle joining conversation rooms
      socket.on('join_conversation', (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
      });

      // Handle leaving conversation rooms
      socket.on('leave_conversation', (conversationId) => {
        socket.leave(`conversation_${conversationId}`);
        console.log(`User ${socket.userId} left conversation ${conversationId}`);
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        const { conversationId, userId } = data;
        socket.to(`conversation_${conversationId}`).emit('user_typing', {
          conversationId,
          userId,
          isTyping: true
        });
      });

      socket.on('typing_stop', (data) => {
        const { conversationId, userId } = data;
        socket.to(`conversation_${conversationId}`).emit('user_typing', {
          conversationId,
          userId,
          isTyping: false
        });
      });

      // Handle message read receipts
      socket.on('message_read', async (data) => {
        const { conversationId, messageIds } = data;
        
        try {
          // Update messages as read in database
          if (messageIds && messageIds.length > 0) {
            await pool.execute(
              'UPDATE messages SET is_read = 1 WHERE id IN (?) AND conversation_id = ?',
              [messageIds, conversationId]
            );
          }

          // Notify other users in the conversation
          socket.to(`conversation_${conversationId}`).emit('messages_read', {
            conversationId,
            messageIds,
            readBy: socket.userId
          });
        } catch (error) {
          console.error('Error updating message read status:', error);
        }
      });

      // Handle online status
      socket.on('set_online_status', (status) => {
        socket.to(`user_${socket.userId}`).emit('user_status_change', {
          userId: socket.userId,
          status: status
        });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        
        // Remove from maps
        this.userSockets.delete(socket.userId);
        this.socketUsers.delete(socket.id);
        
        // Notify others that user is offline
        socket.broadcast.emit('user_offline', {
          userId: socket.userId
        });
      });
    });
  }

  // Method to send notification to a specific user
  sendNotification(userId, notification) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  // Method to send message to a conversation
  sendMessageToConversation(conversationId, message) {
    this.io.to(`conversation_${conversationId}`).emit('new_message', message);
  }

  // Method to send typing indicator
  sendTypingIndicator(conversationId, userId, isTyping) {
    this.io.to(`conversation_${conversationId}`).emit('user_typing', {
      conversationId,
      userId,
      isTyping
    });
  }

  // Method to get online users
  getOnlineUsers() {
    return Array.from(this.userSockets.keys());
  }

  // Method to check if user is online
  isUserOnline(userId) {
    return this.userSockets.has(userId);
  }
}

module.exports = SocketManager; 