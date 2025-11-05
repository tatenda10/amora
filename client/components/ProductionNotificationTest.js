import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import notificationService from '../services/notificationService';
import analyticsService from '../services/analyticsService';

const ProductionNotificationTest = () => {
  const [isLoading, setIsLoading] = useState(false);

  const testFCMToken = async () => {
    setIsLoading(true);
    try {
      const token = await notificationService.getPushToken();
      if (token) {
        Alert.alert('FCM Token', `Token: ${token.substring(0, 50)}...`);
        analyticsService.trackEvent('fcm_token_generated', { token_length: token.length });
      } else {
        Alert.alert('Error', 'Failed to get FCM token');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get FCM token');
      console.error('FCM token error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testLocalNotification = async () => {
    setIsLoading(true);
    try {
      await notificationService.testNotification();
      Alert.alert('Success', 'Test notification sent!');
      analyticsService.trackEvent('notification_test', { type: 'local' });
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
      console.error('Test notification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testMessageNotification = async () => {
    setIsLoading(true);
    try {
      await notificationService.sendLocalNotification(
        'Maya',
        'Hey! How are you doing today? 😊',
        { type: 'message', companion_id: '1' }
      );
      Alert.alert('Success', 'Message notification sent!');
      analyticsService.trackEvent('notification_test', { type: 'message' });
    } catch (error) {
      Alert.alert('Error', 'Failed to send message notification');
      console.error('Message notification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, backgroundColor: 'white', margin: 10, borderRadius: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: COLORS.deepPlum }}>
        🔔 Production Notifications Test
      </Text>
      
      <TouchableOpacity
        style={{
          backgroundColor: '#10B981',
          padding: 15,
          borderRadius: 10,
          marginBottom: 10,
          opacity: isLoading ? 0.6 : 1,
        }}
        onPress={testFCMToken}
        disabled={isLoading}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          {isLoading ? 'Getting Token...' : 'Get FCM Token'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: COLORS.softRose,
          padding: 15,
          borderRadius: 10,
          marginBottom: 10,
          opacity: isLoading ? 0.6 : 1,
        }}
        onPress={testLocalNotification}
        disabled={isLoading}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          {isLoading ? 'Sending...' : 'Test Local Notification'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: COLORS.deepPlum,
          padding: 15,
          borderRadius: 10,
          marginBottom: 10,
          opacity: isLoading ? 0.6 : 1,
        }}
        onPress={testMessageNotification}
        disabled={isLoading}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          {isLoading ? 'Sending...' : 'Test Message Notification'}
        </Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 10 }}>
        Production FCM + Analytics enabled
      </Text>
    </View>
  );
};

export default ProductionNotificationTest;
