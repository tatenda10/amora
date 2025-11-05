import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import SafeAreaWrapper from '../../components/Layout/SafeAreaWrapper';
import { useAuth } from '../../context/AuthContext';
import ErrorModal from '../../components/common/ErrorModal';
import analyticsService from '../../services/analyticsService';

const LoginScreen = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    signInWithEmail, 
    loading, 
    error, 
    clearError 
  } = useAuth();

  // Don't automatically show error modal - let handleSubmit handle it

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const showErrorModal = (type, message, primaryText = 'OK', secondaryText = null, onPrimary = null, onSecondary = null, title = null) => {
    setModalConfig({
      type,
      title,
      message,
      primaryButtonText: primaryText,
      secondaryButtonText: secondaryText,
      onPrimaryPress: onPrimary,
      onSecondaryPress: onSecondary,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double submission
    
    console.log('=== Login started ===');
    console.log('formData:', formData);
    
    setIsSubmitting(true);
    clearError();

    // Basic validation
    if (!formData.email || !formData.password) {
      showErrorModal('validation', 'Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    console.log('Validation passed, proceeding with login');

    try {
      const success = await signInWithEmail(formData.email, formData.password);
      
      if (success) {
        // Track successful login
        analyticsService.trackLogin('email');
        analyticsService.trackScreenView('Login', 'LoginScreen');
        // Navigation will happen automatically via AuthContext
        setIsSubmitting(false);
      } else {
        console.log('Login failed');
        // Show the specific error from AuthContext
        const errorMessage = error || 'Invalid email or password. Please try again.';
        showErrorModal('error', errorMessage, 'OK', null, null, null, 'Login Error');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.log('Login error:', error);
      showErrorModal('error', 'Login failed. Please try again.', 'OK', null, null, null, 'Login Error');
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaWrapper navigation={navigation} title="Welcome" hideBackButton>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
          <View className="items-center p-5 mt-5">
            <Image
              source={require('../../assets/logo.png')}
              className="w-40 h-40 mb-5"
              resizeMode="contain"
            />
            <Text className="text-2xl font-bold mb-2 text-center" style={{ color: COLORS.deepPlum }}>
              Welcome Back!
            </Text>
            <Text className="text-base text-center" style={{ color: 'rgba(95, 75, 139, 0.7)' }}>
              Sign in to continue your journey
            </Text>
          </View>

          <View className="p-5">
            <TextInput
              className={`rounded-lg p-4 mb-4 text-base ${isSubmitting ? 'opacity-60' : ''}`}
              style={{ backgroundColor: 'rgba(147, 112, 219, 0.1)', color: COLORS.deepPlum }}
              placeholder="Email"
              placeholderTextColor="rgba(95, 75, 139, 0.5)"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              editable={!isSubmitting}
            />

            <View className="flex-row items-center rounded-lg mb-4" style={{ backgroundColor: 'rgba(147, 112, 219, 0.1)' }}>
              <TextInput
                className={`flex-1 bg-transparent p-4 pr-2 text-base ${isSubmitting ? 'opacity-60' : ''}`}
                style={{ color: COLORS.deepPlum }}
                placeholder="Password"
                placeholderTextColor="rgba(95, 75, 139, 0.5)"
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) => updateFormData('password', text)}
                editable={!isSubmitting}
              />
              <TouchableOpacity
                className="p-4 justify-center items-center"
                onPress={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                <Text className="text-lg">{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className={`rounded-lg p-4 items-center mt-2 ${isSubmitting ? 'opacity-70' : ''}`}
              style={{ backgroundColor: isSubmitting ? COLORS.lavenderGray : COLORS.softRose }}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#fff" size="small" />
                  <Text className="text-white text-base font-semibold ml-2">
                    Signing In...
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-base font-semibold">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity className="items-center mt-4">
              <Text className="text-sm" style={{ color: COLORS.deepPlum }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center mt-6"
              onPress={() => navigation.navigate('Signup')}
            >
              <Text className="font-semibold text-base" style={{ color: COLORS.deepPlum }}>
                Don't have an account? Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ErrorModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        {...modalConfig}
      />
    </SafeAreaWrapper>
  );
};

export default LoginScreen;
