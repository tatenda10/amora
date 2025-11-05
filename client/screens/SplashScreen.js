import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { COLORS } from '../constants/colors';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  // Remove the manual navigation - let AuthContext handle routing
  // The AppNavigator will automatically route based on authentication state
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.deepPlum} />
      
      {/* Background with gradient effect */}
      <View style={styles.background}>
        <View style={styles.gradientOverlay} />
      </View>

      {/* Logo and content */}
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.appName}>Amora</Text>
          <Text style={styles.tagline}>Your AI Companion</Text>
          <Text style={styles.subtitle}>Meaningful conversations await</Text>
        </View>

        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot} />
          <View style={styles.loadingDot} />
          <View style={styles.loadingDot} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepPlum,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.deepPlum,
  },
  gradientOverlay: {
    flex: 1,
    backgroundColor: 'rgba(147, 112, 219, 0.1)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 40,
    shadowColor: COLORS.softRose,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  logo: {
    width: 120,
    height: 120,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.whiteSmoke,
    marginBottom: 8,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.lavenderGray,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.lavenderGray,
    opacity: 0.8,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.softRose,
    marginHorizontal: 4,
    opacity: 0.7,
  },
});

export default SplashScreen;
