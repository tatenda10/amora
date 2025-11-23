import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import AppNavigator from './navigation/AppNavigator';
import analyticsService from './services/analyticsService';
import notificationService from './services/notificationService';
import revenueCatService from './services/RevenueCatService';
import './global.css';

export default function App() {
  useEffect(() => {
    // Initialize analytics first
    const initializeServices = async () => {
      try {
        console.log('🚀 Initializing app services...');

        // Initialize analytics
        await analyticsService.initialize();

        // Track app open
        analyticsService.trackAppOpen();

        // Initialize notifications
        await notificationService.initialize();

        // Initialize RevenueCat
        await revenueCatService.init();

        console.log('✅ All services initialized successfully');
      } catch (error) {
        console.error('❌ Service initialization failed:', error);
      }
    };

    initializeServices();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ChatProvider>
            <AppNavigator />
          </ChatProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
