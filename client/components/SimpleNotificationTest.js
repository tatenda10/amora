import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import notificationService from '../services/notificationService';

const SimpleNotificationTest = () => {
  const [isLoading, setIsLoading] = useState(false);

  const testLocalNotification = async () => {
    setIsLoading(true);
    try {
      await notificationService.testNotification();
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
      console.error('Test notification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, backgroundColor: 'white', margin: 10, borderRadius: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: COLORS.deepPlum }}>
        🔔 Test Notifications
      </Text>
      
      <TouchableOpacity
        style={{
          backgroundColor: COLORS.softRose,
          padding: 15,
          borderRadius: 10,
          opacity: isLoading ? 0.6 : 1,
        }}
        onPress={testLocalNotification}
        disabled={isLoading}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          {isLoading ? 'Sending...' : 'Test Notification'}
        </Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 10 }}>
        This will show a local notification at the top of your screen
      </Text>
    </View>
  );
};

export default SimpleNotificationTest;
