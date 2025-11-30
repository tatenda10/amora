import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import BASE_URL from '../../context/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatsListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const {
    conversations,
    loading,
    error,
    unreadCounts,
    connectionStatus,
    loadConversations,
    clearError,
  } = useChat();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCompanion, setSelectedCompanion] = useState(null);
  const [loadingCompanion, setLoadingCompanion] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');

  // Fetch selected companion
  const fetchSelectedCompanion = async () => {
    if (!user?.has_selected_companion) return;
    
    setLoadingCompanion(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/user/selected-companion`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedCompanion(data.companion);
      } else {
        // Failed to fetch selected companion
      }
    } catch (error) {
      // Error fetching selected companion
    } finally {
      setLoadingCompanion(false);
    }
  };

  // Load conversations and selected companion on mount
  useEffect(() => {
    loadConversations();
    fetchSelectedCompanion();
  }, [loadConversations]);

  // Handle pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadConversations();
      await fetchSelectedCompanion();
    } catch (error) {
      // Error refreshing conversations
    } finally {
      setRefreshing(false);
    }
  };

  // Format last message time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Invalid time';
      }
      
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else if (diffInHours < 168) { // 7 days
        return date.toLocaleDateString([], { weekday: 'short' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      return 'Invalid time';
    }
  };

  // Get last message for conversation
  const getLastMessage = (conversation) => {
    if (!conversation.last_message) return 'No messages yet';
    
    // Handle both string and object formats for backward compatibility
    let message;
    if (typeof conversation.last_message === 'string') {
      try {
        message = JSON.parse(conversation.last_message);
      } catch {
        // If it's not JSON, treat as plain content
        return conversation.last_message;
      }
    } else {
      message = conversation.last_message;
    }
    
    if (message.sender_type === 'user') {
      return `You: ${message.content}`;
    }
    return message.content;
  };

  // Open chat with companion
  const openChat = (conversation) => {
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      companion: {
        name: conversation.companion_name,
        profile_image_url: conversation.profile_image_url,
        personality: conversation.personality,
      }
    });
  };

  // Start conversation with selected companion
  const startConversationWithCompanion = async () => {
    if (!selectedCompanion) return;
    
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companion_id: selectedCompanion.id,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Navigate to chat with the new conversation
        navigation.navigate('Chat', {
          conversationId: data.conversation.id,
          companion: {
            name: selectedCompanion.name,
            profile_image_url: selectedCompanion.profile_image_url,
            personality: selectedCompanion.personality,
          }
        });
      } else {
        Alert.alert('Error', 'Failed to start conversation');
      }
    } catch (error) {
      // Error starting conversation
      Alert.alert('Error', 'Something went wrong');
    }
  };

  // Render conversation item
  const renderItem = ({ item }) => {
    const unreadCount = unreadCounts[item.id] || 0;
    const lastMessage = getLastMessage(item);
    const lastMessageTime = formatTime(item.updated_at);

    return (
      <TouchableOpacity 
        style={styles.conversationItem}
        onPress={() => openChat(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Image 
            source={{ 
              uri: item.profile_image_url 
                ? `${BASE_URL.replace('/api', '')}${item.profile_image_url}`
                : 'https://via.placeholder.com/50' 
            }} 
            style={styles.avatar}
          />
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.companionName} numberOfLines={1}>
              {item.companion_name}
            </Text>
            <Text style={styles.lastMessageTime}>
              {lastMessageTime}
            </Text>
          </View>
          
          <View style={styles.conversationFooter}>
            <Text 
              style={[
                styles.lastMessage,
                unreadCount > 0 && styles.lastMessageUnread
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {lastMessage}
            </Text>
            
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    // If user has selected a companion but no conversations, show the companion
    if (user?.has_selected_companion && selectedCompanion) {
      return (
        <View style={styles.emptyStateContainer}>
          <TouchableOpacity 
            style={styles.companionCard}
            onPress={startConversationWithCompanion}
            activeOpacity={0.7}
          >
            <View style={styles.companionAvatarContainer}>
              <Image 
                source={{ 
                  uri: selectedCompanion.profile_image_url 
                    ? `${BASE_URL.replace('/api', '')}${selectedCompanion.profile_image_url}`
                    : 'https://via.placeholder.com/60' 
                }}
                style={styles.companionAvatar}
                resizeMode="cover"
              />
            </View>
            <View style={styles.companionInfo}>
              <Text style={styles.companionName}>{selectedCompanion.name}</Text>
              <Text style={styles.companionPersonality}>{selectedCompanion.personality}</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Default empty state
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateTitle}>No conversations yet</Text>
        <Text style={styles.emptyStateSubtitle}>
          Start chatting with your AI companion!
        </Text>
      </View>
    );
  };

  // Render connection status
  const renderConnectionStatus = () => {
    // Hide connection status for production - only show if there's a real error
    if (connectionStatus === 'connected' || connectionStatus === 'connecting') return null;

    return (
      <View style={styles.connectionStatus}>
        <Text style={styles.connectionText}>
          Connection lost
        </Text>
      </View>
    );
  };

  // Render error
  const renderError = () => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={clearError} style={styles.errorButton}>
          <Text style={styles.errorButtonText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Handle add companion click
  const handleAddCompanion = () => {
    console.log('Add companion clicked');
    setUpgradeFeature('Add Another Companion');
    setShowUpgradeModal(true);
  };

  // Handle change companion click
  const handleChangeCompanion = () => {
    console.log('Change companion clicked');
    setUpgradeFeature('Change Companion');
    setShowUpgradeModal(true);
  };

  // Navigate to subscription screen
  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    console.log('🚀 Navigating to UpgradeScreen to load RevenueCat offerings...');
    navigation.navigate('Upgrade');
  };

  if (loading.conversations && conversations.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.deepPlum} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={handleAddCompanion} 
            style={styles.headerIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="add-circle-outline" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleChangeCompanion} 
            style={styles.headerIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="swap-horizontal-outline" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
            <Text style={styles.menuIcon}>⋯</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Connection Status */}
      {renderConnectionStatus()}

      {/* Error */}
      {renderError()}

      {/* Conversations List */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.deepPlum]}
            tintColor={COLORS.deepPlum}
          />
        }
        style={styles.list}
      />

      {/* Upgrade Modal */}
      <Modal
        visible={showUpgradeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="sparkles" size={48} color={COLORS.deepPlum} />
            </View>
            <Text style={styles.modalTitle}>Premium Feature</Text>
            <Text style={styles.modalText}>
              {upgradeFeature} is a premium feature. Please upgrade to use this feature.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleUpgrade}
              >
                <Text style={styles.modalButtonPrimaryText}>Upgrade</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowUpgradeModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.whiteSmoke,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.deepPlum,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.deepPlum,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lavenderGray,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerIconButton: {
    padding: 8,
    marginRight: 8,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    transform: [{ rotate: '90deg' }],
  },
  connectionStatus: {
    backgroundColor: COLORS.dustyPink,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  connectionText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
  errorButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    minHeight: 72,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  companionName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.deepPlum,
    flex: 1,
  },
  lastMessageTime: {
    fontSize: 12,
    color: COLORS.lavenderGray,
    marginLeft: 8,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.lavenderGray,
    flex: 1,
    lineHeight: 18,
  },
  lastMessageUnread: {
    fontWeight: '600',
    color: COLORS.deepPlum,
  },
  unreadBadge: {
    backgroundColor: COLORS.dustyPink,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.lavenderGray,
    marginLeft: 78, // Avatar width + margin + padding
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  companionCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  companionAvatarContainer: {
    marginRight: 16,
  },
  companionAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  companionInfo: {
    flex: 1,
  },
  companionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.deepPlum,
    marginBottom: 4,
  },
  companionPersonality: {
    fontSize: 14,
    color: COLORS.lavenderGray,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.deepPlum,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: COLORS.lavenderGray,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.deepPlum,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  modalButtonPrimary: {
    backgroundColor: COLORS.dustyPink,
  },
  modalButtonPrimaryText: {
    color: COLORS.deepPlum,
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonSecondary: {
    backgroundColor: '#E5E5E5',
  },
  modalButtonSecondaryText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatsListScreen;


