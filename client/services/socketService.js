import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../context/Api';

// Socket.IO connects to the base server URL (without /api)
const SOCKET_URL = BASE_URL.replace('/api', '');

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventListeners = new Map();
  }

  async connect() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        timeout: 20000,
        forceNew: true,
      });

      this.setupEventHandlers();
      
      return new Promise((resolve, reject) => {
        this.socket.on('connect', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          this.isConnected = false;
          this.handleReconnect();
        });

        this.socket.on('reconnect', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
        });
      });
    } catch (error) {
      throw error;
    }
  }

  setupEventHandlers() {
    // Connection events
    this.socket.on('connect', () => {
      // Socket connected successfully
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      this.isConnected = false;
    });

    // Authentication events
    this.socket.on('authenticated', () => {
      // Socket authenticated
    });

    this.socket.on('unauthorized', (error) => {
      this.disconnect();
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 10000); // Max 10 seconds
      
      setTimeout(() => {
        if (!this.isConnected) {
          this.connect().catch(error => {
            // Reconnection failed
          });
        }
      }, delay);
    } else {
      // Max reconnection attempts reached
      // Reset attempts after a longer delay for production
      setTimeout(() => {
        this.reconnectAttempts = 0;
      }, 30000); // 30 seconds
    }
  }

  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  startTyping(conversationId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { conversationId, userId });
    }
  }

  stopTyping(conversationId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { conversationId, userId });
    }
  }

  markMessageAsRead(conversationId, messageId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('message_read', { conversationId, messageId, userId });
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Store listener for cleanup
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, []);
      }
      this.eventListeners.get(event).push(callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from stored listeners
      if (this.eventListeners.has(event)) {
        const listeners = this.eventListeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  getConnectionStatus() {
    return this.isConnected ? 'connected' : 'disconnected';
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

export default new SocketService();