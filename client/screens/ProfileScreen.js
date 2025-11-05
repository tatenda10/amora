import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import BASE_URL from '../context/Api';

const ProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/user-profile/update-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim() || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
        // Update user context if needed
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      // Check if ImagePicker is available
      if (!ImagePicker.requestMediaLibraryPermissionsAsync) {
        Alert.alert(
          'Feature Unavailable', 
          'Image picker is not available in this build. Please rebuild the app with the latest development client.'
        );
        return;
      }

      // Request permissions first
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      if (error.message.includes('ExponentImagePicker')) {
        Alert.alert(
          'Rebuild Required', 
          'Please rebuild the development client to include the image picker module. Run: npx expo run:android or npx expo run:ios'
        );
      } else {
        Alert.alert('Error', 'Failed to pick image');
      }
    }
  };

  const uploadProfilePicture = async (imageAsset) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const formData = new FormData();
      formData.append('profile_image', {
        uri: imageAsset.uri,
        type: imageAsset.type || 'image/jpeg',
        name: 'profile_image.jpg',
      });

      const response = await fetch(`${BASE_URL}/user-profile/upload-profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success', 'Profile picture updated successfully');
        // Update user context if needed
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };


  const ProfileField = ({ label, value, editable = false, onChangeText }) => (
    <View className="mb-5">
      <Text className="text-sm text-gray-500 mb-2 font-medium">{label}</Text>
      {editable && isEditing ? (
        <TextInput
          className="text-base text-purple-800 py-3 px-4 bg-gray-50 rounded-lg border border-pink-300"
          value={value}
          onChangeText={onChangeText}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#C7C9F9"
        />
      ) : (
        <Text className="text-base text-purple-800 py-3 px-4 bg-gray-50 rounded-lg">{value}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-2 bg-purple-800 border-b border-purple-300">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Profile</Text>
        <TouchableOpacity 
          onPress={isEditing ? handleCancel : () => setIsEditing(true)}
          className="p-2"
        >
          <Text className="text-base text-white font-semibold">
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View className="items-center py-5 bg-white mb-5">
          <View className="relative mb-4">
            <Image
              source={
                user?.profile_image_url 
                  ? { uri: `${BASE_URL.replace('/api', '')}${user.profile_image_url}` }
                  : require('../assets/icon.png')
              }
              className="w-20 h-20 rounded-full"
            />
            {isEditing && (
              <TouchableOpacity 
                className="absolute bottom-0 right-0 bg-pink-300 rounded-full w-8 h-8 justify-center items-center"
                onPress={handleImagePicker}
              >
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-xl font-bold text-purple-800 mb-1">{user?.name || 'Guest User'}</Text>
          <Text className="text-base text-gray-500">{user?.email || 'guest@example.com'}</Text>
        </View>

        {/* Profile Information */}
        <View className="bg-white mb-5 px-5 py-5">
          <Text className="text-lg font-bold text-purple-800 mb-5">Personal Information</Text>
          
          <ProfileField
            label="Name"
            value={formData.name}
            editable={true}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          
          <ProfileField
            label="Email"
            value={formData.email}
            editable={false}
          />

          <ProfileField
            label="Member Since"
            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            editable={false}
          />

          <ProfileField
            label="Last Login"
            value={user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
            editable={false}
          />
        </View>


        {/* Save Button */}
        {isEditing && (
          <TouchableOpacity 
            className={`bg-pink-300 mx-5 mb-5 py-3 px-6 rounded-lg items-center self-center min-w-[120px] ${loading ? 'opacity-60' : ''}`}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#5F4B8B" />
            ) : (
              <Text className="text-sm font-semibold text-purple-800">Save Changes</Text>
            )}
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};


export default ProfileScreen;
