import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../context/Api';

const BillingScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'month',
      features: [
        'Basic companion matching',
        'Limited daily matches',
        'Limited messages per day',
        'Standard chat features',
        'Community support',
      ],
      current: user?.role === 'user',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$9.99',
      period: 'month',
      features: [
        'Unlimited companion matching',
        'Unlimited daily matches',
        'Unlimited messages',
        'Priority chat support',
        'Advanced AI companions',
        'Exclusive features',
      ],
      current: user?.role === 'premium',
      popular: true,
    },
  ];

  const handleUpgrade = useCallback((planId) => {
    if (planId === 'free') {
      Alert.alert('Info', 'You are already on the Free plan');
      return;
    }

    // Show upgrade coming soon modal
    setShowUpgradeModal(true);
  }, []);

  const handleManageSubscription = useCallback(() => {
    Alert.alert(
      'Manage Subscription',
      'Subscription management features coming soon. Contact support for assistance.',
      [{ text: 'OK' }]
    );
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-2 bg-purple-800 border-b border-purple-300">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Subscription</Text>
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
          {/* Current Subscription Status */}
          <View className="bg-white mb-5 px-5 py-5 mt-5 mx-5 rounded-lg">
            <Text className="text-lg font-bold text-purple-800 mb-5">Current Plan</Text>
            
            <View className="bg-gray-50 rounded-lg p-4 border border-pink-200">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xl font-bold text-purple-800">
                  {user?.role === 'premium' ? 'Premium' : 'Free'}
                </Text>
                {user?.role === 'premium' && (
                  <View className="bg-pink-300 px-3 py-1 rounded-full">
                    <Text className="text-xs font-semibold text-purple-800">Active</Text>
                  </View>
                )}
              </View>
              <Text className="text-base text-gray-600 mb-3">
                {user?.role === 'premium' 
                  ? 'Enjoy unlimited access to all premium features'
                  : 'Upgrade to unlock premium features'}
              </Text>
              {user?.role === 'premium' && (
                <TouchableOpacity 
                  className="bg-purple-100 py-2 px-4 rounded-lg mt-2"
                  onPress={handleManageSubscription}
                >
                  <Text className="text-sm font-semibold text-purple-800 text-center">
                    Manage Subscription
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Subscription Plans */}
          <View className="bg-white mb-5 px-5 py-5 mx-5 rounded-lg">
            <Text className="text-lg font-bold text-purple-800 mb-5">Available Plans</Text>
            
            {subscriptionPlans.map((plan) => (
              <View 
                key={plan.id}
                className={`mb-4 rounded-lg p-5 border-2 ${
                  plan.current 
                    ? 'bg-pink-50 border-pink-300' 
                    : plan.popular 
                    ? 'bg-purple-50 border-purple-300' 
                    : 'bg-gray-50 border-pink-200'
                }`}
              >
                {plan.popular && (
                  <View className="absolute -top-3 right-5 bg-pink-300 px-3 py-1 rounded-full">
                    <Text className="text-xs font-semibold text-purple-800">Most Popular</Text>
                  </View>
                )}
                
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-xl font-bold text-purple-800">{plan.name}</Text>
                  <View>
                    <Text className="text-2xl font-bold text-purple-800">{plan.price}</Text>
                    <Text className="text-sm text-gray-600">/{plan.period}</Text>
                  </View>
                </View>

                <View className="mb-4">
                  {plan.features.map((feature, index) => (
                    <View key={index} className="flex-row items-center mb-2">
                      <Ionicons name="checkmark-circle" size={18} color="#5F4B8B" />
                      <Text className="text-sm text-gray-700 ml-2 flex-1">{feature}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  className={`py-3 px-6 rounded-lg items-center ${
                    plan.current
                      ? 'bg-gray-200'
                      : plan.popular
                      ? 'bg-pink-300'
                      : 'bg-purple-200'
                  }`}
                  onPress={() => handleUpgrade(plan.id)}
                  disabled={plan.current || loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#5F4B8B" />
                  ) : (
                    <Text className={`text-sm font-semibold ${
                      plan.current ? 'text-gray-600' : 'text-purple-800'
                    }`}>
                      {plan.current ? 'Current Plan' : plan.id === 'premium' ? 'Upgrade to Premium' : 'Select Plan'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Billing History */}
          <View className="bg-white mb-5 px-5 py-5 mx-5 rounded-lg">
            <Text className="text-lg font-bold text-purple-800 mb-5">Billing History</Text>
            
            <View className="bg-gray-50 rounded-lg p-4 border border-pink-200">
              <Text className="text-sm text-gray-600 text-center">
                No billing history available
              </Text>
              <Text className="text-xs text-gray-500 text-center mt-2">
                Your payment history will appear here once you subscribe
              </Text>
            </View>
          </View>

          {/* Payment Methods */}
          <View className="bg-white mb-5 px-5 py-5 mx-5 rounded-lg">
            <Text className="text-lg font-bold text-purple-800 mb-5">Payment Methods</Text>
            
            <View className="bg-gray-50 rounded-lg p-4 border border-pink-200">
              <Text className="text-sm text-gray-600 text-center mb-3">
                No payment methods added
              </Text>
              <TouchableOpacity 
                className="bg-purple-100 py-2 px-4 rounded-lg"
                onPress={() => Alert.alert('Info', 'Payment method management coming soon')}
              >
                <Text className="text-sm font-semibold text-purple-800 text-center">
                  Add Payment Method
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Upgrade Coming Soon Modal */}
      <Modal
        visible={showUpgradeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <View className="bg-white rounded-lg p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <Ionicons name="sparkles" size={48} color="#5F4B8B" />
            </View>
            <Text className="text-xl font-bold text-purple-800 text-center mb-3">
              Upgrade Coming Soon
            </Text>
            <Text className="text-sm text-gray-600 text-center mb-6">
              Premium subscription features are coming soon. Stay tuned for updates!
            </Text>
            <TouchableOpacity
              className="bg-pink-300 py-3 px-6 rounded-lg items-center"
              onPress={() => setShowUpgradeModal(false)}
            >
              <Text className="text-sm font-semibold text-purple-800">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BillingScreen;

