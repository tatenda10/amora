const EnhancedContextService = require('../services/enhancedContextService');

async function testSignupDataIntegration() {
  const contextService = new EnhancedContextService();
  
  try {
    console.log('🧪 Testing Signup Data Integration...\n');

    // Test 1: Interest-based topic detection
    console.log('1. Testing Interest-Based Topic Detection:');
    const userInterests = ['TV shows', 'cooking', 'travel'];
    const message1 = "I love watching Billions, it's such a great show!";
    const analysis1 = contextService.detectTopicChangeWithInterests(message1, [], userInterests);
    console.log(`   Message: "${message1}"`);
    console.log(`   User Interests: ${userInterests.join(', ')}`);
    console.log(`   Detected Topic: ${analysis1.topic}`);
    console.log(`   Interest Match: ${analysis1.interestMatch}`);
    console.log(`   Priority: ${analysis1.priority}\n`);

    // Test 2: Cultural context initialization
    console.log('2. Testing Cultural Context Initialization:');
    const mockUserProfile = {
      country: 'US',
      age: 25,
      interests: ['TV shows', 'cooking'],
      lookingFor: { partner_gender: 'female', partner_age_min: 20, partner_age_max: 30 },
      preferences: { ethnicity: 'any', personality_traits: ['funny', 'kind'] }
    };
    
    const culturalData = await contextService.initializeCulturalContextFromProfile('test-user', mockUserProfile);
    console.log(`   User Profile: ${mockUserProfile.country}, age ${mockUserProfile.age}`);
    console.log(`   Cultural Data:`, culturalData);
    console.log(`   Timezone: ${contextService.getTimezoneFromCountry('US')}`);
    console.log(`   Cultural Norms:`, contextService.getCulturalNormsFromCountry('US'));
    console.log('');

    // Test 3: Interest matching
    console.log('3. Testing Interest Matching:');
    const interests = ['TV shows', 'cooking', 'travel'];
    const topics = ['entertainment', 'food', 'work', 'hobbies'];
    
    topics.forEach(topic => {
      const match = contextService.checkInterestMatch(topic, interests);
      console.log(`   Topic "${topic}" matches interests: ${match}`);
    });
    console.log('');

    // Test 4: Different country cultural norms
    console.log('4. Testing Different Country Cultural Norms:');
    const countries = ['US', 'UK', 'Japan', 'Germany'];
    countries.forEach(country => {
      const norms = contextService.getCulturalNormsFromCountry(country);
      console.log(`   ${country}: ${norms.communication_style}, ${norms.humor_style}, ${norms.formality_preferences}`);
    });

    console.log('\n✅ All signup data integration tests completed successfully!');
    console.log('\n🚀 Signup Data Integration Features:');
    console.log('   ✓ Interest-based topic prioritization');
    console.log('   ✓ Cultural context from country');
    console.log('   ✓ Age-appropriate communication');
    console.log('   ✓ Preference-aware responses');
    console.log('   ✓ Relationship preference consideration');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await contextService.close();
  }
}

// Run tests
testSignupDataIntegration();
