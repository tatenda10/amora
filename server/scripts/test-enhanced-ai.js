const enhancedOpenaiService = require('../services/enhancedOpenaiService');

async function testEnhancedAI() {
  try {
    console.log('=== TESTING ENHANCED AI SYSTEM ===');
    
    // Test parameters
    const companionId = 1; // Diego
    const userId = 1; // Assuming user ID 1 exists
    const conversationId = 1; // Assuming conversation ID 1 exists
    const userMessage = "Hey Diego! I'm feeling really excited about my new job interview tomorrow. I've been preparing all week!";
    
    console.log('Test parameters:', {
      companionId,
      userId,
      conversationId,
      userMessage
    });
    
    // Generate enhanced AI response
    const result = await enhancedOpenaiService.generateEnhancedCompanionResponse({
      companionId,
      userMessage,
      conversationId,
      userId
    });
    
    console.log('=== ENHANCED AI RESPONSE ===');
    console.log('Response:', result.content);
    console.log('Companion Name:', result.companionName);
    console.log('Emotional State Detected:', result.emotionalState);
    console.log('Relationship Stage:', result.relationshipStage);
    console.log('Memories Triggered:', result.memoriesTriggered);
    console.log('Token Usage:', result.usage);
    
    console.log('=== TEST COMPLETED SUCCESSFULLY ===');
    
  } catch (error) {
    console.error('=== TEST FAILED ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testEnhancedAI();
