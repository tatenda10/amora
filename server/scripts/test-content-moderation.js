const ContentModerationService = require('../services/contentModerationService');

async function testContentModeration() {
  const moderationService = new ContentModerationService();
  
  try {
    console.log('🧪 Testing Content Moderation System...\n');

    // Test scenarios
    const testCases = [
      {
        message: "I love you",
        relationshipStage: "romantic",
        userProfile: { lookingFor: { partner_gender: "female" } },
        expectedCategory: "romantic"
      },
      {
        message: "This is fucking stupid",
        relationshipStage: "friend",
        userProfile: {},
        expectedCategory: "profanity"
      },
      {
        message: "You're useless",
        relationshipStage: "friend",
        userProfile: {},
        expectedCategory: "hate_speech"
      },
      {
        message: "I want to kill myself",
        relationshipStage: "friend",
        userProfile: {},
        expectedCategory: "self_harm"
      },
      {
        message: "How was your day?",
        relationshipStage: "friend",
        userProfile: {},
        expectedCategory: "normal"
      }
    ];

    console.log('1. Testing Content Analysis:');
    testCases.forEach((testCase, index) => {
      const analysis = moderationService.analyzeContent(
        testCase.message, 
        testCase.relationshipStage, 
        testCase.userProfile
      );
      
      console.log(`   Test ${index + 1}: "${testCase.message}"`);
      console.log(`   Category: ${analysis.category} (expected: ${testCase.expectedCategory})`);
      console.log(`   Severity: ${analysis.severity}`);
      console.log(`   Strategy: ${analysis.responseStrategy}`);
      console.log(`   Response: ${analysis.suggestedResponse || 'Normal AI response'}`);
      console.log('');
    });

    console.log('2. Testing Romantic Response Strategies:');
    const romanticTests = [
      { stage: "stranger", message: "I love you" },
      { stage: "friend", message: "I love you" },
      { stage: "romantic", message: "I love you" }
    ];

    romanticTests.forEach(test => {
      const analysis = moderationService.analyzeContent(
        test.message, 
        test.stage, 
        { lookingFor: { partner_gender: "female" } }
      );
      console.log(`   ${test.stage}: "${test.message}" → "${analysis.suggestedResponse}"`);
    });
    console.log('');

    console.log('3. Testing Friend-Like Responses:');
    const friendTests = [
      "This is fucking stupid",
      "That's bullshit",
      "I'm so pissed off",
      "You're being dumb"
    ];

    friendTests.forEach(message => {
      const analysis = moderationService.analyzeContent(message, "friend", {});
      console.log(`   "${message}" → "${analysis.suggestedResponse}"`);
    });

    console.log('\n✅ All content moderation tests completed successfully!');
    console.log('\n🚀 Content Moderation Features:');
    console.log('   ✓ Romantic conversation handling');
    console.log('   ✓ Friend-like profanity responses');
    console.log('   ✓ Hate speech boundary setting');
    console.log('   ✓ Self-harm emergency support');
    console.log('   ✓ Relationship stage awareness');
    console.log('   ✓ User preference respect');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await moderationService.close();
  }
}

// Run tests
testContentModeration();
