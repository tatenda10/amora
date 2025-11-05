import BASE_URL from '../context/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ChatService {
  constructor() {
    this.baseURL = `${BASE_URL}/conversations`;
  }

  async getAuthToken() {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async getHeaders() {
    const token = await this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  async createConversation(companionId) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseURL}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ companion_id: companionId }),
    });
    return this.handleResponse(response);
  }

  async getConversations() {
    const headers = await this.getHeaders();
    
    console.log('Making request to:', `${this.baseURL}`);
    console.log('Headers:', headers);
    
    // Use the root endpoint which will get user_id from the authenticated token
    const response = await fetch(`${this.baseURL}`, {
      method: 'GET',
      headers,
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    return this.handleResponse(response);
  }

  async getConversation(conversationId, page = 1, limit = 20) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseURL}/${conversationId}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async sendMessage(conversationId, content, messageType = 'text') {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseURL}/${conversationId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content, message_type: messageType }),
    });
    return this.handleResponse(response);
  }

  async markMessagesAsRead(conversationId) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseURL}/${conversationId}/read`, {
      method: 'POST',
      headers,
    });
    return this.handleResponse(response);
  }

  async deleteConversation(conversationId) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseURL}/${conversationId}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse(response);
  }

  extractUserIdFromToken(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id;
    } catch (error) {
      console.error('Error extracting user ID from token:', error);
      return null;
    }
  }

  async retryRequest(requestFn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  async checkNetworkStatus() {
    // This would typically use a network status library
    // For now, we'll assume network is available
    return true;
  }
}

export default new ChatService();