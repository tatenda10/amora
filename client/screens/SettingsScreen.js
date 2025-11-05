import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../context/Api';

// PasswordField component - memoized to prevent unnecessary re-renders
const PasswordField = React.memo(({ label, value, onChangeText, secureTextEntry = false, placeholder }) => (
  <View className="mb-5">
    <Text className="text-sm text-gray-500 mb-2 font-medium">{label}</Text>
    <TextInput
      className="text-base text-purple-800 py-3 px-4 bg-gray-50 rounded-lg border border-pink-300"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#C7C9F9"
      secureTextEntry={secureTextEntry}
      autoCapitalize="none"
      autoCorrect={false}
      blurOnSubmit={false}
      keyboardType="default"
      returnKeyType="next"
    />
  </View>
));

const SettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Use useCallback to memoize handlers and prevent re-renders
  const handleCurrentPasswordChange = useCallback((text) => {
    setFormData(prev => ({ ...prev, currentPassword: text }));
  }, []);

  const handleNewPasswordChange = useCallback((text) => {
    setFormData(prev => ({ ...prev, newPassword: text }));
  }, []);

  const handleConfirmPasswordChange = useCallback((text) => {
    setFormData(prev => ({ ...prev, confirmPassword: text }));
  }, []);

  const handleChangePassword = async () => {
    // Validation
    if (!formData.currentPassword.trim()) {
      Alert.alert('Error', 'Current password is required');
      return;
    }

    if (!formData.newPassword.trim()) {
      Alert.alert('Error', 'New password is required');
      return;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/user/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Password changed successfully', [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              });
              setShowPasswordFields(false);
            },
          },
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to change password');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = useCallback(() => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswordFields(false);
  }, []);

  const handleShowPasswordFields = useCallback(() => {
    setShowPasswordFields(true);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-2 bg-purple-800 border-b border-purple-300">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Settings</Text>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
        {/* Change Password Section */}
        <View className="bg-white mb-5 px-5 py-5 mt-5 mx-5 rounded-lg">
          <Text className="text-lg font-bold text-purple-800 mb-5">Security</Text>
          
          {!showPasswordFields ? (
            <TouchableOpacity
              className="bg-pink-300 py-3 px-6 rounded-lg items-center"
              onPress={handleShowPasswordFields}
            >
              <Text className="text-sm font-semibold text-purple-800">Change Password</Text>
            </TouchableOpacity>
          ) : (
            <>
              <PasswordField
                label="Current Password"
                value={formData.currentPassword}
                onChangeText={handleCurrentPasswordChange}
                secureTextEntry={true}
                placeholder="Enter current password"
              />

              <PasswordField
                label="New Password"
                value={formData.newPassword}
                onChangeText={handleNewPasswordChange}
                secureTextEntry={true}
                placeholder="Enter new password (min 6 characters)"
              />

              <PasswordField
                label="Confirm New Password"
                value={formData.confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                secureTextEntry={true}
                placeholder="Confirm new password"
              />

              <View className="flex-row gap-3 mt-2">
                <TouchableOpacity
                  className={`flex-1 bg-pink-300 py-3 px-6 rounded-lg items-center ${loading ? 'opacity-60' : ''}`}
                  onPress={handleChangePassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#5F4B8B" />
                  ) : (
                    <Text className="text-sm font-semibold text-purple-800">Save Changes</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-gray-200 py-3 px-6 rounded-lg items-center"
                  onPress={handleCancel}
                  disabled={loading}
                >
                  <Text className="text-sm font-semibold text-gray-700">Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

