import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/colors';
import BASE_URL from '../../context/Api';
import SafeAreaWrapper from '../../components/Layout/SafeAreaWrapper';
import { useAuth } from '../../context/AuthContext';

const OnboardingScreen = ({ navigation }) => {
  const { refreshUserData } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showPartnerGenderModal, setShowPartnerGenderModal] = useState(false);
  const [showPartnerCountryModal, setShowPartnerCountryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [partnerCountrySearchQuery, setPartnerCountrySearchQuery] = useState('');
  const [formData, setFormData] = useState({
    country: '',
    sex: '',
    age: '',
    interests: [],
    looking_for: {
      partner_gender: '',
      partner_age_min: '',
      partner_age_max: '',
      partner_country: '',
    },
    preferences: {
      ethnicity: [],
      personality_traits: [],
    },
  });

  const steps = [
    { 
      title: 'Basic Info', 
      subtitle: 'Tell us about yourself',
      icon: 'person-outline',
    },
    { 
      title: 'Interests', 
      subtitle: 'What do you enjoy?',
      icon: 'heart-outline',
    },
    { 
      title: 'Partner Preferences', 
      subtitle: 'What are you looking for?',
      icon: 'people-outline',
    },
    { 
      title: 'Physical Preferences', 
      subtitle: 'Any preferences?',
      icon: 'eye-outline',
    },
  ];

  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
    'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas',
    'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize',
    'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
    'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon',
    'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China',
    'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba',
    'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
    'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia',
    'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
    'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
    'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras',
    'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq',
    'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan',
    'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos',
    'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein',
    'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives',
    'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
    'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco',
    'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands',
    'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia',
    'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama',
    'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
    'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
    'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
    'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore',
    'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea',
    'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden',
    'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand',
    'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
    'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
    'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela',
    'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe', 'Other'
  ];

  const genders = [
    'Male',
    'Female', 
    'Non-binary',
    'Transgender',
    'Genderfluid',
    'Agender',
    'Bigender',
    'Demigender',
    'Genderqueer',
    'Two-spirit',
    'Prefer not to say',
    'Other'
  ];

  const interests = [
    'Music', 'Sports', 'Travel', 'Reading', 'Movies', 'Gaming',
    'Art', 'Photography', 'Cooking', 'Fitness', 'Dancing', 'Writing',
    'Technology', 'Nature', 'Animals', 'Fashion', 'Beauty', 'Other'
  ];

  const ethnicities = [
    'Any', 'African', 'Asian', 'Caucasian', 'Hispanic', 'Middle Eastern',
    'Mixed', 'Native American', 'Pacific Islander', 'Other'
  ];

  // Load existing user data when component mounts
  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          // Load existing data into form
          setFormData(prev => ({
            ...prev,
            country: data.profile.country || '',
            sex: data.profile.sex || '',
            age: data.profile.age || '',
            interests: data.profile.interests || [],
            looking_for: data.profile.looking_for || {
              partner_gender: '',
              partner_age_min: '',
              partner_age_max: '',
              partner_country: '',
            },
            preferences: data.profile.preferences || {
              ethnicity: [],
              personality_traits: [],
            },
          }));
        }
      }
    } catch (error) {
      console.log('Error loading existing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!countrySearchQuery.trim()) {
      return countries;
    }
    return countries.filter(country =>
      country.toLowerCase().includes(countrySearchQuery.toLowerCase())
    );
  }, [countrySearchQuery]);

  // Filter partner countries based on search query
  const filteredPartnerCountries = useMemo(() => {
    if (!partnerCountrySearchQuery.trim()) {
      return countries;
    }
    return countries.filter(country =>
      country.toLowerCase().includes(partnerCountrySearchQuery.toLowerCase())
    );
  }, [partnerCountrySearchQuery]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedData = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const toggleArrayItem = (parent, field, item) => {
    setFormData(prev => {
      const currentArray = prev[parent][field] || [];
      const newArray = currentArray.includes(item)
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item];
      return {
        ...prev,
        [parent]: { ...prev[parent], [field]: newArray }
      };
    });
  };

  const toggleInterest = (interest) => {
    setFormData(prev => {
      const currentInterests = prev.interests || [];
      const newInterests = currentInterests.includes(interest)
        ? currentInterests.filter(i => i !== interest)
        : [...currentInterests, interest];
      return {
        ...prev,
        interests: newInterests
      };
    });
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return formData.country && formData.sex && formData.age;
      case 1: // Interests
        return formData.interests && formData.interests.length > 0;
      case 2: // Partner Preferences
        return formData.looking_for.partner_gender && 
               formData.looking_for.partner_age_min && 
               formData.looking_for.partner_age_max;
      case 3: // Physical Preferences
        return true; // Optional step
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      Alert.alert(
        'Incomplete Information',
        'Please fill in all required fields before continuing.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      console.log('Submitting onboarding data:', formData);
      
      const response = await fetch(`${BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          onboarding_completed: true,
        }),
      });

      if (response.ok) {
        console.log('Profile saved successfully');
        
        // Refresh user data to update onboarding status
        const meResponse = await fetch(`${BASE_URL}/user/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        // Refresh user data in AuthContext
        const updatedUser = await refreshUserData();
        if (updatedUser) {
          console.log('Updated user data:', updatedUser);
          console.log('Onboarding completed:', updatedUser.onboarding_completed);
          console.log('Profile completed:', updatedUser.profile_completed);
          setShowSuccessModal(true);
        } else {
          console.error('Failed to refresh user data');
          Alert.alert('Warning', 'Profile saved but failed to refresh data');
        }
      } else {
        const errorData = await response.json();
        console.error('Profile save error:', errorData);
        Alert.alert('Error', 'Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      Alert.alert('Error', 'Something went wrong. Please check your connection and try again.');
    }
  };

  const renderBasicInfo = () => (
    <View className="p-5">
      <View className="mb-6">
        <Text className="text-lg font-bold mb-2" style={{ color: COLORS.deepPlum }}>Where are you from?</Text>
        <Text className="text-xs text-purple-400 mb-3">Select your country</Text>
          <TouchableOpacity
          className="bg-purple-50 rounded-lg px-4 py-3 border border-purple-200 flex-row justify-between items-center"
          onPress={() => setShowCountryModal(true)}
        >
          <Text className={`text-sm ${
            !formData.country ? 'text-purple-300' : 'text-purple-600'
          }`}>
            {formData.country || 'Select your country'}
            </Text>
          <Ionicons 
            name="chevron-down" 
            size={16} 
            color={COLORS.deepPlum} 
          />
          </TouchableOpacity>
      </View>

      <View className="mb-6">
        <Text className="text-lg font-bold mb-2" style={{ color: COLORS.deepPlum }}>What's your gender?</Text>
        <Text className="text-xs text-purple-400 mb-3">This helps us personalize your experience</Text>
          <TouchableOpacity
          className="bg-purple-50 rounded-lg px-4 py-3 border border-purple-200 flex-row justify-between items-center"
          onPress={() => setShowGenderModal(true)}
        >
          <Text className={`text-sm ${
            !formData.sex ? 'text-purple-300' : 'text-purple-600'
          }`}>
            {formData.sex || 'Select your gender'}
            </Text>
          <Ionicons 
            name="chevron-down" 
            size={16} 
            color={COLORS.deepPlum} 
          />
          </TouchableOpacity>
      </View>

      <View className="mb-6">
        <Text className="text-lg font-bold mb-2" style={{ color: COLORS.deepPlum }}>How old are you?</Text>
        <Text className="text-xs text-purple-400 mb-3">Enter your age</Text>
        <View className="bg-purple-50 rounded-lg px-4 py-3 border border-purple-200">
      <TextInput
            className="text-base text-center font-semibold"
            style={{ color: COLORS.deepPlum }}
        placeholder="Enter your age"
            placeholderTextColor="rgba(95, 75, 139, 0.5)"
        value={formData.age}
        onChangeText={(text) => updateFormData('age', text)}
        keyboardType="numeric"
      />
        </View>
      </View>
    </View>
  );

  const renderInterests = () => (
    <View className="p-5">
      <View className="mb-6">
        <Text className="text-lg font-bold mb-2" style={{ color: COLORS.deepPlum }}>What interests you?</Text>
        <Text className="text-xs text-purple-400 mb-3">Select all that apply</Text>
        <ScrollView className="max-h-72" showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap gap-2">
          {interests.map(interest => (
            <TouchableOpacity
              key={interest}
                className={`rounded-full px-4 py-2 border ${
                  formData.interests.includes(interest) 
                    ? 'bg-purple-600 border-purple-600' 
                    : 'bg-purple-50 border-purple-200'
                }`}
              onPress={() => toggleInterest(interest)}
            >
                <Text className={`text-xs font-medium ${
                  formData.interests.includes(interest) 
                    ? 'text-white' 
                    : 'text-purple-600'
                }`}>
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      </View>
    </View>
  );

  const renderPartnerPreferences = () => (
    <View className="p-5">
      <View className="mb-6">
        <Text className="text-lg font-bold mb-2" style={{ color: COLORS.deepPlum }}>Partner Gender</Text>
        <Text className="text-xs text-purple-400 mb-3">Who are you looking for?</Text>
          <TouchableOpacity
          className="bg-purple-50 rounded-lg px-4 py-3 border border-purple-200 flex-row justify-between items-center"
          onPress={() => setShowPartnerGenderModal(true)}
        >
          <Text className={`text-sm ${
            !formData.looking_for.partner_gender ? 'text-purple-300' : 'text-purple-600'
          }`}>
            {formData.looking_for.partner_gender || 'Select partner gender'}
            </Text>
          <Ionicons 
            name="chevron-down" 
            size={16} 
            color={COLORS.deepPlum} 
          />
          </TouchableOpacity>
      </View>

      <View className="mb-6">
        <Text className="text-lg font-bold mb-2" style={{ color: COLORS.deepPlum }}>Age Range</Text>
        <Text className="text-xs text-purple-400 mb-3">What age range interests you?</Text>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-xs text-purple-600 font-medium mb-2">Min Age</Text>
            <View className="bg-purple-50 rounded-lg px-4 py-3 border border-purple-200">
        <TextInput
                className="text-base text-center font-semibold"
                style={{ color: COLORS.deepPlum }}
                placeholder="18"
                placeholderTextColor="rgba(95, 75, 139, 0.5)"
          value={formData.looking_for.partner_age_min}
          onChangeText={(text) => updateNestedData('looking_for', 'partner_age_min', text)}
          keyboardType="numeric"
        />
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-purple-600 font-medium mb-2">Max Age</Text>
            <View className="bg-purple-50 rounded-lg px-4 py-3 border border-purple-200">
        <TextInput
                className="text-base text-center font-semibold"
                style={{ color: COLORS.deepPlum }}
                placeholder="65"
                placeholderTextColor="rgba(95, 75, 139, 0.5)"
          value={formData.looking_for.partner_age_max}
          onChangeText={(text) => updateNestedData('looking_for', 'partner_age_max', text)}
          keyboardType="numeric"
        />
            </View>
          </View>
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-lg font-bold mb-2" style={{ color: COLORS.deepPlum }}>Partner Country</Text>
        <Text className="text-xs text-purple-400 mb-3">Where should they be from?</Text>
          <TouchableOpacity
          className="bg-purple-50 rounded-lg px-4 py-3 border border-purple-200 flex-row justify-between items-center"
          onPress={() => setShowPartnerCountryModal(true)}
        >
          <Text className={`text-sm ${
            !formData.looking_for.partner_country ? 'text-purple-300' : 'text-purple-600'
          }`}>
            {formData.looking_for.partner_country || 'Select partner country'}
            </Text>
          <Ionicons 
            name="chevron-down" 
            size={16} 
            color={COLORS.deepPlum} 
          />
          </TouchableOpacity>
      </View>
    </View>
  );

  const renderPhysicalPreferences = () => (
    <View className="p-5">
      <View className="mb-6">
        <Text className="text-lg font-bold mb-2" style={{ color: COLORS.deepPlum }}>Ethnicity</Text>
        <Text className="text-xs text-purple-400 mb-3">Select preferences (optional)</Text>
        <ScrollView className="max-h-36" showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap gap-2">
          {ethnicities.map(ethnicity => (
            <TouchableOpacity
              key={ethnicity}
                className={`rounded-lg px-3 py-2 border ${
                  formData.preferences.ethnicity.includes(ethnicity) 
                    ? 'bg-purple-600 border-purple-600' 
                    : 'bg-purple-50 border-purple-200'
                }`}
              onPress={() => toggleArrayItem('preferences', 'ethnicity', ethnicity)}
            >
                <Text className={`text-xs font-medium ${
                  formData.preferences.ethnicity.includes(ethnicity) 
                    ? 'text-white' 
                    : 'text-purple-600'
                }`}>
                {ethnicity}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderBasicInfo();
      case 1: return renderInterests();
      case 2: return renderPartnerPreferences();
      case 3: return renderPhysicalPreferences();
      default: return renderBasicInfo();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaWrapper 
        navigation={navigation} 
        title="Loading..."
        hideBackButton
      >
        <View className="flex-1 bg-white justify-center items-center">
          <Text className="text-purple-600 text-lg">Loading your profile...</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper 
      navigation={navigation} 
      title={steps[currentStep].title}
      hideBackButton
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 30}
      >
        <View className="flex-1 bg-white">
          {/* Progress Header */}
          <View className="items-center px-5 py-4 border-b border-purple-100">
            <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mb-2">
              <Ionicons name={steps[currentStep].icon} size={20} color={COLORS.deepPlum} />
            </View>
            <Text className="text-sm text-purple-400 text-center mb-4">{steps[currentStep].subtitle}</Text>
            <View className="flex-row items-center">
            {steps.map((_, index) => (
              <View
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index <= currentStep ? 'bg-purple-600' : 'bg-purple-200'
                }`}
              />
            ))}
          </View>
        </View>

          {/* Content */}
          <ScrollView 
            className="flex-1" 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          >
          {renderCurrentStep()}
        </ScrollView>

          {/* Footer */}
          <View className="p-5 border-t border-purple-100">
            <View className="flex-row gap-3 mb-2">
              {currentStep > 0 && (
                <TouchableOpacity
                  className="bg-purple-100 rounded-lg py-3 px-6 items-center border border-purple-200"
                  onPress={handleBack}
                >
                  <Text className="text-purple-600 text-sm font-semibold">Back</Text>
                </TouchableOpacity>
              )}
          <TouchableOpacity
                className={`rounded-lg py-3 px-6 items-center ${
                  currentStep === 0 ? 'flex-1' : 'flex-1'
                }`}
                style={{ 
                  backgroundColor: validateCurrentStep() ? COLORS.softRose : '#D1D5DB',
                  opacity: validateCurrentStep() ? 1 : 0.6
                }}
            onPress={handleNext}
            disabled={!validateCurrentStep()}
          >
                <Text className="text-white text-sm font-semibold">
                  {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
            
            <Text className="text-center text-xs text-purple-300">
              Step {currentStep + 1} of {steps.length}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Country Selection Modal */}
      <Modal
        visible={showCountryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowCountryModal(false);
          setCountrySearchQuery('');
        }}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl max-h-[85%] min-h-[70%]">
            <View className="flex-row justify-between items-center px-5 py-4 border-b border-purple-100">
              <Text className="text-lg font-bold" style={{ color: COLORS.deepPlum }}>Select Country</Text>
              <TouchableOpacity
                className="p-1"
                onPress={() => {
                  setShowCountryModal(false);
                  setCountrySearchQuery('');
                }}
              >
                <Ionicons name="close" size={20} color={COLORS.deepPlum} />
              </TouchableOpacity>
            </View>
            
            {/* Search Input */}
            <View className="flex-row items-center bg-purple-50 rounded-lg mx-5 mb-2 px-4 py-2 border border-purple-200">
              <Ionicons name="search" size={16} color="rgba(95, 75, 139, 0.5)" className="mr-2" />
              <TextInput
                className="flex-1 text-sm"
                style={{ color: COLORS.deepPlum }}
                placeholder="Search countries..."
                placeholderTextColor="rgba(95, 75, 139, 0.5)"
                value={countrySearchQuery}
                onChangeText={setCountrySearchQuery}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {countrySearchQuery.length > 0 && (
                <TouchableOpacity
                  className="ml-2 p-1"
                  onPress={() => setCountrySearchQuery('')}
                >
                  <Ionicons name="close-circle" size={16} color="rgba(95, 75, 139, 0.5)" />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`flex-row justify-between items-center px-5 py-3 border-b border-purple-100 ${
                    formData.country === item ? 'bg-purple-50' : ''
                  }`}
                  onPress={() => {
                    updateFormData('country', item);
                    setShowCountryModal(false);
                    setCountrySearchQuery('');
                  }}
                >
                  <Text className={`text-sm ${
                    formData.country === item ? 'text-purple-600 font-semibold' : 'text-purple-600 font-medium'
                  }`}>
                    {item}
                  </Text>
                  {formData.country === item && (
                    <Ionicons name="checkmark" size={16} color={COLORS.deepPlum} />
                  )}
                </TouchableOpacity>
              )}
              className="flex-1"
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 50 }}
            />
          </View>
        </View>
      </Modal>

      {/* Gender Selection Modal */}
      <Modal
        visible={showGenderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl max-h-[85%] min-h-[70%]">
            <View className="flex-row justify-between items-center px-5 py-4 border-b border-purple-100">
              <Text className="text-lg font-bold" style={{ color: COLORS.deepPlum }}>Select Gender</Text>
              <TouchableOpacity
                className="p-1"
                onPress={() => setShowGenderModal(false)}
              >
                <Ionicons name="close" size={20} color={COLORS.deepPlum} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={genders}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`flex-row justify-between items-center px-5 py-3 border-b border-purple-100 ${
                    formData.sex === item ? 'bg-purple-50' : ''
                  }`}
                  onPress={() => {
                    updateFormData('sex', item);
                    setShowGenderModal(false);
                  }}
                >
                  <Text className={`text-sm ${
                    formData.sex === item ? 'text-purple-600 font-semibold' : 'text-purple-600 font-medium'
                  }`}>
                    {item}
                  </Text>
                  {formData.sex === item && (
                    <Ionicons name="checkmark" size={16} color={COLORS.deepPlum} />
                  )}
                </TouchableOpacity>
              )}
              className="flex-1"
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 50 }}
            />
          </View>
        </View>
      </Modal>

      {/* Partner Gender Selection Modal */}
      <Modal
        visible={showPartnerGenderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPartnerGenderModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl max-h-[85%] min-h-[70%]">
            <View className="flex-row justify-between items-center px-5 py-4 border-b border-purple-100">
              <Text className="text-lg font-bold" style={{ color: COLORS.deepPlum }}>Select Partner Gender</Text>
              <TouchableOpacity
                className="p-1"
                onPress={() => setShowPartnerGenderModal(false)}
              >
                <Ionicons name="close" size={20} color={COLORS.deepPlum} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={['Any', ...genders]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`flex-row justify-between items-center px-5 py-3 border-b border-purple-100 ${
                    formData.looking_for.partner_gender === item ? 'bg-purple-50' : ''
                  }`}
                  onPress={() => {
                    updateNestedData('looking_for', 'partner_gender', item);
                    setShowPartnerGenderModal(false);
                  }}
                >
                  <Text className={`text-sm ${
                    formData.looking_for.partner_gender === item ? 'text-purple-600 font-semibold' : 'text-purple-600 font-medium'
                  }`}>
                    {item}
                  </Text>
                  {formData.looking_for.partner_gender === item && (
                    <Ionicons name="checkmark" size={16} color={COLORS.deepPlum} />
                  )}
                </TouchableOpacity>
              )}
              className="flex-1"
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 50 }}
            />
          </View>
        </View>
      </Modal>

      {/* Partner Country Selection Modal */}
      <Modal
        visible={showPartnerCountryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowPartnerCountryModal(false);
          setPartnerCountrySearchQuery('');
        }}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl max-h-[85%] min-h-[70%]">
            <View className="flex-row justify-between items-center px-5 py-4 border-b border-purple-100">
              <Text className="text-lg font-bold" style={{ color: COLORS.deepPlum }}>Select Partner Country</Text>
              <TouchableOpacity
                className="p-1"
                onPress={() => {
                  setShowPartnerCountryModal(false);
                  setPartnerCountrySearchQuery('');
                }}
              >
                <Ionicons name="close" size={20} color={COLORS.deepPlum} />
              </TouchableOpacity>
            </View>
            
            {/* Search Input */}
            <View className="flex-row items-center bg-purple-50 rounded-lg mx-5 mb-2 px-4 py-2 border border-purple-200">
              <Ionicons name="search" size={16} color="rgba(95, 75, 139, 0.5)" className="mr-2" />
              <TextInput
                className="flex-1 text-sm"
                style={{ color: COLORS.deepPlum }}
                placeholder="Search countries..."
                placeholderTextColor="rgba(95, 75, 139, 0.5)"
                value={partnerCountrySearchQuery}
                onChangeText={setPartnerCountrySearchQuery}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {partnerCountrySearchQuery.length > 0 && (
                <TouchableOpacity
                  className="ml-2 p-1"
                  onPress={() => setPartnerCountrySearchQuery('')}
                >
                  <Ionicons name="close-circle" size={16} color="rgba(95, 75, 139, 0.5)" />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredPartnerCountries}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`flex-row justify-between items-center px-5 py-3 border-b border-purple-100 ${
                    formData.looking_for.partner_country === item ? 'bg-purple-50' : ''
                  }`}
                  onPress={() => {
                    updateNestedData('looking_for', 'partner_country', item);
                    setShowPartnerCountryModal(false);
                    setPartnerCountrySearchQuery('');
                  }}
                >
                  <Text className={`text-sm ${
                    formData.looking_for.partner_country === item ? 'text-purple-600 font-semibold' : 'text-purple-600 font-medium'
                  }`}>
                    {item}
                  </Text>
                  {formData.looking_for.partner_country === item && (
                    <Ionicons name="checkmark" size={16} color={COLORS.deepPlum} />
                  )}
                </TouchableOpacity>
              )}
              className="flex-1"
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 50 }}
            />
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <View className="bg-white rounded-2xl p-8 items-center max-w-sm w-full shadow-lg">
            <View className="mb-5">
              <Ionicons name="checkmark-circle" size={60} color="#10B981" />
            </View>
            
            <Text className="text-xl font-bold text-center mb-4" style={{ color: COLORS.deepPlum }}>Profile Completed!</Text>
            <Text className="text-sm text-purple-400 text-center leading-5 mb-8">
              Your profile has been successfully created. You can now proceed to select your AI companion.
            </Text>
            
            <TouchableOpacity
              className="rounded-lg py-3 px-8 min-w-[120px]"
              style={{ backgroundColor: COLORS.softRose }}
              onPress={() => {
                console.log('Success modal continue pressed');
                setShowSuccessModal(false);
                // The AuthContext update should automatically trigger navigation to CompanionSelection
                // via the AppNavigator conditional rendering
                console.log('Closing modal - AuthContext should handle navigation');
              }}
            >
              <Text className="text-white text-sm font-semibold text-center">Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaWrapper>
  );
};

export default OnboardingScreen;
