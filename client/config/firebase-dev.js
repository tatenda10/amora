// Development-friendly Firebase configuration
// This handles cases where React Native Firebase might not be fully initialized

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAD0QveIGlckhhRxwmjF3rMP57Z962hXM8",
  authDomain: "amora-analytics.firebaseapp.com",
  projectId: "amora-analytics",
  storageBucket: "amora-analytics.firebasestorage.app",
  messagingSenderId: "115997118343",
  appId: "1:115997118343:web:5bbda365a3b7c605648d22",
  measurementId: "G-8JFMFG5XGF"
};

// Safe analytics wrapper
const analyticsWrapper = {
  logEvent: async (eventName, parameters = {}) => {
    try {
      // Try to import and use React Native Firebase Analytics
      const analytics = require('@react-native-firebase/analytics').default;
      if (analytics && analytics().logEvent) {
        await analytics().logEvent(eventName, parameters);
        console.log(`📊 Analytics: ${eventName}`, parameters);
      } else {
        throw new Error('Analytics not available');
      }
    } catch (error) {
      // Fallback to console logging
      console.log(`📊 Analytics (fallback): ${eventName}`, parameters);
    }
  },
  
  setUserId: async (userId) => {
    try {
      const analytics = require('@react-native-firebase/analytics').default;
      if (analytics && analytics().setUserId) {
        await analytics().setUserId(userId);
        console.log(`📊 Analytics: User ID set - ${userId}`);
      } else {
        throw new Error('Analytics not available');
      }
    } catch (error) {
      console.log(`📊 Analytics (fallback): User ID set - ${userId}`);
    }
  },
  
  setUserProperties: async (properties) => {
    try {
      const analytics = require('@react-native-firebase/analytics').default;
      if (analytics && analytics().setUserProperties) {
        await analytics().setUserProperties(properties);
        console.log(`📊 Analytics: User properties set`, properties);
      } else {
        throw new Error('Analytics not available');
      }
    } catch (error) {
      console.log(`📊 Analytics (fallback): User properties set`, properties);
    }
  }
};

// Safe messaging wrapper
const messagingWrapper = {
  requestPermission: async () => {
    try {
      const messaging = require('@react-native-firebase/messaging').default;
      if (messaging && messaging().requestPermission) {
        return await messaging().requestPermission();
      } else {
        throw new Error('Messaging not available');
      }
    } catch (error) {
      console.log('📱 Messaging (fallback): Permission request failed');
      return 1; // Return authorized status for development
    }
  },
  
  getToken: async () => {
    try {
      const messaging = require('@react-native-firebase/messaging').default;
      if (messaging && messaging().getToken) {
        return await messaging().getToken();
      } else {
        throw new Error('Messaging not available');
      }
    } catch (error) {
      console.log('📱 Messaging (fallback): Using mock token');
      return 'dev-token-' + Date.now();
    }
  },
  
  setBackgroundMessageHandler: (handler) => {
    try {
      const messaging = require('@react-native-firebase/messaging').default;
      if (messaging && messaging().setBackgroundMessageHandler) {
        return messaging().setBackgroundMessageHandler(handler);
      } else {
        console.log('📱 Messaging (fallback): Background handler not available');
      }
    } catch (error) {
      console.log('📱 Messaging (fallback): Background handler failed');
    }
  },
  
  onMessage: (handler) => {
    try {
      const messaging = require('@react-native-firebase/messaging').default;
      if (messaging && messaging().onMessage) {
        return messaging().onMessage(handler);
      } else {
        console.log('📱 Messaging (fallback): Message handler not available');
        return () => {}; // Return empty unsubscribe function
      }
    } catch (error) {
      console.log('📱 Messaging (fallback): Message handler failed');
      return () => {}; // Return empty unsubscribe function
    }
  }
};

export { analyticsWrapper as analytics, messagingWrapper as messaging };
export default firebaseConfig;
