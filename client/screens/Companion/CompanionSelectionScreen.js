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
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import BASE_URL from '../../context/Api';
import { useAuth } from '../../context/AuthContext';
import analyticsService from '../../services/analyticsService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

const CompanionSelectionScreen = ({ navigation, route }) => {
  const { user, refreshUserData } = useAuth();
  const [companions, setCompanions] = useState([]);
  const [filteredCompanions, setFilteredCompanions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likedCompanions, setLikedCompanions] = useState([]);
  const [expandedBackstory, setExpandedBackstory] = useState(null);
  
  // Determine view mode from route params or default to swipe for initial selection
  const isAddingCompanion = route?.params?.mode === 'add';
  const initialViewMode = route?.params?.viewMode || 'swipe';
  const [viewMode, setViewMode] = useState(initialViewMode);
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gender: '',
    country: '',
    ageMin: '',
    ageMax: '',
  });
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  
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

  // Check if user is subscribed
  const isSubscribed = () => {
    const tier = user?.subscription_tier || 'free';
    const role = user?.role || 'user';
    return (tier === 'basic' || tier === 'premium' || role === 'premium');
  };

  useEffect(() => {
    analyticsService.trackScreenView('CompanionSelection', 'CompanionSelectionScreen');
    
    // If adding companion, fetch subscription status and all companions
    if (isAddingCompanion) {
      fetchSubscriptionStatus();
      fetchAllCompanions();
      setViewMode('grid');
    } else {
      // Initial selection - always use swipe view with AI matching
      fetchCompanions();
      setViewMode('swipe');
    }
  }, [isAddingCompanion]);

  useEffect(() => {
    if (isAddingCompanion && companions.length > 0) {
      applyFilters();
    }
  }, [filters, searchTerm, companions, isAddingCompanion]);

  const fetchSubscriptionStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const fetchAllCompanions = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      let allCompanions = [];
      let page = 1;
      let hasMore = true;

      // Fetch all pages
      while (hasMore) {
        const response = await fetch(`${BASE_URL}/companions?page=${page}&limit=50`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          allCompanions = [...allCompanions, ...(data.data || [])];
          hasMore = data.pagination?.hasNext || false;
          page++;
        } else {
          hasMore = false;
        }
      }

      console.log(`Loaded ${allCompanions.length} companions`);
      setCompanions(allCompanions);
      setFilteredCompanions(allCompanions);
    } catch (error) {
      console.error('Error fetching companions:', error);
      Alert.alert('Error', 'Failed to load companions');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...companions];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name?.toLowerCase().includes(term) ||
        c.country?.toLowerCase().includes(term) ||
        c.personality?.toLowerCase().includes(term) ||
        c.backstory?.toLowerCase().includes(term)
      );
    }

    // Gender filter
    if (filters.gender) {
      filtered = filtered.filter(c => c.gender?.toLowerCase() === filters.gender.toLowerCase());
    }

    // Country filter
    if (filters.country) {
      filtered = filtered.filter(c => c.country?.toLowerCase().includes(filters.country.toLowerCase()));
    }

    // Age filter
    if (filters.ageMin) {
      filtered = filtered.filter(c => c.age >= parseInt(filters.ageMin));
    }
    if (filters.ageMax) {
      filtered = filtered.filter(c => c.age <= parseInt(filters.ageMax));
    }

    setFilteredCompanions(filtered);
  };

  const resetFilters = () => {
    setFilters({
      gender: '',
      country: '',
      ageMin: '',
      ageMax: '',
    });
    setSearchTerm('');
  };

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
        forceSwipe('right');
      } else if (gestureState.dx < -SWIPE_THRESHOLD) {
        forceSwipe('left');
      } else {
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
      return;
    }
    
    analyticsService.trackCompanionSwipe(
      direction === 'right' ? 'like' : 'pass',
      companion.id,
      companion.name
    );
    
    setExpandedBackstory(null);
    
    if (direction === 'right') {
      setLikedCompanions([...likedCompanions, companion]);
      await handleSelectCompanion(companion);
    } else {
      const nextIndex = (currentIndex + 1) % companions.length;
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
        const uniqueCompanions = (data.companions || []).filter((companion, index, self) => 
          index === self.findIndex(c => c.id === companion.id)
        );
        setCompanions(uniqueCompanions);
      } else {
        const errorData = await response.json();
        Alert.alert('AI Matching Failed', errorData.error || errorData.message || 'Unknown error');
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
      analyticsService.trackCompanionSelect(companion.id, companion.name, companion.gender);
      
      const token = await AsyncStorage.getItem('authToken');
      
      // If adding companion, check limits first
      if (isAddingCompanion && subscriptionStatus) {
        const currentCount = subscriptionStatus.limits?.companions?.current || 0;
        const limit = subscriptionStatus.limits?.companions?.limit;
        const tier = subscriptionStatus.subscription?.tier;

        // Premium has unlimited, so skip check
        if (tier !== 'premium' && limit !== null && currentCount >= limit) {
          Alert.alert(
            'Companion Limit Reached',
            `You have reached your companion limit (${limit}). ${tier === 'basic' ? 'Upgrade to Premium for unlimited companions.' : 'Upgrade to add more companions.'}`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Upgrade', onPress: () => navigation.navigate('Upgrade') }
            ]
          );
          return;
        }
      }
      
      // Check companion limit before selecting (backend will also check)
      const selectResponse = await fetch(`${BASE_URL}/matching/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          companion_id: companion.id,
          is_primary: !isAddingCompanion, // Only set as primary for initial selection
        }),
      });

      if (!selectResponse.ok) {
        const errorData = await selectResponse.json();
        if (errorData.upgradeRequired) {
          Alert.alert(
            'Companion Limit Reached',
            errorData.message || 'You have reached your companion limit. Upgrade to add more companions.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Upgrade', onPress: () => navigation.navigate('Upgrade') }
            ]
          );
        } else {
          Alert.alert('Error', errorData.error || 'Failed to select companion');
        }
        return;
      }

      const selectData = await selectResponse.json();
      console.log('Companion selection success:', selectData);
      
      // Create or get conversation
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
        }
      } catch (convError) {
        console.error('Conversation creation error:', convError);
      }

      // If adding companion, refresh subscription status and stay on grid view
      if (isAddingCompanion) {
        await fetchSubscriptionStatus();
        Alert.alert(
          'Success',
          `${companion.name} added successfully!`,
          [
            { 
              text: 'Add More', 
              onPress: () => {
                // Stay on grid view to add more
              }
            },
            { 
              text: 'Done', 
              onPress: () => navigation.goBack()
            }
          ]
        );
        // Refresh user data
        await refreshUserData();
      } else {
        // Initial selection - navigate to conversation
        if (conversationId) {
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
          navigation.navigate('Chats');
        }

        // Refresh user data
        setTimeout(async () => {
          await refreshUserData();
        }, 500);
      }
    } catch (error) {
      console.error('Companion selection error:', error);
      Alert.alert('Error', 'Something went wrong while selecting companion');
    }
  };

  const renderGridItem = ({ item: companion }) => {
    const imageUrl = companion.profile_image_url 
      ? `${BASE_URL.replace('/api', '')}${companion.profile_image_url}` 
      : 'https://via.placeholder.com/200x300';

    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => handleSelectCompanion(companion)}
      >
        <Image source={{ uri: imageUrl }} style={styles.gridImage} resizeMode="cover" />
        <View style={styles.gridOverlay} />
        <View style={styles.gridContent}>
          <Text style={styles.gridName}>{companion.name}</Text>
          <Text style={styles.gridDetails}>{companion.age} • {companion.gender}</Text>
          <Text style={styles.gridLocation}>{companion.country}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCard = (companion, index, isTop) => {
    if (index < currentIndex) return null;
    
    const matchPercentage = companion.match_score 
      ? Math.round(companion.match_score) 
      : companion.match_percentage 
      ? Math.round(companion.match_percentage)
      : Math.max(75, 95 - (index - currentIndex) * 5);
    
    if (index === currentIndex) {
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
          <View style={styles.cardTouchArea} {...panResponder.panHandlers}>
            <Image
              source={{ uri: companion.profile_image_url ? `${BASE_URL.replace('/api', '')}${companion.profile_image_url}` : 'https://via.placeholder.com/400x600' }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            
            <View style={styles.gradientOverlay} />
            
            <View style={styles.matchBadge}>
              <Text style={styles.matchBadgeText}>{matchPercentage}% Match</Text>
            </View>
            
            <View style={styles.cardContent}>
              <Text style={styles.cardName}>{companion.name}</Text>
              <Text style={styles.cardAge}>{companion.age} • {companion.gender} • {companion.country}</Text>
              <Text style={styles.cardPersonality}>{companion.personality}</Text>
              
              <Text style={styles.cardBrief} numberOfLines={2}>
                {companion.backstory}
              </Text>
              
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
    
    return null;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.deepPlum} />
          <Text style={styles.loadingText}>
            {isAddingCompanion ? 'Loading companions...' : 'Finding your perfect matches...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Grid view for adding companions (only shown when adding, not initial selection)
  if (isAddingCompanion && viewMode === 'grid') {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header with search and filters */}
        <View style={styles.gridHeader}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.dustyPink} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search companions..."
              placeholderTextColor={COLORS.dustyPink}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.dustyPink} />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <Ionicons name="filter" size={20} color={COLORS.deepPlum} />
              <Text style={styles.filterButtonText}>Filters</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.viewToggle}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={20} color={COLORS.deepPlum} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscription info */}
        {subscriptionStatus && (
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionText}>
              {subscriptionStatus.limits?.companions?.remaining !== null
                ? `${subscriptionStatus.limits.companions.remaining} companions remaining`
                : 'Unlimited companions'}
            </Text>
          </View>
        )}

        {/* Companions grid */}
        <FlatList
          data={filteredCompanions}
          renderItem={renderGridItem}
          keyExtractor={(item) => `companion-${item.id}`}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No companions found</Text>
              <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* Filters Modal */}
        <Modal
          visible={showFilters}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowFilters(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter Companions</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <Ionicons name="close" size={24} color={COLORS.deepPlum} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Gender</Text>
                  <View style={styles.filterOptions}>
                    {['', 'Male', 'Female', 'Non-binary'].map((gender) => (
                      <TouchableOpacity
                        key={gender}
                        style={[
                          styles.filterOption,
                          filters.gender === gender && styles.filterOptionActive
                        ]}
                        onPress={() => setFilters({ ...filters, gender })}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          filters.gender === gender && styles.filterOptionTextActive
                        ]}>
                          {gender || 'All'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Country</Text>
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Enter country"
                    value={filters.country}
                    onChangeText={(text) => setFilters({ ...filters, country: text })}
                  />
                </View>

                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Age Range</Text>
                  <View style={styles.ageRangeContainer}>
                    <TextInput
                      style={styles.ageInput}
                      placeholder="Min"
                      keyboardType="numeric"
                      value={filters.ageMin}
                      onChangeText={(text) => setFilters({ ...filters, ageMin: text })}
                    />
                    <Text style={styles.ageSeparator}>-</Text>
                    <TextInput
                      style={styles.ageInput}
                      placeholder="Max"
                      keyboardType="numeric"
                      value={filters.ageMax}
                      onChangeText={(text) => setFilters({ ...filters, ageMax: text })}
                    />
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.resetFiltersButton}
                    onPress={resetFilters}
                  >
                    <Text style={styles.resetFiltersText}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.applyFiltersButton}
                    onPress={() => setShowFilters(false)}
                  >
                    <Text style={styles.applyFiltersText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Swipe view for initial companion selection (everyone uses this)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your Match</Text>
        <Text style={styles.headerSubtitle}>Swipe right to like, left to pass</Text>
      </View>

      <View style={styles.cardsContainer}>
        {companions[currentIndex] && renderCard(companions[currentIndex], currentIndex, true)}
      </View>

      <View style={styles.actionButtons} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.passButton}
          onPress={(e) => {
            e.stopPropagation();
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

// ... (keeping all the existing styles and adding new ones)
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
    marginTop: 10,
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
  switchViewButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.softRose,
    borderRadius: 20,
    alignSelf: 'center',
  },
  switchViewText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // Grid view styles
  gridHeader: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dustyPink,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.whiteSmoke,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.deepPlum,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.whiteSmoke,
    borderRadius: 20,
  },
  filterButtonText: {
    marginLeft: 5,
    color: COLORS.deepPlum,
    fontWeight: '600',
  },
  viewToggle: {
    padding: 8,
  },
  subscriptionInfo: {
    padding: 10,
    backgroundColor: COLORS.softRose,
    alignItems: 'center',
  },
  subscriptionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  gridContainer: {
    padding: 10,
  },
  gridItem: {
    flex: 1,
    margin: 5,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    aspectRatio: 0.7,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  gridContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  gridName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  gridDetails: {
    fontSize: 14,
    color: COLORS.softRose,
    marginBottom: 2,
  },
  gridLocation: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.dustyPink,
    marginBottom: 20,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.softRose,
    borderRadius: 20,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.whiteSmoke,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.deepPlum,
  },
  modalBody: {
    padding: 20,
  },
  filterGroup: {
    marginBottom: 25,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.deepPlum,
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.whiteSmoke,
    marginRight: 10,
    marginBottom: 10,
  },
  filterOptionActive: {
    backgroundColor: COLORS.softRose,
  },
  filterOptionText: {
    color: COLORS.deepPlum,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: 'white',
  },
  filterInput: {
    borderWidth: 1,
    borderColor: COLORS.dustyPink,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.deepPlum,
  },
  ageRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.dustyPink,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.deepPlum,
  },
  ageSeparator: {
    marginHorizontal: 10,
    fontSize: 18,
    color: COLORS.deepPlum,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resetFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: COLORS.whiteSmoke,
    alignItems: 'center',
    marginRight: 10,
  },
  resetFiltersText: {
    color: COLORS.deepPlum,
    fontWeight: '600',
  },
  applyFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: COLORS.softRose,
    alignItems: 'center',
  },
  applyFiltersText: {
    color: 'white',
    fontWeight: '600',
  },
  // Existing swipe view styles
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
    zIndex: 10,
  },
  cardTouchArea: {
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
  cardBrief: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    marginBottom: 12,
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
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 2 },
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
