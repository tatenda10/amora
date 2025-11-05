import React from 'react';
import { Modal, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS } from '../../constants/colors';

const ErrorModal = ({ 
  visible, 
  onClose, 
  type = 'error', // 'error', 'success', 'validation'
  title,
  message,
  primaryButtonText = 'OK',
  secondaryButtonText = null,
  onPrimaryPress,
  onSecondaryPress
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error': return '⚠️';
      case 'success': return '✅';
      case 'validation': return '❌';
      default: return '⚠️';
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case 'error': return 'Registration Error';
      case 'success': return 'Account Created';
      case 'validation': return 'Validation Error';
      default: return 'Error';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center items-center bg-black/40 backdrop-blur-md">
          <View className="bg-white rounded-xl p-6 mx-8 max-w-sm w-full shadow-lg">
          <View className="items-center mb-4">
            <Text className="text-3xl mb-2">{getIcon()}</Text>
            <Text className="text-lg font-semibold text-center" style={{ color: COLORS.deepPlum }}>
              {getTitle()}
            </Text>
          </View>
          
          <Text className="text-base text-gray-700 text-center mb-6 leading-5">
            {message}
          </Text>
          
          <View className="flex-row gap-3">
            {secondaryButtonText ? (
              <>
                <TouchableOpacity
                  className="flex-1 py-3 px-4 rounded-lg"
                  style={{ backgroundColor: COLORS.lavenderGray }}
                  onPress={onSecondaryPress || onClose}
                >
                  <Text className="text-center font-semibold text-base" style={{ color: COLORS.deepPlum }}>
                    {secondaryButtonText}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-1 py-3 px-4 rounded-lg"
                  style={{ backgroundColor: COLORS.softRose }}
                  onPress={onPrimaryPress || onClose}
                >
                  <Text className="text-center font-semibold text-white text-base">
                    {primaryButtonText}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                className="w-full py-3 px-4 rounded-lg"
                style={{ backgroundColor: COLORS.softRose }}
                onPress={onPrimaryPress || onClose}
              >
                <Text className="text-center font-semibold text-white text-base">
                  {primaryButtonText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ErrorModal;
