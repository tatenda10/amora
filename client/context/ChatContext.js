import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import chatService from '../services/chatService';
import socketService from '../services/socketService';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  conversations: [],
  currentConversation: null,
  messages: {}, // conversationId -> messages array
  typingUsers: {}, // conversationId -> typing users
  connectionStatus: 'disconnected', // disconnected, connecting, connected
  unreadCounts: {}, // conversationId -> unread count
  loading: {
    conversations: false,
    messages: false,
    sending: false,
  },
  error: null,
  pagination: {}, // conversationId -> pagination info
};

// Action types
const ActionTypes = {
  // Connection
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
  
  // Conversations
  SET_CONVERSATIONS_LOADING: 'SET_CONVERSATIONS_LOADING',
  SET_CONVERSATIONS: 'SET_CONVERSATIONS',
  ADD_CONVERSATION: 'ADD_CONVERSATION',
  UPDATE_CONVERSATION: 'UPDATE_CONVERSATION',
  
  // Messages
  SET_MESSAGES_LOADING: 'SET_MESSAGES_LOADING',
  SET_MESSAGES: 'SET_MESSAGES',
  APPEND_MESSAGES: 'APPEND_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  REMOVE_MESSAGE: 'REMOVE_MESSAGE',
  SET_SENDING: 'SET_SENDING',
  
  // Typing
  SET_TYPING_USER: 'SET_TYPING_USER',
  REMOVE_TYPING_USER: 'REMOVE_TYPING_USER',
  
  // Unread counts
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  INCREMENT_UNREAD_COUNT: 'INCREMENT_UNREAD_COUNT',
  RESET_UNREAD_COUNT: 'RESET_UNREAD_COUNT',
  
  // Pagination
  SET_PAGINATION: 'SET_PAGINATION',
  
  // Error handling
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const chatReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_CONNECTION_STATUS:
      return {
        ...state,
        connectionStatus: action.payload,
      };

    case ActionTypes.SET_CONVERSATIONS_LOADING:
      return {
        ...state,
        loading: { ...state.loading, conversations: action.payload },
      };

    case ActionTypes.SET_CONVERSATIONS:
      return {
        ...state,
        conversations: action.payload,
        loading: { ...state.loading, conversations: false },
      };

    case ActionTypes.ADD_CONVERSATION:
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
      };

    case ActionTypes.UPDATE_CONVERSATION:
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id ? { ...conv, ...action.payload } : conv
        ),
      };

    case ActionTypes.SET_MESSAGES_LOADING:
      return {
        ...state,
        loading: { ...state.loading, messages: action.payload },
      };

    case ActionTypes.SET_MESSAGES:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: action.payload.messages,
        },
        pagination: {
          ...state.pagination,
          [action.payload.conversationId]: action.payload.pagination,
        },
        loading: { ...state.loading, messages: false },
      };

    case ActionTypes.APPEND_MESSAGES:
      const existingMessages = state.messages[action.payload.conversationId] || [];
      const newMessages = action.payload.messages;
      
      // Filter out messages that already exist to avoid duplicates
      const filteredNewMessages = newMessages.filter(newMsg => 
        !existingMessages.some(existingMsg => existingMsg.id === newMsg.id)
      );
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: [...existingMessages, ...filteredNewMessages],
        },
        pagination: {
          ...state.pagination,
          [action.payload.conversationId]: action.payload.pagination,
        },
        loading: { ...state.loading, messages: false },
      };

    case ActionTypes.ADD_MESSAGE:
      const conversationId = action.payload.conversation_id;
      const currentMessages = state.messages[conversationId] || [];
      
      // Check if message already exists to avoid duplicates
      const messageExists = currentMessages.some(msg => msg.id === action.payload.id);
      if (messageExists) {
        return state;
      }

      // If this is a user message from server/socket, check if there's an optimistic message to replace
      if (action.payload.sender_type === 'user' && !action.payload.is_optimistic) {
        const optimisticMsg = currentMessages.find(
          msg => msg.is_optimistic && 
                 msg.content === action.payload.content &&
                 msg.sender_type === 'user'
        );
        
        if (optimisticMsg) {
          // Replace optimistic message by updating it, preserving the original timestamp
          // This ensures the message maintains its position in the sorted list
          return {
            ...state,
            messages: {
              ...state.messages,
              [conversationId]: currentMessages.map(msg =>
                msg.id === optimisticMsg.id 
                  ? { 
                      ...action.payload, 
                      id: optimisticMsg.id, // Keep optimistic ID
                      created_at: optimisticMsg.created_at, // Preserve optimistic timestamp
                      is_optimistic: false // Remove optimistic flag
                    }
                  : msg
              ),
            },
          };
        }
      }

      // For companion messages, ensure timestamp is after the most recent user message
      // This prevents AI response from appearing before user message
      let messageToAdd = { ...action.payload };
      if (messageToAdd.sender_type === 'companion') {
        const userMessages = currentMessages.filter(msg => msg.sender_type === 'user');
        if (userMessages.length > 0) {
          const lastUserMessage = userMessages.reduce((latest, msg) => {
            const msgTime = new Date(msg.created_at).getTime();
            const latestTime = new Date(latest.created_at).getTime();
            return msgTime > latestTime ? msg : latest;
          });
          
          const lastUserTime = new Date(lastUserMessage.created_at).getTime();
          const companionTime = new Date(messageToAdd.created_at).getTime();
          
          // If companion message timestamp is before or equal to user message, adjust it
          if (companionTime <= lastUserTime) {
            messageToAdd.created_at = new Date(lastUserTime + 1000).toISOString(); // 1 second after user message
          }
        }
      }

      return {
        ...state,
        messages: {
          ...state.messages,
          [conversationId]: [...currentMessages, messageToAdd],
        },
      };

    case ActionTypes.UPDATE_MESSAGE:
      const convId = action.payload.conversation_id;
      const messages = state.messages[convId] || [];
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [convId]: messages.map(msg =>
            msg.id === action.payload.id ? { ...msg, ...action.payload } : msg
          ),
        },
      };

    case ActionTypes.REMOVE_MESSAGE:
      const removeConvId = action.payload.conversationId;
      const removeMsgId = action.payload.messageId;
      const messagesToFilter = state.messages[removeConvId] || [];
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [removeConvId]: messagesToFilter.filter(msg => msg.id !== removeMsgId),
        },
      };

    case ActionTypes.SET_SENDING:
      return {
        ...state,
        loading: { ...state.loading, sending: action.payload },
      };

    case ActionTypes.SET_TYPING_USER:
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.conversationId]: {
            ...state.typingUsers[action.payload.conversationId],
            [action.payload.userId]: action.payload.isTyping,
          },
        },
      };

    case ActionTypes.REMOVE_TYPING_USER:
      const { [action.payload.userId]: removed, ...remaining } = 
        state.typingUsers[action.payload.conversationId] || {};
      
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.conversationId]: remaining,
        },
      };

    case ActionTypes.SET_UNREAD_COUNT:
      return {
        ...state,
        unreadCounts: {
          ...state.unreadCounts,
          [action.payload.conversationId]: action.payload.count,
        },
      };

    case ActionTypes.INCREMENT_UNREAD_COUNT:
      const currentCount = state.unreadCounts[action.payload.conversationId] || 0;
      return {
        ...state,
        unreadCounts: {
          ...state.unreadCounts,
          [action.payload.conversationId]: currentCount + 1,
        },
      };

    case ActionTypes.RESET_UNREAD_COUNT:
      return {
        ...state,
        unreadCounts: {
          ...state.unreadCounts,
          [action.payload.conversationId]: 0,
        },
      };

    case ActionTypes.SET_PAGINATION:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          [action.payload.conversationId]: action.payload.pagination,
        },
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Context
const ChatContext = createContext();

