import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import notificationService from '../services/notificationService';
import analyticsService from '../services/analyticsService';

const NotificationTestComponent = () => {
  const [isLoading, setIsLoading] = useState(false);

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

  const testMatchNotification = async () => {
    setIsLoading(true);
    try {
      await notificationService.sendLocalNotification(
        'New Match! 🎉',
        'You have a new match with Isabella!',
        { type: 'companion_match', companion_id: '7' }
      );
      Alert.alert('Success', 'Match notification sent!');
      analyticsService.trackEvent('notification_test', { type: 'match' });
    } catch (error) {
      Alert.alert('Error', 'Failed to send match notification');
      console.error('Match notification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: COLORS.deepPlum }}>
        🔔 Notification Tests
      </Text>
      
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
          Test Basic Notification
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
          Test Message Notification
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: '#10B981',
          padding: 15,
          borderRadius: 10,
          marginBottom: 10,
          opacity: isLoading ? 0.6 : 1,
        }}
        onPress={testMatchNotification}
        disabled={isLoading}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          Test Match Notification
        </Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 10 }}>
        These notifications will appear at the top of your screen like WhatsApp
      </Text>
    </View>
  );
};

export default NotificationTestComponent;
