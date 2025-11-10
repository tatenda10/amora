import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import BASE_URL from '../../context/Api';

const ChatScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const {
    messages,
    loading,
    error,
    connectionStatus,
    typingUsers,
    pagination,
    sendMessage,
    loadMessages,
    markAsRead,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    clearError,
  } = useChat();

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const keyboardHeightAnim = useRef(new Animated.Value(0)).current;
  const inputPaddingAnim = useRef(new Animated.Value(0)).current;
  
  const conversationId = route.params?.conversationId;
  const companion = route.params?.companion || {
    name: "AI Companion",
    profile_image_url: null,
    personality: "Friendly and helpful",
  };

  // Load messages when component mounts
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
      joinConversation(conversationId);
      markAsRead(conversationId);
    }

    return () => {
      if (conversationId) {
        leaveConversation(conversationId);
      }
    };
  }, [conversationId, loadMessages, joinConversation, leaveConversation, markAsRead]);

  // Initialize input padding with safe area
  useEffect(() => {
    const initialPadding = Platform.OS === 'ios' ? insets.bottom : 12;
    inputPaddingAnim.setValue(initialPadding);
  }, [insets.bottom, inputPaddingAnim]);

  // Manual keyboard handling with animation
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardWillShowListener = Keyboard.addListener(showEvent, (e) => {
      const height = e.endCoordinates.height;
      setKeyboardHeight(height);
      setIsKeyboardVisible(true);
      
      const duration = Platform.OS === 'ios' ? (e.duration || 250) : 100;
      const bottomPadding = Platform.OS === 'ios' ? insets.bottom : 12;
      
      // Animate keyboard height for FlatList padding
      Animated.parallel([
        Animated.timing(keyboardHeightAnim, {
          toValue: height,
          duration: duration,
          useNativeDriver: false,
        }),
        // Animate input padding (keyboard height + safe area)
        Animated.timing(inputPaddingAnim, {
          toValue: height + bottomPadding,
          duration: duration,
          useNativeDriver: false,
        }),
      ]).start();

      // Scroll to bottom when keyboard appears
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, Platform.OS === 'ios' ? 300 : 100);
    });

    const keyboardWillHideListener = Keyboard.addListener(hideEvent, (e) => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
      
      const duration = Platform.OS === 'ios' ? (e.duration || 250) : 100;
      const bottomPadding = Platform.OS === 'ios' ? insets.bottom : 12;
      
      // Animate keyboard height back to 0
      Animated.parallel([
        Animated.timing(keyboardHeightAnim, {
          toValue: 0,
          duration: duration,
          useNativeDriver: false,
        }),
        // Animate input padding back to safe area only
        Animated.timing(inputPaddingAnim, {
          toValue: bottomPadding,
          duration: duration,
          useNativeDriver: false,
        }),
      ]).start();
    });

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [keyboardHeightAnim, inputPaddingAnim, insets.bottom]);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle typing indicators
  const handleTyping = useCallback((text) => {
    setMessage(text);
    
    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      startTyping(conversationId);
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing
    const timeout = setTimeout(() => {
      setIsTyping(false);
      stopTyping(conversationId);
    }, 1000);

    setTypingTimeout(timeout);
  }, [isTyping, typingTimeout, conversationId, startTyping, stopTyping]);

  // Handle sending message
  const handleSend = async () => {
    if (!message.trim() || !conversationId) return;

    const messageText = message.trim();
    
    // Clear input immediately for instant feedback
    setMessage('');
    
    // Stop user typing indicator
    if (isTyping) {
      setIsTyping(false);
      stopTyping(conversationId);
    }

    try {
      // Send message - this will:
      // 1. Add user message immediately
      // 2. Show AI typing indicator
      // 3. Wait for AI response via socket
      await sendMessage(conversationId, messageText);
      
      // Scroll to bottom after message is sent
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      // Error sending message - restore message text
      setMessage(messageText);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  // Get current conversation messages, sorted by timestamp (oldest first for proper display)
  // Primary sort: timestamp, Secondary: user messages before companion messages
  const currentMessages = (messages[conversationId] || []).sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    
    // Primary sort: by timestamp (if difference is significant)
    const timeDiff = timeA - timeB;
    if (Math.abs(timeDiff) > 100) { // More than 100ms difference
      return timeDiff;
    }
    
    // Secondary sort: user messages come before companion messages when timestamps are very close
    // This ensures user message always appears before AI response even if timestamps are identical
    if (a.sender_type === 'user' && b.sender_type === 'companion') {
      return -1; // User message comes first
    }
    if (a.sender_type === 'companion' && b.sender_type === 'user') {
      return 1; // Companion message comes after
    }
    
    // Tertiary sort: by ID for messages of the same type
    return a.id.toString().localeCompare(b.id.toString());
  });

  // Group messages by date for WhatsApp-style date separators
  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    messages.forEach((message, index) => {
      // Validate and parse date safely
      let messageDate;
      try {
        messageDate = new Date(message.created_at);
        if (isNaN(messageDate.getTime())) {
          // If invalid date, use current date as fallback
          messageDate = new Date();
        }
      } catch (error) {
        messageDate = new Date();
      }
      const dateString = messageDate.toDateString();
      
      if (currentDate !== dateString) {
        // Start new group
        if (currentGroup.length > 0) {
          groups.push({
            type: 'messages',
            data: currentGroup,
            date: currentDate
          });
        }
        
        // Add date separator
        groups.push({
          type: 'date',
          data: formatDateString(messageDate),
          date: dateString
        });
        
        currentDate = dateString;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    // Add the last group
    if (currentGroup.length > 0) {
      groups.push({
        type: 'messages',
        data: currentGroup,
        date: currentDate
      });
    }

    return groups;
  };

  // Format date string for display
  const formatDateString = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  // Get grouped messages
  const groupedMessages = groupMessagesByDate(currentMessages);

  // Get typing users for current conversation
  const currentTypingUsers = typingUsers[conversationId] || {};

  // Handle loading more messages when scrolling up
  const handleLoadMore = useCallback(() => {
    if (!loading.messages && conversationId) {
      const currentPagination = pagination[conversationId];
      if (currentPagination && currentPagination.hasMore) {
        loadMessages(conversationId, currentPagination.currentPage + 1);
      }
    }
  }, [loading.messages, conversationId, pagination, loadMessages]);

  // Handle scroll events to detect when user scrolls to top
  const handleScroll = useCallback((event) => {
    const { contentOffset } = event.nativeEvent;
    if (contentOffset.y <= 100) { // Near the top
      handleLoadMore();
    }
  }, [handleLoadMore]);

  // Handle scroll to bottom for new messages
  const scrollToBottom = useCallback(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (currentMessages.length > 0) {
      scrollToBottom();
    }
  }, [currentMessages.length, scrollToBottom]);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Invalid time';
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Invalid time';
    }
  };

  // Get message status for user messages
  const getMessageStatus = (message) => {
    if (message.sender_type !== 'user') return null;
    
    if (message.is_read && message.read_at) {
      return 'read'; // Blue ticks
    } else if (message.is_read) {
      return 'delivered'; // Double ticks
    } else {
      return 'sent'; // Single tick
    }
  };

  // Render message status indicator
  const renderMessageStatus = (message) => {
    const status = getMessageStatus(message);
    
    if (!status) return null;

    const statusConfig = {
      sent: { icon: '✓', color: '#9CA3AF' },
      delivered: { icon: '✓✓', color: '#9CA3AF' },
      read: { icon: '✓✓', color: '#FF6F91' } // Using dustyPink for read status
    };

    const config = statusConfig[status];
    
    return (
      <Text style={{ color: config.color, fontSize: 12, marginLeft: 4 }}>
        {config.icon}
      </Text>
    );
  };

  // Render message item
  const renderMessage = ({ item, index }) => {
    const isUser = item.sender_type === 'user';
    const isLastMessage = index === currentMessages.length - 1;
    const showTimestamp = true; // Show timestamp on every message

    return (
      <View className={`flex-row mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <View className="w-8 h-8 rounded-full mr-2 bg-gray-200 items-center justify-center">
            {companion.profile_image_url ? (
              <Image
                source={{ uri: `${BASE_URL.replace('/api', '')}${companion.profile_image_url}` }}
                className="w-8 h-8 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-sm font-semibold text-gray-600">
                {companion.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            )}
          </View>
        )}
        
        <View className={`max-w-xs px-4 py-2 rounded-2xl ${
          isUser 
            ? 'bg-blue-500 rounded-br-md' 
            : 'bg-gray-200 rounded-bl-md'
        }`}>
          <Text className={`text-base ${
            isUser ? 'text-white' : 'text-gray-800'
          }`}>
            {item.content}
          </Text>
          
          {showTimestamp && (
            <View className={`flex-row items-center mt-1 ${
              isUser ? 'justify-end' : 'justify-start'
            }`}>
              <Text className={`text-xs ${
                isUser ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTimestamp(item.created_at)}
              </Text>
              {renderMessageStatus(item)}
            </View>
          )}
        </View>
      </View>
    );
  };

  // Render date separator
  const renderDateSeparator = (dateString) => {
    return (
      <View className="flex-row items-center my-4 px-4">
        <View className="flex-1 h-px bg-gray-300" />
        <View className="mx-4 px-3 py-1 bg-gray-100 rounded-full">
          <Text className="text-xs text-gray-600 font-medium">{dateString}</Text>
        </View>
        <View className="flex-1 h-px bg-gray-300" />
      </View>
    );
  };

  // Render grouped item (either date separator or message group)
  const renderGroupedItem = ({ item, index }) => {
    if (item.type === 'date') {
      return renderDateSeparator(item.data);
    } else if (item.type === 'messages') {
      return (
        <View>
          {item.data.map((message, messageIndex) => (
            <View key={message.id || `message-${messageIndex}`}>
              {renderMessage({ item: message, index: messageIndex })}
            </View>
          ))}
        </View>
      );
    }
    return null;
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    // Check if AI is typing (userId: 'ai')
    const isAITyping = currentTypingUsers['ai'] === true;

    if (!isAITyping) return null;

    return (
      <View className="flex-row items-end mb-2 px-2">
        <View className="w-8 h-8 rounded-full mr-2 bg-gray-200 items-center justify-center">
          {companion.profile_image_url ? (
        <Image
              source={{ uri: `${BASE_URL.replace('/api', '')}${companion.profile_image_url}` }}
              className="w-8 h-8 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-sm font-semibold text-gray-600">
              {companion.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          )}
        </View>
        <View className="bg-gray-200 px-4 py-2 rounded-2xl rounded-bl-md max-w-xs">
          <Text className="text-gray-600 text-sm">
            {companion.name} is typing...
          </Text>
          <View className="flex-row items-center mt-1">
            <View className="w-1 h-1 bg-gray-400 rounded-full mr-1" />
            <View className="w-1 h-1 bg-gray-400 rounded-full mr-1" />
            <View className="w-1 h-1 bg-gray-400 rounded-full" />
          </View>
        </View>
      </View>
    );
  };

  // Render connection status
  const renderConnectionStatus = () => {
    // Hide connection status for production - only show if there's a real error
    if (connectionStatus === 'connected' || connectionStatus === 'connecting') return null;

    return (
      <View className="bg-[#FF6F91] py-1 px-4">
        <Text className="text-white text-xs text-center">
          Connection lost
        </Text>
      </View>
    );
  };

  // Render error
  const renderError = () => {
    if (!error) return null;

    return (
      <View className="bg-red-500 py-2.5 px-4 flex-row justify-between items-center">
        <Text className="text-white text-sm flex-1">{error}</Text>
        <TouchableOpacity onPress={clearError} className="bg-white/20 px-2.5 py-1.5 rounded">
          <Text className="text-white text-xs">Dismiss</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading.messages && currentMessages.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.deepPlum} />
          <Text className="mt-2.5 text-base text-[#5F4B8B]">Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-row items-center ml-2">
          <View className="w-10 h-10 rounded-full mr-3 bg-gray-200 items-center justify-center">
            {companion.profile_image_url ? (
              <Image
                source={{ uri: `${BASE_URL.replace('/api', '')}${companion.profile_image_url}` }}
                className="w-10 h-10 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-lg font-semibold text-gray-600">
                {companion.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            )}
          </View>
          <View>
            <Text className="text-lg font-semibold text-gray-800">{companion.name}</Text>
            <Text className="text-sm text-gray-500">
              Online
            </Text>
          </View>
        </View>
      </View>

      {/* Connection Status */}
      {renderConnectionStatus()}

      {/* Error */}
      {renderError()}

      {/* Messages */}
      <Animated.View 
        style={{ 
          flex: 1,
          paddingBottom: keyboardHeightAnim
        }}
      >
        <FlatList
          ref={flatListRef}
          data={groupedMessages}
          renderItem={renderGroupedItem}
          keyExtractor={(item, index) => `${item.type}-${item.date}-${index}`}
          className="flex-1 px-2"
          contentContainerStyle={{
            paddingHorizontal: 15,
            paddingVertical: 10,
            flexGrow: 1,
            paddingBottom: 20
          }}
          onScroll={handleScroll}
          scrollEventThrottle={400}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          ListHeaderComponent={() => 
            loading.messages ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color={COLORS.dustyPink} />
                <Text className="text-sm text-gray-500 mt-2">Loading older messages...</Text>
              </View>
            ) : null
          }
          onContentSizeChange={() => {
            if (isKeyboardVisible) {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }
          }}
          onLayout={() => {
            if (!isKeyboardVisible) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
        />
      </Animated.View>

      {/* Typing Indicator */}
      {renderTypingIndicator()}

      {/* Input */}
      <Animated.View 
        className="flex-row items-end px-4 py-3 bg-white border-t border-gray-200"
        style={{
          paddingBottom: inputPaddingAnim,
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <TextInput
            ref={inputRef}
            className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-base text-gray-900"
            value={message}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={1000}
            editable={true}
            style={{ 
              maxHeight: 100, 
              minHeight: 44,
              textAlignVertical: 'center',
              paddingTop: Platform.OS === 'android' ? 12 : 12,
              paddingBottom: Platform.OS === 'android' ? 12 : 12,
            }}
            onFocus={() => {
              // Small delay to ensure keyboard is fully shown
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, Platform.OS === 'ios' ? 300 : 150);
            }}
            onBlur={() => {
              // Keep keyboard handling smooth
            }}
            blurOnSubmit={false}
            returnKeyType="default"
            keyboardType="default"
          />
        </View>
        <TouchableOpacity 
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{
            backgroundColor: message.trim() && !loading.sending ? '#FF6F91' : '#D1D5DB',
            marginBottom: Platform.OS === 'android' ? 0 : 0,
          }}
          onPress={handleSend}
          disabled={!message.trim() || loading.sending}
        >
          {loading.sending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="send" size={20} color="white" />
          )}
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default ChatScreen; 