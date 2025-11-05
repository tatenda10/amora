const OpenAI = require('openai');
const pool = require('../db/connection');

class OpenAIService {
  constructor() {
    this.model = process.env.OPENAI_MODEL ;
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 150;
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7;
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateResponse(prompt) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      throw error;
    }
  }

  async generateChat(systemPrompt, userMessage) {
    try {
      const messages = [];
      if (systemPrompt && systemPrompt.trim()) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: userMessage });

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      throw error;
    }
  }

  async testConnection() {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new OpenAIService();