import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import revenueCatService from '../services/RevenueCatService';
import BASE_URL from '../context/Api';

const UpgradeScreen = ({ navigation }) => {
  const { user, refreshUserData } = useAuth();
  const [offerings, setOfferings] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    console.log('📱 UpgradeScreen mounted - Starting to load RevenueCat offerings...');
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      console.log('🔄 Loading RevenueCat offerings...');
      const currentOfferings = await revenueCatService.getOfferings();
      
      if (currentOfferings) {
        console.log('✅ Offerings loaded successfully');
        console.log('📊 Total packages available:', currentOfferings.availablePackages.length);
        
        // Log each package for debugging
        currentOfferings.availablePackages.forEach((pack, idx) => {
          console.log(`📦 Package ${idx + 1} - ${pack.product.title} (${pack.product.priceString})`);
        });
        
        setOfferings(currentOfferings);
        
        // Select the first available package by default
        if (currentOfferings.availablePackages.length > 0) {
          const firstPackage = currentOfferings.availablePackages[0];
          console.log('🎯 Selected default package:', firstPackage.identifier);
          setSelectedPackage(firstPackage);
        }
        
        // Log final count
        if (currentOfferings.availablePackages.length === 2) {
          console.log('✅ Perfect! Both plans loaded (Basic + Premium)');
        } else if (currentOfferings.availablePackages.length === 1) {
          console.warn('⚠️ Only 1 package found! Expected 2 (Basic + Premium). Check RevenueCat dashboard.');
        } else {
          console.log(`ℹ️ Found ${currentOfferings.availablePackages.length} packages`);
        }
      } else {
        console.log('⚠️ No offerings available from RevenueCat');
      }
    } catch (error) {
      console.error('❌ Error loading offerings:', error);
      Alert.alert('Error', 'Failed to load subscription options');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('Info', 'Please select a plan first');
      return;
    }

    setPurchasing(true);
    try {
      const customerInfo = await revenueCatService.purchasePackage(selectedPackage);
      const tier = revenueCatService.getSubscriptionTier(customerInfo);
      
      // Sync subscription with backend
      try {
        const token = await AsyncStorage.getItem('authToken');
        const syncResponse = await fetch(`${BASE_URL}/api/subscription/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (syncResponse.ok) {
          console.log('✅ Subscription synced with backend');
          // Refresh user data
          if (refreshUserData) {
            await refreshUserData();
          }
        }
      } catch (syncError) {
        console.error('Error syncing subscription:', syncError);
        // Don't fail the purchase if sync fails
      }

      if (tier === 'premium') {
        Alert.alert('Success', 'Welcome to Premium! Enjoy unlimited messages and companions.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else if (tier === 'basic') {
        Alert.alert('Success', 'Basic plan activated! You now have 100 messages/day and up to 3 companions.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Success', 'Subscription activated!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      if (!error.userCancelled) {
        // Log full error details for debugging
        console.error('\n❌ PURCHASE ERROR DETAILS:');
        console.error('Error Code:', error.code);
        console.error('Readable Error Code:', error.readableErrorCode);
        console.error('Error Message:', error.message);
        console.error('Underlying Error:', error.underlyingErrorMessage);
        console.error('Product ID:', selectedPackage?.product?.identifier);
        console.error('Full Error Object:', JSON.stringify(error, null, 2));
        
        let errorMessage = error.message || 'Failed to complete purchase';
        
        // Provide helpful message for Google Play Billing error
        if (errorMessage.includes('not configured for billing') || 
            errorMessage.includes('billing') || 
            error.code === 'BILLING_UNAVAILABLE' ||
            error.readableErrorCode === 'BILLING_UNAVAILABLE') {
          errorMessage = 'Billing service is not available.\n\n' +
            'This usually means:\n' +
            '• App is not installed from Google Play Store\n' +
            '• Google Play Services is not available\n\n' +
            'To test purchases:\n' +
            '1. Build a production APK/AAB\n' +
            '2. Upload to Google Play Console (Internal/Alpha track)\n' +
            '3. Install from Play Store\n\n' +
            'Development builds cannot test purchases.';
        }
        // Product not available errors
        else if (error.code === 'PRODUCT_NOT_AVAILABLE' || 
                 error.readableErrorCode === 'PRODUCT_NOT_AVAILABLE' ||
                 errorMessage.toLowerCase().includes('product not available') ||
                 errorMessage.toLowerCase().includes('not available')) {
          errorMessage = `Product not available: ${selectedPackage?.product?.identifier}\n\n` +
            'Possible causes:\n' +
            '• Product ID mismatch between RevenueCat and Google Play Console\n' +
            '• Product not published/active in Google Play Console\n' +
            '• Product ID format issue (check for colons or special characters)\n\n' +
            'Check:\n' +
            '1. RevenueCat Dashboard → Products → Verify product IDs\n' +
            '2. Google Play Console → Monetize → Products → Verify IDs match\n' +
            '3. Ensure products are published and active';
        }
        // Device/user not allowed errors (License Testing)
        else if (error.code === 'DEVELOPER_ERROR' ||
                 error.readableErrorCode === 'DEVELOPER_ERROR' ||
                 errorMessage.toLowerCase().includes('not allowed') ||
                 errorMessage.toLowerCase().includes('device or user is not allowed')) {
          errorMessage = 'Device or user is not allowed to make purchases.\n\n' +
            'This means your Google account is not set up for testing.\n\n' +
            'Fix this in Google Play Console:\n' +
            '1. Go to Setup → License Testing\n' +
            '2. Add your Google account email (the one on this device)\n' +
            '3. Ensure app is in Internal/Alpha/Beta track\n' +
            '4. Add yourself to testers list for that track\n' +
            '5. Wait 2-24 hours for changes to propagate\n\n' +
            'Also verify:\n' +
            '• Same Google account is signed in on device\n' +
            '• App installed from Play Store (not side-loaded)\n' +
            '• Products are active in Play Console';
        }
        
        Alert.alert('Purchase Error', errorMessage);
      } else {
        console.log('ℹ️ User cancelled purchase');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    try {
      const customerInfo = await revenueCatService.restorePurchases();
      if (revenueCatService.isPro(customerInfo)) {
        Alert.alert('Success', 'Purchases restored!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Info', 'No active subscriptions found to restore.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to restore purchases');
    } finally {
      setPurchasing(false);
    }
  };

  // Get plan features based on product ID
  const getPlanFeatures = (productId) => {
    if (productId?.includes('basic')) {
      return [
        '100 messages per day',
        'AI companion conversations',
        'Advanced emotional analysis',
        'Priority customer support',
        'Multiple AI companions',
      ];
    } else if (productId?.includes('premium')) {
      return [
        'Unlimited messages',
        'All Basic features included',
        'Advanced AI responses',
        'Priority AI processing',
        'Early access to new features',
        'Premium customer support',
      ];
    }
    return [];
  };

  // Determine if plan is popular (Premium is popular)
  const isPopular = (productId) => {
    return productId?.includes('premium');
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#5F4B8B" />
          <Text className="text-purple-800 mt-4">Loading plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-2 bg-purple-800 border-b border-purple-300">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Subscription Plans</Text>
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
                  {user?.role === 'premium' || user?.subscription_tier === 'premium' 
                    ? 'Premium' 
                    : user?.subscription_tier === 'basic' 
                    ? 'Basic' 
                    : 'Free'}
                </Text>
                {(user?.role === 'premium' || user?.subscription_tier === 'premium' || user?.subscription_tier === 'basic') && (
                  <View className="bg-pink-300 px-3 py-1 rounded-full">
                    <Text className="text-xs font-semibold text-purple-800">Active</Text>
                  </View>
                )}
              </View>
              <Text className="text-base text-gray-600 mb-3">
                {user?.role === 'premium' || user?.subscription_tier === 'premium'
                  ? 'Enjoy unlimited access to all premium features'
                  : user?.subscription_tier === 'basic'
                  ? 'Enjoy 100 messages per day with full features'
                  : 'Upgrade to unlock premium features'}
              </Text>
            </View>
          </View>

          {/* Subscription Plans */}
          <View className="bg-white mb-5 px-5 py-5 mx-5 rounded-lg">
            <Text className="text-lg font-bold text-purple-800 mb-5">Available Plans</Text>
            
            {offerings?.availablePackages && offerings.availablePackages.length > 0 ? (
              offerings.availablePackages.map((pack) => {
                const features = getPlanFeatures(pack.product.identifier);
                const popular = isPopular(pack.product.identifier);
                const isSelected = selectedPackage?.product?.identifier === pack.product.identifier;
                
                return (
                  <View 
                    key={pack.product.identifier}
                    className={`mb-4 rounded-lg p-5 border-2 ${
                      isSelected
                        ? 'bg-purple-50 border-purple-500' 
                        : popular 
                        ? 'bg-purple-50 border-purple-300' 
                        : 'bg-gray-50 border-pink-200'
                    }`}
                  >
                    {popular && (
                      <View className="absolute -top-3 right-5 bg-pink-300 px-3 py-1 rounded-full">
                        <Text className="text-xs font-semibold text-purple-800">Most Popular</Text>
                      </View>
                    )}
                    
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="text-xl font-bold text-purple-800">
                        {pack.product.title.replace(' (Amora - AI Companion)', '')}
                      </Text>
                      <View>
                        <Text className="text-2xl font-bold text-purple-800">{pack.product.priceString}</Text>
                        <Text className="text-sm text-gray-600">/{pack.packageType === 'ANNUAL' ? 'year' : 'month'}</Text>
                      </View>
                    </View>

                    {pack.product.description && (
                      <Text className="text-sm text-gray-600 mb-3">{pack.product.description}</Text>
                    )}

                    <View className="mb-4">
                      {features.map((feature, index) => (
                        <View key={index} className="flex-row items-center mb-2">
                          <Ionicons name="checkmark-circle" size={18} color="#5F4B8B" />
                          <Text className="text-sm text-gray-700 ml-2 flex-1">{feature}</Text>
                        </View>
                      ))}
                    </View>

                    <TouchableOpacity
                      className={`py-3 px-6 rounded-lg items-center ${
                        isSelected
                          ? 'bg-purple-600'
                          : popular
                          ? 'bg-pink-300'
                          : 'bg-purple-200'
                      }`}
                      onPress={() => setSelectedPackage(pack)}
                      disabled={purchasing}
                    >
                      <Text className={`text-sm font-semibold ${
                        isSelected ? 'text-white' : 'text-purple-800'
                      }`}>
                        {isSelected ? 'Selected' : 'Select Plan'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <View className="bg-gray-50 rounded-lg p-4 border border-pink-200">
                <Text className="text-sm text-gray-600 text-center">
                  No subscription plans available
                </Text>
                <Text className="text-xs text-gray-500 text-center mt-2">
                  Please check your RevenueCat configuration
                </Text>
              </View>
            )}
          </View>

          {/* Purchase Button */}
          {selectedPackage && (
            <View className="px-5 mb-5">
              <TouchableOpacity
                className={`py-4 px-6 rounded-lg items-center ${
                  purchasing ? 'bg-gray-400' : 'bg-pink-300'
                }`}
                onPress={handlePurchase}
                disabled={purchasing || !selectedPackage}
              >
                {purchasing ? (
                  <ActivityIndicator size="small" color="#5F4B8B" />
                ) : (
                  <Text className="text-base font-semibold text-purple-800">
                    Subscribe for {selectedPackage.product.priceString}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Restore Purchases */}
          <TouchableOpacity 
            onPress={handleRestore} 
            disabled={purchasing}
            className="px-5 mb-5"
          >
            <Text className="text-sm font-semibold text-purple-800 text-center">
              Restore Purchases
            </Text>
          </TouchableOpacity>

          {/* Disclaimer */}
          <Text className="text-xs text-gray-500 text-center px-5 mb-5">
            Cancel anytime. Subscription auto-renews unless cancelled.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UpgradeScreen;
