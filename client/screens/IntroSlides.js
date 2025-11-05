import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ImageBackground, Animated } from 'react-native';
import { COLORS } from '../constants/colors';

// Import images
import introSlidesImage from '../assets/introslides.jpg';
import introSlides2Image from '../assets/introslides2.jpg';
import introSlides3Image from '../assets/introslides3.jpg';

const { width, height } = Dimensions.get('window');

// Background images array with corresponding text content
const backgroundContent = [
  {
    image: introSlidesImage,
    title: "Talk to someone who understands you.",
    subtitle: "Find comfort in meaningful conversations",
  },
  {
    image: introSlides2Image,
    title: "Pick a companion that resonates with your soul.",
    subtitle: "Each companion has their unique personality",
  },
  {
    image: introSlides3Image,
    title: "Private. Safe. Real-feeling conversations.",
    subtitle: "Your safe space for emotional connection",
  },
];

const slides = [
  {
    id: 1,
    title: "Talk to someone who understands you.",
    subtitle: "Find comfort in meaningful conversations",
  },
  {
    id: 2,
    title: "Pick a companion that resonates with your soul.",
    subtitle: "Each companion has their unique personality",
  },
  {
    id: 3,
    title: "Private. Safe. Real-feeling conversations.",
    subtitle: "Your safe space for emotional connection",
  },
];

const IntroSlides = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const fadeAnim = new Animated.Value(1);

  // Cycle through background images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentBackgroundIndex((prevIndex) => 
        (prevIndex + 1) % backgroundContent.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ImageBackground 
        source={backgroundContent[currentBackgroundIndex].image}
        style={styles.container}
      >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.slideContainer}>
            <Text style={styles.title}>{backgroundContent[currentBackgroundIndex].title}</Text>
            <Text style={styles.subtitle}>{backgroundContent[currentBackgroundIndex].subtitle}</Text>
          </View>
          
          <View style={styles.bottomContainer}>
            <View style={styles.pagination}>
              {backgroundContent.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentBackgroundIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>

            <View style={{ gap: 12 }}>
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => navigation.navigate('Signup')}
              >
                <Text style={styles.buttonText}>Create Account</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, { backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.softRose }]} 
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={[styles.buttonText, { color: COLORS.whiteSmoke }]}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      </ImageBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(95, 75, 139, 0.75)', // Deep Plum with opacity
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: height * 0.1,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.whiteSmoke,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: COLORS.lavenderGray,
    opacity: 0.9,
  },
  bottomContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.lavenderGray,
    marginHorizontal: 5,
    opacity: 0.5,
  },
  paginationDotActive: {
    backgroundColor: COLORS.softRose,
    width: 24,
    opacity: 1,
  },
  button: {
    backgroundColor: COLORS.softRose,
    paddingHorizontal: width * 0.15,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 20,
    shadowColor: COLORS.deepPlum,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: COLORS.deepPlum,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default IntroSlides; 