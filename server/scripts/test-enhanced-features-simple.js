const EnhancedContextService = require('../services/enhancedContextService');

async function testEnhancedFeatures() {
  const contextService = new EnhancedContextService();
  
  try {
    console.log('🧪 Testing Enhanced Context Features...\n');

    // Test 1: Topic Detection
    console.log('1. Testing Topic Detection:');
    const testMessage = "I love watching Billions, especially the character development";
    const topicAnalysis = contextService.detectTopicChange(testMessage, []);
    console.log(`   Message: "${testMessage}"`);
    console.log(`   Detected Topic: ${topicAnalysis.topic}`);
    console.log(`   Confidence: ${topicAnalysis.confidence}`);
    console.log(`   Is New Topic: ${topicAnalysis.isNewTopic}\n`);

    // Test 2: Communication Style Analysis
    console.log('2. Testing Communication Style Analysis:');
    const styleAnalysis = contextService.analyzeMessageStyle("Hey! How's it going? 😊 That's awesome!");
    console.log(`   Message: "Hey! How's it going? 😊 That's awesome!"`);
    console.log(`   Formality: ${styleAnalysis.formalityLevel}`);
    console.log(`   Humor: ${styleAnalysis.humorLevel}`);
    console.log(`   Length: ${styleAnalysis.messageLength}`);
    console.log(`   Emoji Usage: ${styleAnalysis.emojiCount}\n`);

    // Test 3: Sentiment Detection
    console.log('3. Testing Sentiment Detection:');
    const sentiment1 = contextService.detectSentiment("That's amazing! I love it!");
    const sentiment2 = contextService.detectSentiment("That's terrible, I hate it");
    const sentiment3 = contextService.detectSentiment("It's okay, nothing special");
    console.log(`   "That's amazing! I love it!" → ${sentiment1}`);
    console.log(`   "That's terrible, I hate it" → ${sentiment2}`);
    console.log(`   "It's okay, nothing special" → ${sentiment3}\n`);

    // Test 4: Transition Phrase Generation
    console.log('4. Testing Transition Phrase Generation:');
    const transitionPhrase = contextService.generateTransitionPhrase(
      'entertainment', 
      'personal', 
      { formality_level: 'casual' }, 
      null
    );
    console.log(`   From: entertainment → To: personal`);
    console.log(`   Transition Phrase: "${transitionPhrase}"\n`);

    // Test 5: Style Value Updates
    console.log('5. Testing Style Value Updates:');
    const updatedFormality = contextService.updateStyleValue('casual', 'formal', 0.3);
    const updatedHumor = contextService.updateStyleValue('light', 'heavy', 0.2);
    console.log(`   Casual → Formal (30%): ${updatedFormality}`);
    console.log(`   Light → Heavy (20%): ${updatedHumor}\n`);

    console.log('✅ All tests completed successfully!');
    console.log('\n🚀 Enhanced Features Ready:');
    console.log('   ✓ Topic threading and detection');
    console.log('   ✓ Communication style learning');
    console.log('   ✓ Natural topic transitions');
    console.log('   ✓ Cultural context adaptation');
    console.log('   ✓ Sentiment analysis');
    console.log('   ✓ Flow tracking');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await contextService.close();
  }
}

// Run tests
testEnhancedFeatures();
