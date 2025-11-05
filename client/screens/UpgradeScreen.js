import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../constants/colors';
import SafeAreaWrapper from '../components/Layout/SafeAreaWrapper';

const UpgradeScreen = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  const plans = {
    monthly: {
      price: '$9.99',
      period: 'month',
      savings: '',
    },
    yearly: {
      price: '$79.99',
      period: 'year',
      savings: 'Save 33%',
    },
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
          <TouchableOpacity
            style={[
              styles.planOption,
              selectedPlan === 'monthly' && styles.selectedPlan,
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <Text style={[
              styles.planTitle,
              selectedPlan === 'monthly' && styles.selectedPlanText,
            ]}>Monthly</Text>
            <Text style={[
              styles.planPrice,
              selectedPlan === 'monthly' && styles.selectedPlanText,
            ]}>{plans.monthly.price}</Text>
            <Text style={styles.planPeriod}>per {plans.monthly.period}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planOption,
              selectedPlan === 'yearly' && styles.selectedPlan,
            ]}
            onPress={() => setSelectedPlan('yearly')}
          >
            <Text style={[
              styles.planTitle,
              selectedPlan === 'yearly' && styles.selectedPlanText,
            ]}>Yearly</Text>
            <Text style={[
              styles.planPrice,
              selectedPlan === 'yearly' && styles.selectedPlanText,
            ]}>{plans.yearly.price}</Text>
            <Text style={styles.planPeriod}>per {plans.yearly.period}</Text>
            {plans.yearly.savings && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>{plans.yearly.savings}</Text>
              </View>
            )}
          </TouchableOpacity>
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

        <TouchableOpacity style={styles.upgradeButton}>
          <Text style={styles.upgradeButtonText}>
            Upgrade Now - {plans[selectedPlan].price}
          </Text>
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
  },
  planOption: {
    flex: 1,
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
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.deepPlum,
    marginBottom: 5,
  },
  selectedPlanText: {
    color: '#fff',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.deepPlum,
  },
  planPeriod: {
    fontSize: 14,
    color: 'rgba(95, 75, 139, 0.7)',
  },
  savingsBadge: {
    backgroundColor: COLORS.softRose,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  savingsText: {
    color: COLORS.deepPlum,
    fontSize: 12,
    fontWeight: '600',
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
  upgradeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(95, 75, 139, 0.7)',
    marginBottom: 20,
  },
});

export default UpgradeScreen; 