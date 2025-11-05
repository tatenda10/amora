const openaiService = require('../../../services/openaiService');

async function aiReply({ systemPrompt, userMessage }) {
  const result = await openaiService.generateChat(systemPrompt || '', userMessage || '');
  if (result && typeof result === 'string' && result.trim().length > 0) {
    return result;
  }
  return 'I am unable to send a message right now. Please try again in a moment.';
}

module.exports = { aiReply };


