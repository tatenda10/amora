import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';
import * as Linking from 'expo-linking';

// Import screens that actually exist
import SplashScreen from '../screens/SplashScreen';
import IntroSlides from '../screens/IntroSlides';
import ChatScreen from '../screens/Chat/ChatScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import CompanionSelectionScreen from '../screens/Companion/CompanionSelectionScreen';
import UpgradeScreen from '../screens/UpgradeScreen';
import SupportScreen from '../screens/SupportScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatsListScreen from '../screens/Chat/ChatsListScreen';
import TestNotificationsScreen from '../screens/TestNotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import BillingScreen from '../screens/BillingScreen';
import DrawerContent from '../components/Navigation/DrawerContent';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Deep linking configuration
const linking = {
  prefixes: [Linking.createURL('/'), 'amora://'],
  config: {
    screens: {
      Splash: 'splash',
      IntroSlides: 'intro',
      Login: 'login',
      Signup: 'signup',
      Onboarding: 'onboarding',
      CompanionSelection: 'companion-selection',
      Chats: 'chats',
      Chat: 'chat/:id',
      Profile: 'profile',
      Upgrade: 'upgrade',
      Support: 'support',
    },
  },
};

const AuthedDrawer = () => (
  <Drawer.Navigator
    screenOptions={{ 
      headerShown: false,
      drawerStyle: { width: '60%' },
    }}
    drawerContent={(props) => <DrawerContent {...props} />}
  >
    <Drawer.Screen name="Chats" component={ChatsListScreen} />
    <Drawer.Screen name="Chat" component={ChatScreen} />
    <Drawer.Screen name="Profile" component={ProfileScreen} />
    <Drawer.Screen name="Settings" component={SettingsScreen} />
    <Drawer.Screen name="Billing" component={BillingScreen} />
    <Drawer.Screen name="TestNotifications" component={TestNotificationsScreen} />
    {/* <Drawer.Screen name="Upgrade" component={UpgradeScreen} /> */}
    <Drawer.Screen name="Support" component={SupportScreen} />
  </Drawer.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, loading, isOnboardingCompleted, hasSelectedCompanion } = useAuth();

  // Debug navigation state
  console.log('🧭 Navigation state:', {
    loading,
    isAuthenticated,
    isOnboardingCompleted,
    hasSelectedCompanion
  });

  return (
    <NavigationContainer linking={linking}>
      {loading ? (
        <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        </Stack.Navigator>
      ) : isAuthenticated ? (
        // Check onboarding status for authenticated users
        isOnboardingCompleted ? (
          hasSelectedCompanion ? (
            <AuthedDrawer />
          ) : (
            // User completed onboarding but hasn't selected companion
            <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
              <Stack.Screen name="CompanionSelection" component={CompanionSelectionScreen} />
              <Stack.Screen name="Chats" component={ChatsListScreen} />
              <Stack.Screen name="Chat" component={ChatScreen} />
            </Stack.Navigator>
          )
        ) : (
          // User needs to complete onboarding
          <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="CompanionSelection" component={CompanionSelectionScreen} />
            <Stack.Screen name="Chats" component={ChatsListScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
          </Stack.Navigator>
        )
      ) : (
        // Unauthenticated: Start with IntroSlides
        <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
          <Stack.Screen name="IntroSlides" component={IntroSlides} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Upgrade" component={UpgradeScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator; 