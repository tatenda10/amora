require('dotenv').config();
const openaiService = require('../services/openaiService');
const pool = require('../db/connection');

const testOpenAI = async () => {
  try {
    console.log('🧪 Testing OpenAI Integration...\n');

    // Test 1: Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.error('❌ OPENAI_API_KEY not configured properly');
      console.log('📝 Please add your OpenAI API key to .env file:');
      console.log('OPENAI_API_KEY=sk-your-actual-api-key-here');
      return;
    }

    console.log('✅ OpenAI API key configured');

    // Test 2: Test OpenAI connection
    console.log('\n🔗 Testing OpenAI connection...');
    const connectionTest = await openaiService.testConnection();
    if (connectionTest) {
      console.log('✅ OpenAI connection successful');
    } else {
      console.error('❌ OpenAI connection failed');
      return;
    }

    // Test 3: Get a companion from database
    console.log('\n📊 Getting companion data from database...');
    const [companions] = await pool.execute('SELECT id, name FROM companions LIMIT 1');
    
    if (companions.length === 0) {
      console.error('❌ No companions found in database');
      console.log('💡 Please run the import script first: node scripts/importCompanions.js');
      return;
    }

    const testCompanion = companions[0];
    console.log(`✅ Found companion: ${testCompanion.name} (ID: ${testCompanion.id})`);

    // Test 4: Generate AI response
    console.log('\n🤖 Testing AI response generation...');
    const testResponse = await openaiService.generateCompanionResponse({
      companionId: testCompanion.id,
      userMessage: "Hello! How are you today?",
      conversationHistory: [],
      userId: "test-user-123"
    });

    console.log('✅ AI response generated successfully');
    console.log(`📝 Response: "${testResponse.content}"`);
    console.log(`👤 Companion: ${testResponse.companionName}`);
    console.log(`📊 Usage: ${JSON.stringify(testResponse.usage, null, 2)}`);

    // Test 5: Test with conversation history
    console.log('\n💬 Testing with conversation history...');
    const testResponseWithHistory = await openaiService.generateCompanionResponse({
      companionId: testCompanion.id,
      userMessage: "That's interesting! Tell me more about yourself.",
      conversationHistory: [
        { sender_type: 'user', content: 'Hello! How are you today?' },
        { sender_type: 'companion', content: testResponse.content }
      ],
      userId: "test-user-123"
    });

    console.log('✅ AI response with history generated successfully');
    console.log(`📝 Response: "${testResponseWithHistory.content}"`);

    console.log('\n🎉 All OpenAI tests passed!');
    console.log('\n📋 Summary:');
    console.log('- OpenAI API key: ✅ Configured');
    console.log('- OpenAI connection: ✅ Working');
    console.log('- Database connection: ✅ Working');
    console.log('- AI response generation: ✅ Working');
    console.log('- Conversation history: ✅ Working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await pool.end();
    process.exit(0);
  }
};

testOpenAI(); 