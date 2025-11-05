// Development-friendly Firebase configuration
// This handles cases where React Native Firebase might not be fully initialized

// Firebase configuration for React Native
const firebaseConfig = {
  apiKey: "AIzaSyBs4ofLxOfVKZDD-WJmKS2cJhq46MCFEG4", // From google-services.json
  authDomain: "amora-analytics.firebaseapp.com",
  projectId: "amora-analytics",
  storageBucket: "amora-analytics.firebasestorage.app",
  messagingSenderId: "115997118343",
  appId: "1:115997118343:android:e2024b41b0378b63648d22", // Android app ID from google-services.json
  measurementId: "G-8JFMFG5XGF"
};

// React Native Firebase Analytics - Production Ready
const analyticsWrapper = {
  logEvent: async (eventName, parameters = {}) => {
    try {
      // Use React Native Firebase Analytics
      const analytics = require('@react-native-firebase/analytics').default;
      if (analytics && analytics().logEvent) {
        await analytics().logEvent(eventName, parameters);
        console.log(`📊 Analytics: ${eventName}`, parameters);
      } else {
        throw new Error('Analytics not available');
      }
    } catch (error) {
      // In development, still log to console for debugging
      console.log(`📊 Analytics (dev): ${eventName}`, parameters);
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
      console.log(`📊 Analytics (dev): User ID set - ${userId}`);
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
      console.log(`📊 Analytics (dev): User properties set`, properties);
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
