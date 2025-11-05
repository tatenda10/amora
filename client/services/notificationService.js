import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { messaging } from '../config/firebase';
import BASE_URL from '../context/Api';
import analyticsService from './analyticsService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.appStateListener = null;
    this.isInitialized = false;
  }

  // Initialize notifications
  async initialize() {
    try {
      console.log('🔔 Initializing notifications...');
      
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Notification permission denied');
        return false;
      }
      
      console.log('✅ Notification permissions granted');
      
      // Get push token
      await this.getPushToken();
      
      // Set up notification listeners
      this.setupNotificationListeners();
      
      // Set up FCM message handling
      this.setupFCMHandling();
      
      // Set up app state handling
      this.setupAppStateHandling();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ Notification initialization error:', error);
      return false;
    }
  }

  // Get Firebase Cloud Messaging token (production)
  async getPushToken() {
    try {
      if (!Device.isDevice) {
        console.log('⚠️ Must use physical device for push notifications');
        return null;
      }

      // Request permission for FCM
      const authStatus = await messaging.requestPermission();
      const enabled = authStatus === 1; // AUTHORIZED status

      if (!enabled) {
        console.log('❌ FCM permission not granted');
        return null;
      }

      // Get FCM token
      const fcmToken = await messaging.getToken();
      console.log('📱 FCM Token:', fcmToken);
      
      this.expoPushToken = fcmToken;
      
      // Store token locally
      await AsyncStorage.setItem('expoPushToken', fcmToken);
      
      // Send token to server
      await this.sendTokenToServer(fcmToken);
      
      return fcmToken;
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  }

  // Send token to server
  async sendTokenToServer(token) {
    try {
      const userToken = await AsyncStorage.getItem('authToken');
      if (!userToken) {
        console.log('⚠️ No auth token, skipping token registration');
        return;
      }

      // Check if this is a mock token (development)
      if (token.startsWith('dev-token-')) {
        console.log('📱 Development mode: Skipping server registration for mock token');
        return;
      }

      const response = await fetch(`${BASE_URL}/notifications/register-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          token: token,
          platform: Platform.OS,
          device_id: Device.osInternalBuildId || 'unknown',
        }),
      });

      if (response.ok) {
        console.log('✅ Push token registered with server');
        analyticsService.trackEvent('notification_token_registered', {
          platform: Platform.OS,
          token_length: token.length,
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to register push token with server:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error sending token to server:', error.message);
      // Don't throw error in development
      if (token.startsWith('dev-token-')) {
        console.log('📱 Development mode: Server registration failed, continuing with local notifications');
      }
    }
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Listen for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📨 Notification received:', notification);
      
      // Track notification received
      analyticsService.trackEvent('notification_received', {
        notification_type: notification.request.content.data?.type || 'message',
        companion_id: notification.request.content.data?.companion_id,
        from_background: false,
      });
      
      // Handle different notification types
      this.handleNotificationReceived(notification);
    });

    // Listen for notification taps
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      
      // Track notification tap
      analyticsService.trackEvent('notification_tapped', {
        notification_type: response.notification.request.content.data?.type || 'message',
        companion_id: response.notification.request.content.data?.companion_id,
      });
      
      // Handle notification tap
      this.handleNotificationTap(response);
    });
  }

  // Handle notification received
  handleNotificationReceived(notification) {
    const data = notification.request.content.data;
    
    switch (data?.type) {
      case 'message':
        // Show in-app notification for new messages
        this.showInAppNotification(notification);
        break;
      case 'companion_match':
        // Handle companion match notification
        console.log('🎯 New companion match!');
        break;
      case 'system':
        // Handle system notifications
        console.log('🔧 System notification received');
        break;
      default:
        console.log('📨 Unknown notification type:', data?.type);
    }
  }

  // Handle notification tap
  handleNotificationTap(response) {
    const data = response.notification.request.content.data;
    
    switch (data?.type) {
      case 'message':
        // Navigate to chat screen
        if (data.companion_id) {
          // You'll need to import navigation here
          console.log('💬 Navigate to chat with companion:', data.companion_id);
        }
        break;
      case 'companion_match':
        // Navigate to companion selection
        console.log('🎯 Navigate to companion selection');
        break;
      default:
        console.log('👆 Unknown notification tap:', data?.type);
    }
  }

  // Show in-app notification (like WhatsApp)
  showInAppNotification(notification) {
    const { title, body, data } = notification.request.content;
    
    // Create a local notification for in-app display
    Notifications.scheduleNotificationAsync({
      content: {
        title: title || 'New Message',
        body: body || 'You have a new message',
        data: data,
        sound: true,
        badge: 1,
      },
      trigger: null, // Show immediately
    });
  }

  // Send local notification
  async sendLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Show immediately
      });
      
      console.log('📱 Local notification sent:', title);
    } catch (error) {
      console.error('❌ Error sending local notification:', error);
    }
  }

  // Clear all notifications
  async clearAllNotifications() {
    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log('🧹 All notifications cleared');
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
    }
  }

  // Get notification count
  async getNotificationCount() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications.length;
    } catch (error) {
      console.error('❌ Error getting notification count:', error);
      return 0;
    }
  }

  // Set up FCM message handling
  setupFCMHandling() {
    try {
      if (!messaging) {
        console.log('📱 Messaging (fallback): FCM not available, using local notifications only');
        return;
      }

      // Handle background messages (with error handling)
      try {
        messaging.setBackgroundMessageHandler(async (remoteMessage) => {
          console.log('📨 Background message received:', remoteMessage);
          analyticsService.trackEvent('notification_received', {
            notification_type: remoteMessage.data?.type || 'message',
            from_background: true,
          });
        });
      } catch (error) {
        console.log('📱 Messaging (fallback): Background handler failed');
      }

      // Handle foreground messages (with error handling)
      try {
        const unsubscribe = messaging.onMessage(async (remoteMessage) => {
          console.log('📨 Foreground message received:', remoteMessage);
          
          // Show local notification when app is in foreground
          await this.sendLocalNotification(
            remoteMessage.notification?.title || 'New Message',
            remoteMessage.notification?.body || 'You have a new message',
            remoteMessage.data || {}
          );
          
          analyticsService.trackEvent('notification_received', {
            notification_type: remoteMessage.data?.type || 'message',
            from_background: false,
          });
        });

        // Store unsubscribe function
        this.fcmUnsubscribe = unsubscribe;
      } catch (error) {
        console.log('📱 Messaging (fallback): Message handler failed');
      }
    } catch (error) {
      console.log('📱 Messaging (fallback): FCM setup failed, using local notifications only');
    }
  }

  // Set up app state handling
  setupAppStateHandling() {
    this.appStateListener = AppState.addEventListener('change', (nextAppState) => {
      console.log('📱 App state changed to:', nextAppState);
      
      if (nextAppState === 'active') {
        // App came to foreground - clear badge
        this.clearBadge();
        analyticsService.trackEvent('app_foreground', {});
      } else if (nextAppState === 'background') {
        // App went to background
        analyticsService.trackEvent('app_background', {});
      }
    });
  }

  // Clear notification badge
  async clearBadge() {
    try {
      await Notifications.setBadgeCountAsync(0);
      console.log('🧹 Badge cleared');
    } catch (error) {
      console.error('❌ Error clearing badge:', error);
    }
  }

  // Cleanup listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
    if (this.appStateListener) {
      this.appStateListener.remove();
    }
    if (this.fcmUnsubscribe) {
      this.fcmUnsubscribe();
    }
  }

  // Test notification
  async testNotification() {
    await this.sendLocalNotification(
      'Test Notification',
      'This is a test notification from Amora!',
      { type: 'test' }
    );
  }
}

// Export singleton instance
export default new NotificationService();