// Provider component
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { user } = useAuth();

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (user) {
      initializeSocket();
    } else {
      socketService.disconnect();
      dispatch({ type: ActionTypes.SET_CONNECTION_STATUS, payload: 'disconnected' });
    }

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  // Initialize socket connection
  const initializeSocket = async () => {
    try {
      dispatch({ type: ActionTypes.SET_CONNECTION_STATUS, payload: 'connecting' });
      
      await socketService.connect();
      
      dispatch({ type: ActionTypes.SET_CONNECTION_STATUS, payload: 'connected' });
      
      // Setup socket event listeners
      setupSocketListeners();
      
    } catch (error) {
      // Failed to initialize socket
      dispatch({ type: ActionTypes.SET_CONNECTION_STATUS, payload: 'disconnected' });
      dispatch({ type: ActionTypes.SET_ERROR, payload: 'Failed to connect to chat service' });
    }
  };

  // Setup socket event listeners
  const setupSocketListeners = () => {
    // Message events
    socketService.on('new_message', (data) => {
      // Socket received message
      
      // Extract message and conversation_id from the data
      const message = data.message || data;
      const conversationId = data.conversation_id || message.conversation_id;
      
      // Dispatch message - reducer will handle timestamp adjustment for companion messages
      dispatch({ 
        type: ActionTypes.ADD_MESSAGE, 
        payload: { ...message, conversation_id: conversationId }
      });
      
      // Hide AI typing indicator if this is an AI response
      if (message.sender_type === 'companion') {
        dispatch({
          type: ActionTypes.SET_TYPING_USER,
          payload: {
            conversationId,
            userId: 'ai',
            isTyping: false
          }
        });
      }
      
      // Increment unread count if not current conversation
      if (state.currentConversation?.id !== conversationId) {
        dispatch({ 
          type: ActionTypes.INCREMENT_UNREAD_COUNT, 
          payload: { conversationId } 
        });
      }
    });

    socketService.on('messages_read', (data) => {
      // Handle message read receipts
    });

    // Typing events
    socketService.on('user_typing', (data) => {
      if (data.isTyping) {
        dispatch({ 
          type: ActionTypes.SET_TYPING_USER, 
          payload: { 
            conversationId: data.conversationId, 
            userId: data.userId, 
            isTyping: true 
          } 
        });
      } else {
        dispatch({ 
          type: ActionTypes.REMOVE_TYPING_USER, 
          payload: { 
            conversationId: data.conversationId, 
            userId: data.userId 
          } 
        });
      }
    });

    // Connection events
    socketService.on('connect_error', () => {
      // Don't show error for production - just silently retry
      dispatch({ type: ActionTypes.SET_CONNECTION_STATUS, payload: 'connecting' });
    });

    socketService.on('disconnect', () => {
      // Set to connecting instead of disconnected to avoid showing "Connection lost"
      dispatch({ type: ActionTypes.SET_CONNECTION_STATUS, payload: 'connecting' });
    });

    socketService.on('reconnect', () => {
      dispatch({ type: ActionTypes.SET_CONNECTION_STATUS, payload: 'connected' });
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    });
  };

  // Action creators
  const actions = {
    // Conversations
    loadConversations: useCallback(async () => {
      try {
        dispatch({ type: ActionTypes.SET_CONVERSATIONS_LOADING, payload: true });
        dispatch({ type: ActionTypes.CLEAR_ERROR });
        
        // Loading conversations
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );
        
        const dataPromise = chatService.getConversations();
        const data = await Promise.race([dataPromise, timeoutPromise]);
        
        // Conversations loaded
        dispatch({ type: ActionTypes.SET_CONVERSATIONS, payload: data.conversations || [] });
        
      } catch (error) {
        // Error loading conversations
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        dispatch({ type: ActionTypes.SET_CONVERSATIONS_LOADING, payload: false });
      }
    }, []),

    createConversation: useCallback(async (companionId) => {
      try {
        dispatch({ type: ActionTypes.CLEAR_ERROR });
        
        const data = await chatService.createConversation(companionId);
        dispatch({ type: ActionTypes.ADD_CONVERSATION, payload: data.conversation });
        
        return data.conversation;
      } catch (error) {
        // Error creating conversation
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    }, []),

    // Messages
    loadMessages: useCallback(async (conversationId, page = 1) => {
      try {
        dispatch({ type: ActionTypes.SET_MESSAGES_LOADING, payload: true });
        dispatch({ type: ActionTypes.CLEAR_ERROR });
        
        const data = await chatService.getConversation(conversationId, page);
        
        // Use APPEND_MESSAGES for pagination (page > 1), SET_MESSAGES for initial load
        const actionType = page > 1 ? ActionTypes.APPEND_MESSAGES : ActionTypes.SET_MESSAGES;
        
        dispatch({ 
          type: actionType, 
          payload: { 
            conversationId, 
            messages: data.messages, 
            pagination: data.pagination 
          } 
        });
        
      } catch (error) {
        // Error loading messages
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      }
    }, []),

    sendMessage: useCallback(async (conversationId, content) => {
      try {
        dispatch({ type: ActionTypes.SET_SENDING, payload: true });
        dispatch({ type: ActionTypes.CLEAR_ERROR });
        
        // Create optimistic user message immediately for instant feedback
        const optimisticUserMessage = {
          id: `temp-${Date.now()}-${Math.random()}`,
          content: content,
          sender_type: 'user',
          conversation_id: conversationId,
          created_at: new Date().toISOString(),
          is_read: false,
          is_optimistic: true, // Flag to identify optimistic messages
        };
        
        // Add user message immediately before API call
        dispatch({ 
          type: ActionTypes.ADD_MESSAGE, 
          payload: optimisticUserMessage
        });
        
        // Show AI typing indicator
        dispatch({
          type: ActionTypes.SET_TYPING_USER,
          payload: {
            conversationId,
            userId: 'ai',
            isTyping: true
          }
        });
        
        // Make API call
        const data = await chatService.sendMessage(conversationId, content);
        
        // Update optimistic message with server response if available
        if (data && data.user_message) {
          // Update the optimistic message in place, preserving the original timestamp
          // This ensures the message stays in the correct position
          dispatch({
            type: ActionTypes.UPDATE_MESSAGE,
            payload: { 
              ...data.user_message, 
              conversation_id: conversationId,
              id: optimisticUserMessage.id, // Keep the same ID to update in place
              created_at: optimisticUserMessage.created_at, // Preserve optimistic timestamp to maintain order
            }
          });
        }
        
        // AI typing indicator will remain visible until AI response arrives via socket
        // The socket 'new_message' event will hide it when companion message arrives
        
        dispatch({ type: ActionTypes.SET_SENDING, payload: false });
        
        return data;
      } catch (error) {
        // Error sending message - remove optimistic message
        dispatch({
          type: ActionTypes.REMOVE_MESSAGE,
          payload: { conversationId, messageId: optimisticUserMessage.id }
        });
        
        dispatch({ type: ActionTypes.SET_SENDING, payload: false });
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        
        // Hide AI typing indicator on error
        dispatch({
          type: ActionTypes.SET_TYPING_USER,
          payload: {
            conversationId,
            userId: 'ai',
            isTyping: false
          }
        });
        
        throw error;
      }
    }, []),

    markAsRead: useCallback(async (conversationId) => {
      try {
        await chatService.markMessagesAsRead(conversationId);
        dispatch({ 
          type: ActionTypes.RESET_UNREAD_COUNT, 
          payload: { conversationId } 
        });
      } catch (error) {
        // Error marking messages as read
      }
    }, []),

    // Socket actions
    joinConversation: useCallback((conversationId) => {
      socketService.joinConversation(conversationId);
    }, []),

    leaveConversation: useCallback((conversationId) => {
      socketService.leaveConversation(conversationId);
    }, []),

    startTyping: useCallback((conversationId) => {
      if (user?.id) {
        socketService.startTyping(conversationId, user.id);
      }
    }, [user?.id]),

    stopTyping: useCallback((conversationId) => {
      if (user?.id) {
        socketService.stopTyping(conversationId, user.id);
      }
    }, [user?.id]),

    // Utility actions
    setCurrentConversation: useCallback((conversation) => {
      dispatch({ type: ActionTypes.SET_CURRENT_CONVERSATION, payload: conversation });
    }, []),

    clearError: useCallback(() => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    }, []),
  };

  const value = {
    ...state,
    ...actions,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;