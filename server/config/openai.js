require('dotenv').config();

const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL || 'gpt-4',
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
};

// Validate required configuration
if (!openaiConfig.apiKey) {
  console.warn('⚠️  OPENAI_API_KEY is not set. AI conversations will not work.');
}

if (!openaiConfig.apiKey || openaiConfig.apiKey === 'your-openai-api-key-here') {
  console.error('❌ Please set a valid OPENAI_API_KEY in your .env file');
  console.log('📝 Example .env configuration:');
  console.log('OPENAI_API_KEY=sk-your-actual-api-key-here');
  console.log('OPENAI_MODEL=gpt-4');
  console.log('OPENAI_MAX_TOKENS=1000');
  console.log('OPENAI_TEMPERATURE=0.7');
}

module.exports = openaiConfig; 