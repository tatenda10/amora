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

const SignupScreen = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  const { 
    signUpWithEmail, 
    loading, 
    error, 
    clearError 
  } = useAuth();

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const showErrorModal = (type, message, primaryText = 'OK', secondaryText = null, onPrimary = null, onSecondary = null) => {
    setModalConfig({
      type,
      message,
      primaryButtonText: primaryText,
      secondaryButtonText: secondaryText,
      onPrimaryPress: onPrimary,
      onSecondaryPress: onSecondary,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    clearError();

    // Basic validation
    if (!formData.email || !formData.password) {
      showErrorModal('validation', 'Please fill in all required fields');
      return;
    }

    if (!formData.name || !formData.confirmPassword) {
      showErrorModal('validation', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showErrorModal('validation', 'Passwords do not match. Please make sure both password fields are identical.');
      return;
    }

    try {
      const result = await signUpWithEmail(formData.email, formData.password, formData.name);
      
      if (result.success) {
        showErrorModal(
          'success', 
          'Account created successfully! Please sign in to continue.',
          'Continue to Sign In',
          null,
          () => {
            setShowModal(false);
            navigation.navigate('Login');
          }
        );
      } else if (result.error) {
        if (result.error.includes('Email already exists')) {
          showErrorModal(
            'error',
            'This email is already registered. Please try signing in instead or use a different email address.',
            'Sign In Instead',
            'Try Again',
            () => {
              setShowModal(false);
              navigation.navigate('Login');
            },
            () => {
              setShowModal(false);
            }
          );
        } else {
          showErrorModal('error', result.error);
        }
      }
    } catch (error) {
      console.log('Signup error:', error);
      showErrorModal('error', 'Registration failed. Please try again.');
    }
  };

  return (
    <SafeAreaWrapper navigation={navigation} title="Welcome" hideBackButton>
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
        >
          <View className="items-center p-5 mt-5">
            <Image
              source={require('../../assets/logo.png')}
              className="w-40 h-40 mb-5"
              resizeMode="contain"
            />
            <Text className="text-2xl font-bold mb-2 text-center" style={{ color: COLORS.deepPlum }}>
              Create Account
            </Text>
            <Text className="text-base text-center" style={{ color: 'rgba(95, 75, 139, 0.7)' }}>
              Start your emotional journey with us
            </Text>
          </View>

          <View className="p-5">
            <TextInput
              className={`rounded-lg p-4 mb-4 text-base ${loading ? 'opacity-60' : ''}`}
              style={{ 
                backgroundColor: 'rgba(147, 112, 219, 0.1)', 
                color: COLORS.deepPlum,
                borderWidth: 0,
                borderBottomWidth: 0
              }}
              placeholder="Full Name"
              placeholderTextColor="rgba(95, 75, 139, 0.5)"
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
              editable={!loading}
              returnKeyType="next"
              blurOnSubmit={false}
              underlineColorAndroid="transparent"
            />

            <TextInput
              className={`rounded-lg p-4 mb-4 text-base ${loading ? 'opacity-60' : ''}`}
              style={{ 
                backgroundColor: 'rgba(147, 112, 219, 0.1)', 
                color: COLORS.deepPlum,
                borderWidth: 0,
                borderBottomWidth: 0
              }}
              placeholder="Email"
              placeholderTextColor="rgba(95, 75, 139, 0.5)"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              editable={!loading}
              returnKeyType="next"
              blurOnSubmit={false}
              underlineColorAndroid="transparent"
            />

            <View className="flex-row items-center rounded-lg mb-4" style={{ backgroundColor: 'rgba(147, 112, 219, 0.1)' }}>
              <TextInput
                className={`flex-1 bg-transparent p-4 pr-2 text-base ${loading ? 'opacity-60' : ''}`}
                style={{ color: COLORS.deepPlum }}
                placeholder="Password"
                placeholderTextColor="rgba(95, 75, 139, 0.5)"
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) => updateFormData('password', text)}
                editable={!loading}
              />
              <TouchableOpacity
                className="p-4 justify-center items-center"
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <Text className="text-lg">{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center rounded-lg mb-4" style={{ backgroundColor: 'rgba(147, 112, 219, 0.1)' }}>
              <TextInput
                className={`flex-1 bg-transparent p-4 pr-2 text-base ${loading ? 'opacity-60' : ''}`}
                style={{ color: COLORS.deepPlum }}
                placeholder="Confirm Password"
                placeholderTextColor="rgba(95, 75, 139, 0.5)"
                secureTextEntry={!showConfirmPassword}
                value={formData.confirmPassword}
                onChangeText={(text) => updateFormData('confirmPassword', text)}
                editable={!loading}
              />
              <TouchableOpacity
                className="p-4 justify-center items-center"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <Text className="text-lg">{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className={`rounded-lg p-4 items-center mt-2 ${loading ? 'opacity-70' : ''}`}
              style={{ backgroundColor: loading ? COLORS.lavenderGray : COLORS.softRose }}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#fff" size="small" />
                  <Text className="text-white text-base font-semibold ml-2">
                    Creating Account...
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-base font-semibold">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center mt-6"
              onPress={() => navigation.navigate('Login')}
            >
              <Text className="font-semibold text-base" style={{ color: COLORS.deepPlum }}>
                Already have an account? Sign In
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

export default SignupScreen;
