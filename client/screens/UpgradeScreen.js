import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '../constants/colors';
import SafeAreaWrapper from '../components/Layout/SafeAreaWrapper';
import revenueCatService from '../services/RevenueCatService';

const UpgradeScreen = ({ navigation }) => {
  const [offerings, setOfferings] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const currentOfferings = await revenueCatService.getOfferings();
      if (currentOfferings) {
        setOfferings(currentOfferings);
        // Select the first available package by default
        if (currentOfferings.availablePackages.length > 0) {
          setSelectedPackage(currentOfferings.availablePackages[0]);
        }
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
      Alert.alert('Error', 'Failed to load subscription options');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setPurchasing(true);
    try {
      const customerInfo = await revenueCatService.purchasePackage(selectedPackage);
      if (revenueCatService.isPro(customerInfo)) {
        Alert.alert('Success', 'Welcome to Premium!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      if (!error.userCancelled) {
        Alert.alert('Error', error.message);
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
      Alert.alert('Error', error.message);
    } finally {
      setPurchasing(false);
    }
  };

  const features = [
    {
      title: 'Unlimited Conversations',
      description: 'Chat with your companion anytime, anywhere',
      icon: '💬',
    },
    {
      title: 'Multiple Companions',
      description: 'Connect with different companions for varied support',
      icon: '👥',
    },
    {
      title: 'Advanced Emotional Analysis',
      description: 'Get deeper insights into your emotional patterns',
      icon: '🎯',
    },
    {
      title: 'Priority Support',
      description: '24/7 premium customer support',
      icon: '⭐',
    },
    {
      title: 'Ad-Free Experience',
      description: 'Enjoy an uninterrupted experience',
      icon: '✨',
    },
  ];

  if (loading) {
    return (
      <SafeAreaWrapper navigation={navigation} title="Upgrade to Premium">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.deepPlum} />
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper navigation={navigation} title="Upgrade to Premium">
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Unlock Premium Features</Text>
          <Text style={styles.headerSubtitle}>
            Enhance your emotional journey with premium features
          </Text>
        </View>

        <View style={styles.planSelector}>
          {offerings?.availablePackages.map((pack) => (
            <TouchableOpacity
              key={pack.identifier}
              style={[
                styles.planOption,
                selectedPackage?.identifier === pack.identifier && styles.selectedPlan,
              ]}
              onPress={() => setSelectedPackage(pack)}
            >
              <Text style={[
                styles.planTitle,
                selectedPackage?.identifier === pack.identifier && styles.selectedPlanText,
              ]}>{pack.product.title}</Text>
              <Text style={[
                styles.planPrice,
                selectedPackage?.identifier === pack.identifier && styles.selectedPlanText,
              ]}>{pack.product.priceString}</Text>
              <Text style={styles.planPeriod}>{pack.packageType === 'ANNUAL' ? 'per year' : 'per month'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Premium Features</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.upgradeButton, purchasing && styles.disabledButton]}
          onPress={handlePurchase}
          disabled={purchasing}
        >
          {purchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.upgradeButtonText}>
              {selectedPackage ? `Upgrade for ${selectedPackage.product.priceString}` : 'Select a Plan'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRestore} disabled={purchasing}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Cancel anytime. Subscription auto-renews unless cancelled.
        </Text>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.deepPlum,
    marginBottom: 10,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(95, 75, 139, 0.7)',
    textAlign: 'center',
  },
  planSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    flexWrap: 'wrap',
  },
  planOption: {
    flex: 1,
    minWidth: '45%',
    margin: 8,
    padding: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(147, 112, 219, 0.1)',
    alignItems: 'center',
  },
  selectedPlan: {
    backgroundColor: COLORS.deepPlum,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.deepPlum,
    marginBottom: 5,
    textAlign: 'center',
  },
  selectedPlanText: {
    color: '#fff',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.deepPlum,
    marginBottom: 5,
  },
  planPeriod: {
    fontSize: 12,
    color: 'rgba(95, 75, 139, 0.7)',
  },
  featuresContainer: {
    padding: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.deepPlum,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.deepPlum,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(95, 75, 139, 0.7)',
  },
  upgradeButton: {
    backgroundColor: COLORS.deepPlum,
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  restoreText: {
    textAlign: 'center',
    color: COLORS.deepPlum,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(95, 75, 139, 0.7)',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
});

export default UpgradeScreen;