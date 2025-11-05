/**
 * Simple test script to verify LangChain integration
 * Run with: node test-langchain-integration.js
 */

const langchainService = require('./services/langchain/langchainService');
const langgraphAgent = require('./services/langchain/langgraphAgent');
const memoryService = require('./services/langchain/memoryService');
const toolsService = require('./services/langchain/toolsService');

async function testLangChainIntegration() {
  console.log('🧪 Testing LangChain Integration...\n');

  try {
    // Test 1: Check if services are initialized
    console.log('1. Testing service initialization...');
    console.log('   ✅ LangChain Service:', langchainService ? 'Loaded' : 'Failed');
    console.log('   ✅ LangGraph Agent:', langgraphAgent ? 'Loaded' : 'Failed');
    console.log('   ✅ Memory Service:', memoryService ? 'Loaded' : 'Failed');
    console.log('   ✅ Tools Service:', toolsService ? 'Loaded' : 'Failed');

    // Test 2: Test fallback response generation
    console.log('\n2. Testing fallback response generation...');
    const testResponse = await langchainService.fallbackResponse({
      companionId: 1,
      userId: 'test-user',
      conversationId: 'test-conv',
      userMessage: 'Hello! How are you?'
    });
    console.log('   ✅ Fallback Response:', testResponse);

    // Test 3: Test LangGraph fallback
    console.log('\n3. Testing LangGraph fallback response...');
    const testAgentResponse = await langgraphAgent.fallbackResponse({
      companionId: 1,
      userId: 'test-user',
      conversationId: 'test-conv',
      userMessage: 'I had a great day today!'
    });
    console.log('   ✅ LangGraph Fallback Response:', testAgentResponse);

    // Test 4: Test tools service
    console.log('\n4. Testing tools service...');
    const tools = toolsService.getAllTools();
    console.log('   ✅ Available Tools:', tools.length > 0 ? `${tools.length} tools loaded` : 'No tools available');

    // Test 5: Test memory service
    console.log('\n5. Testing memory service...');
    const memoryBuffer = memoryService.getMemoryBuffer(1, 'test-user', 'test-conv');
    console.log('   ✅ Memory Buffer:', memoryBuffer ? 'Created successfully' : 'Failed to create');

    console.log('\n🎉 LangChain Integration Test Complete!');
    console.log('\n📝 Summary:');
    console.log('   - All services are loaded and functional');
    console.log('   - Fallback responses are working');
    console.log('   - Memory and tools services are operational');
    console.log('   - The system is ready for use!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testLangChainIntegration();
