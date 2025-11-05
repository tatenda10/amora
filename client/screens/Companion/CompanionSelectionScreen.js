import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Animated,
  PanResponder,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/colors';
import BASE_URL from '../../context/Api';
import { useAuth } from '../../context/AuthContext';
import analyticsService from '../../services/analyticsService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

const CompanionSelectionScreen = ({ navigation }) => {
  const { refreshUserData } = useAuth();
  const [companions, setCompanions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likedCompanions, setLikedCompanions] = useState([]);
  const [expandedBackstory, setExpandedBackstory] = useState(null);
  
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });
  
  const likeOpacity = position.x.interpolate({
    inputRange: [0, screenWidth / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  const passOpacity = position.x.interpolate({
    inputRange: [-screenWidth / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    // Track screen view
    analyticsService.trackScreenView('CompanionSelection', 'CompanionSelectionScreen');
    fetchCompanions();
  }, []);

  // Reset expanded backstory when current index changes
  useEffect(() => {
    setExpandedBackstory(null);
  }, [currentIndex]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      position.setValue({ x: gestureState.dx, y: gestureState.dy });
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > SWIPE_THRESHOLD) {
        // Swipe right - Like
        forceSwipe('right');
      } else if (gestureState.dx < -SWIPE_THRESHOLD) {
        // Swipe left - Pass
        forceSwipe('left');
      } else {
        // Return to center
        resetPosition();
      }
    },
  });

  const forceSwipe = (direction) => {
    const x = direction === 'right' ? screenWidth : -screenWidth;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const onSwipeComplete = async (direction) => {
    const companion = companions[currentIndex];
    if (!companion) {
      console.log('[SWIPE] No companion at currentIndex:', currentIndex);
      return;
    }
    
    // Track swipe action
    analyticsService.trackCompanionSwipe(
      direction === 'right' ? 'like' : 'pass',
      companion.id,
      companion.name
    );
    
    // Close any open backstory when swiping
    setExpandedBackstory(null);
    
    if (direction === 'right') {
      // User liked the companion - automatically select and navigate
      setLikedCompanions([...likedCompanions, companion]);
      await handleSelectCompanion(companion);
    } else {
      // User passed - just move to next card
      const nextIndex = (currentIndex + 1) % companions.length;
      console.log('[SWIPE] Moving from index', currentIndex, 'to', nextIndex);
      setCurrentIndex(nextIndex);
      position.setValue({ x: 0, y: 0 });
    }
  };

  const fetchCompanions = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/matching/matches`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('AI Matched Companions:', data.companions);
        
        // Deduplicate companions by ID to prevent duplicates
        const uniqueCompanions = (data.companions || []).filter((companion, index, self) => 
          index === self.findIndex(c => c.id === companion.id)
        );
        
        console.log(`Loaded ${uniqueCompanions.length} unique companions (was ${(data.companions || []).length})`);
        setCompanions(uniqueCompanions);
      } else {
        const errorData = await response.json();
        console.error('=== AI MATCHING FAILED ===');
        console.error('Status:', response.status);
        console.error('Status Text:', response.statusText);
        console.error('Error Response:', errorData);
        console.error('Error Details:', errorData.error);
        console.error('Error Message:', errorData.message);
        console.error('Full Error:', errorData);
        console.error('=== END AI MATCHING ERROR ===');
        
        Alert.alert(
          'AI Matching Failed', 
          `Error: ${errorData.error || errorData.message || 'Unknown error'}\n\nStatus: ${response.status}\n\nCheck console for full details.`
        );
        return;
      }
    } catch (error) {
      console.error('Companion fetch error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCompanion = async (companion) => {
    try {
      // Track companion selection
      analyticsService.trackCompanionSelect(
        companion.id,
        companion.name,
        companion.gender
      );
      
      const token = await AsyncStorage.getItem('authToken');
      
      // Step 1: Select the companion
      const selectResponse = await fetch(`${BASE_URL}/matching/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          companion_id: companion.id,
          is_primary: true,
        }),
      });

      if (!selectResponse.ok) {
        const errorData = await selectResponse.json();
        Alert.alert('Error', errorData.error || 'Failed to select companion');
        return;
      }

      const selectData = await selectResponse.json();
      console.log('Companion selection success:', selectData);
      
      // Step 2: Create or get conversation
      let conversationId;
      try {
        const conversationResponse = await fetch(`${BASE_URL}/conversations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            companion_id: companion.id,
          }),
        });

        if (conversationResponse.ok) {
          const conversationData = await conversationResponse.json();
          conversationId = conversationData.conversation?.id || conversationData.conversation_id;
          console.log('Conversation created/found:', conversationId);
        }
      } catch (convError) {
        console.error('Conversation creation error:', convError);
        // Continue anyway - we can still navigate
      }

      // Step 3: Navigate to conversation FIRST
      if (conversationId) {
        console.log('Navigating to Chat with conversationId:', conversationId);
        // Navigate to the chat screen with the conversation
        navigation.navigate('Chat', {
          conversationId: conversationId,
          companion: {
            id: companion.id,
            name: companion.name,
            profile_image_url: companion.profile_image_url,
            personality: companion.personality,
          }
        });
      } else {
        console.log('No conversationId, navigating to Chats list');
        navigation.navigate('Chats');
      }

      // Step 4: Refresh user data after a short delay to allow navigation to complete
      // This will trigger the AppNavigator to switch to AuthedDrawer
      // The delay ensures the navigation completes before the navigator structure changes
      setTimeout(async () => {
        const updatedUser = await refreshUserData();
        if (updatedUser) {
          console.log('Updated user data after companion selection:', updatedUser);
          
          // If we have a conversationId, ensure we're on the Chat screen
          // The navigator structure may have changed, so navigate again if needed
          if (conversationId && navigation.isFocused()) {
            navigation.navigate('Chat', {
              conversationId: conversationId,
              companion: {
                id: companion.id,
                name: companion.name,
                profile_image_url: companion.profile_image_url,
                personality: companion.personality,
              }
            });
          }
        } else {
          console.error('Failed to refresh user data');
        }
      }, 500);
    } catch (error) {
      console.error('Companion selection error:', error);
      Alert.alert('Error', 'Something went wrong while selecting companion');
    }
  };

  const renderCard = (companion, index, isTop) => {
    // Only render cards that are at or after currentIndex (don't show swiped cards)
    if (index < currentIndex) return null;
    
    // Calculate match percentage if available (match_score is typically 0-100)
    // If not available, calculate a default based on position (earlier = higher match)
    const matchPercentage = companion.match_score 
      ? Math.round(companion.match_score) 
      : companion.match_percentage 
      ? Math.round(companion.match_percentage)
      : Math.max(75, 95 - (index - currentIndex) * 5); // Default: 75-95% based on position
    
    if (index === currentIndex) {
      console.log('[ACTIVE CARD] Rendering active card - Index:', index, 'Companion:', companion.name, 'ID:', companion.id);
      return (
        <Animated.View
          key={`companion-${companion.id}-${index}`}
          style={[
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate },
              ],
            },
          ]}
        >
          <View
            style={styles.cardTouchArea}
            {...panResponder.panHandlers}
          >
          <Image
            source={{ uri: companion.profile_image_url ? `${BASE_URL.replace('/api', '')}${companion.profile_image_url}` : 'https://via.placeholder.com/400x600' }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          
          {/* Gradient overlay */}
          <View style={styles.gradientOverlay} />
          
          {/* Match percentage badge - always show */}
          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>{matchPercentage}% Match</Text>
          </View>
          
          {/* Backstory overlay removed - will be implemented manually later */}
          
          {/* Card content */}
          <View style={styles.cardContent}>
            <Text style={styles.cardName}>{companion.name}</Text>
            <Text style={styles.cardAge}>{companion.age} • {companion.gender} • {companion.country}</Text>
            <Text style={styles.cardPersonality}>{companion.personality}</Text>
            
            {/* Brief Description */}
            <Text style={styles.cardBrief} numberOfLines={2}>
              {companion.backstory}
            </Text>
            
            {/* Interests */}
            {companion.interests && companion.interests.length > 0 && (
              <View style={styles.interestsContainer}>
                {companion.interests.slice(0, 3).map((interest, idx) => (
                  <View key={`interest-${companion.id}-${idx}`} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            )}
            
          </View>
          
          {/* Swipe indicators */}
          <Animated.View style={[styles.likeIndicator, { opacity: likeOpacity }]}>
            <Text style={styles.likeText}>LIKE</Text>
          </Animated.View>
          
          <Animated.View style={[styles.passIndicator, { opacity: passOpacity }]}>
            <Text style={styles.passText}>PASS</Text>
          </Animated.View>
          </View>
        </Animated.View>
      );
    }
    
    // Background cards - removed click functionality, will be implemented manually later
    if (index > currentIndex && index === currentIndex + 1) {
      return null;
    }
    
    // Don't render cards that are too far ahead
    return null;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Finding your perfect matches...</Text>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your Match</Text>
        <Text style={styles.headerSubtitle}>
          Swipe right to like, left to pass
        </Text>
      </View>

      {/* Cards */}
      <View style={styles.cardsContainer}>
        {/* Render active card */}
        {companions[currentIndex] && renderCard(companions[currentIndex], currentIndex, true)}
      </View>

      {/* Action buttons */}
      <View style={styles.actionButtons} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.passButton}
          onPress={(e) => {
            e.stopPropagation();
            console.log('[PASS BUTTON] Clicked, currentIndex:', currentIndex);
            forceSwipe('left');
          }}
          pointerEvents="auto"
        >
          <Text style={styles.passButtonText}>✕</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.likeButton}
          onPress={(e) => {
            e.stopPropagation();
            console.log('[LIKE BUTTON] Clicked, currentIndex:', currentIndex);
            forceSwipe('right');
          }}
          pointerEvents="auto"
        >
          <Text style={styles.likeButtonText}>♥</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.whiteSmoke,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.deepPlum,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.whiteSmoke,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.deepPlum,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.dustyPink,
    textAlign: 'center',
    marginTop: 5,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    position: 'absolute',
    width: screenWidth - 40,
    height: screenHeight * 0.7,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
    zIndex: 10,
  },
  backgroundCard: {
    zIndex: 15, // Higher than active card to receive touches
  },
  backgroundCardContainer: {
    position: 'absolute',
    width: screenWidth - 40,
    height: screenHeight * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backstoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
  },
  backstoryOverlayInner: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
  },
  backstoryTrigger: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 16,
  },
  backstoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  backstoryScroll: {
    flex: 1,
    maxHeight: screenHeight * 0.5,
  },
  backstoryText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
    textAlign: 'left',
  },
  closeBackstoryButton: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.softRose,
    borderRadius: 25,
    alignItems: 'center',
  },
  closeBackstoryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewStoryButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  viewStoryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTouchArea: {
    width: '100%',
    height: '100%',
  },
  cardInner: {
    width: '100%',
    height: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
  },
  cardName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  cardAge: {
    fontSize: 18,
    color: COLORS.softRose,
    marginBottom: 10,
  },
  cardPersonality: {
    fontSize: 16,
    color: 'white',
    marginBottom: 15,
    fontWeight: '500',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  interestTag: {
    backgroundColor: COLORS.deepPlum,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  cardBrief: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    marginBottom: 12,
  },
  likeIndicator: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: COLORS.softRose,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    transform: [{ rotate: '15deg' }],
  },
  likeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  passIndicator: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: COLORS.dustyPink,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    transform: [{ rotate: '-15deg' }],
  },
  passText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  matchBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: COLORS.softRose,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 10,
  },
  matchBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 50,
    paddingVertical: 30,
    backgroundColor: COLORS.whiteSmoke,
    zIndex: 100,
    elevation: 10,
  },
  passButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.dustyPink,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  passButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.softRose,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  likeButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CompanionSelectionScreen;
