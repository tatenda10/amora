const Anthropic = require('@anthropic-ai/sdk');
const pool = require('../db/connection');

/**
 * Claude Service for AI Companion Responses
 * Uses Claude model specified in CLAUDE_MODEL environment variable
 */
class ClaudeService {
  constructor() {
    if (!process.env.CLAUDE_API_KEY) {
      console.warn('CLAUDE_API_KEY not found. Claude service will not be available.');
      this.anthropic = null;
      return;
    }

    if (!process.env.CLAUDE_MODEL) {
      console.error('❌ CLAUDE_MODEL not found in .env file. Please set CLAUDE_MODEL (e.g., claude-sonnet-4-5, claude-3-7-sonnet-latest)');
      this.anthropic = null;
      return;
    }

    this.anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
    
    // Use model from environment variable (required)
    // Available models (from Anthropic SDK):
    // - claude-sonnet-4-5 (newest generation, recommended)
    // - claude-sonnet-4-5-20250929
    // - claude-3-7-sonnet-latest
    // - claude-3-7-sonnet-20250219
    // - claude-3-opus-20240229 (older but reliable)
    // - claude-3-haiku-20240307 (fastest)
    this.model = process.env.CLAUDE_MODEL;
    // Fallback models if the specified model is not found
    this.fallbackModels = [
      'claude-sonnet-4-5',             // Claude Sonnet 4.5 (newest generation)
      'claude-sonnet-4-5-20250929',    // Claude Sonnet 4.5 with date
      'claude-3-7-sonnet-latest',      // Claude 3.7 Sonnet
      'claude-3-7-sonnet-20250219',    // Claude 3.7 Sonnet with date
      'claude-3-opus-20240229',        // Claude 3 Opus (reliable fallback)
      'claude-3-haiku-20240307'        // Claude 3 Haiku (fastest)
    ];
    
    console.log(`✅ Claude service initialized with model: ${this.model}`);
    // Reduce max tokens to force very short responses (100 = ~1-2 sentences max)
    // Using 100 to strictly enforce short responses like texting
    this.maxTokens = parseInt(process.env.CLAUDE_MAX_TOKENS) || 100;
    this.temperature = parseFloat(process.env.CLAUDE_TEMPERATURE) || 0.8;
    
    this.pool = pool;
  }

  /**
   * Check if Claude is available
   */
  isAvailable() {
    return this.anthropic !== null;
  }

  /**
   * Generate response using Claude with retry logic for overloaded errors
   * @param {Array} messages - Array of message objects with role and content
   * @param {String} systemPrompt - System prompt/instructions
   * @param {Number} retryCount - Current retry attempt (internal use)
   * @returns {Promise<String>} AI response
   */
  async generateResponse(messages, systemPrompt, retryCount = 0) {
    if (!this.isAvailable()) {
      throw new Error('Claude service is not available. Check CLAUDE_API_KEY.');
    }

    const maxRetries = 1; // Only 1 retry before trying fallback model
    const baseDelay = 1000; // 1 second delay

    // Convert messages format for Claude (do this once, reuse for fallbacks)
    const claudeMessages = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: claudeMessages,
        system: systemPrompt || 'You are a helpful, empathetic AI companion.'
      });

      return response.content[0].text;
    } catch (error) {
      // Handle 529 Overloaded error with retry
      if (error.status === 529 || (error.error?.type === 'overloaded_error')) {
        // Check if we should retry (from headers or default behavior)
        const headers = error.headers || {};
        const shouldRetryHeader = headers.get?.('x-should-retry') || headers['x-should-retry'];
        const shouldRetry = shouldRetryHeader === 'true' || retryCount < maxRetries;
        
        if (shouldRetry && retryCount < maxRetries) {
          // Simple 1 second delay for retry
          console.warn(`Claude API overloaded (529). Retrying in ${baseDelay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
          
          await new Promise(resolve => setTimeout(resolve, baseDelay));
          return this.generateResponse(messages, systemPrompt, retryCount + 1);
        } else {
          // Try fallback to faster model immediately after retry fails (don't wait)
          // Try Haiku first (fastest, less overloaded), then Opus
          const fallbackModels = ['claude-3-haiku-20240307', 'claude-3-opus-20240229'];
          
          for (const fallbackModel of fallbackModels) {
            if (this.model === fallbackModel) continue; // Skip if already using this model
            
            console.warn(`Trying fallback model: ${fallbackModel} (faster/less overloaded)...`);
            try {
              const fallbackResponse = await this.anthropic.messages.create({
                model: fallbackModel,
                max_tokens: this.maxTokens,
                temperature: this.temperature,
                messages: claudeMessages,
                system: systemPrompt || 'You are a helpful, empathetic AI companion.'
              });
              console.log(`✅ Successfully used ${fallbackModel} as fallback`);
              return fallbackResponse.content[0].text;
            } catch (fallbackError) {
              // If fallback also gets 529, try next one immediately
              if (fallbackError.status === 529) {
                console.warn(`Fallback ${fallbackModel} also overloaded, trying next...`);
                continue;
              }
              console.warn(`Fallback to ${fallbackModel} failed: ${fallbackError.message}`);
              continue; // Try next fallback
            }
          }
          
          // All models failed
          console.error('All Claude models overloaded. Max retries and fallbacks exhausted.');
          throw new Error('Claude API is currently overloaded. Please try again in a moment.');
        }
      }

      // Handle model not found error - try fallback models
      if (error.status === 404 && error.error?.type === 'not_found_error') {
        console.warn(`Model ${this.model} not found. Trying fallback models...`);
        
        // Try each fallback model
        for (const fallbackModel of this.fallbackModels) {
          if (this.model === fallbackModel) continue; // Skip if already tried
          
          try {
            console.log(`Trying fallback model: ${fallbackModel}`);
            const fallbackResponse = await this.anthropic.messages.create({
              model: fallbackModel,
              max_tokens: this.maxTokens,
              temperature: this.temperature,
              messages: claudeMessages,
              system: systemPrompt || 'You are a helpful, empathetic AI companion.'
            });
            console.log(`✅ Successfully using model: ${fallbackModel}`);
            // Update model for future requests
            this.model = fallbackModel;
            return fallbackResponse.content[0].text;
          } catch (fallbackError) {
            // Continue to next fallback
            console.warn(`Fallback model ${fallbackModel} also failed: ${fallbackError.message}`);
            continue;
          }
        }
        
        // All models failed
        console.error('All Claude models failed. Please check your API key and model access.');
        throw new Error(`No Claude models available. Please check your CLAUDE_API_KEY and model access. Tried: ${this.model}, ${this.fallbackModels.join(', ')}`);
      }

      // Handle rate limit errors (429)
      if (error.status === 429) {
        const headers = error.headers || {};
        const retryAfter = headers.get?.('retry-after') || headers['retry-after'] || 5;
        console.warn(`Rate limited. Waiting ${retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        if (retryCount < maxRetries) {
          return this.generateResponse(messages, systemPrompt, retryCount + 1);
        }
      }

      console.error('Claude API error:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for text (for Pinecone)
   * Note: Claude doesn't have an embeddings API, so we'll use OpenAI for embeddings
   * or you can use a separate embedding model
   */
  async generateEmbedding(text) {
    // Claude doesn't provide embeddings, so we'll need to use OpenAI or another service
    // This is a placeholder - you might want to use OpenAI's embedding model
    throw new Error('Claude does not provide embeddings. Use OpenAI or another embedding service.');
  }
}

module.exports = new ClaudeService();

