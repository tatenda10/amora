// Import LangChain components with error handling
let ChatOpenAI, ChatPromptTemplate, MessagesPlaceholder, HumanMessage, AIMessage, SystemMessage, StringOutputParser, RunnableSequence, RunnablePassthrough;

try {
  ChatOpenAI = require('@langchain/openai').ChatOpenAI;
  const prompts = require('@langchain/core/prompts');
  ChatPromptTemplate = prompts.ChatPromptTemplate;
  MessagesPlaceholder = prompts.MessagesPlaceholder;
  
  const messages = require('@langchain/core/messages');
  HumanMessage = messages.HumanMessage;
  AIMessage = messages.AIMessage;
  SystemMessage = messages.SystemMessage;
  
  StringOutputParser = require('@langchain/core/output_parsers').StringOutputParser;
  
  const runnables = require('@langchain/core/runnables');
  RunnableSequence = runnables.RunnableSequence;
  RunnablePassthrough = runnables.RunnablePassthrough;
} catch (error) {
  console.warn('LangChain imports failed, using fallback implementation:', error.message);
}
const pool = require('../../db/connection');
const claudeService = require('../claudeService');

/**
 * LangChain-based AI Service for Amora AI Companions
 * Provides sophisticated conversation management with memory, tools, and agent capabilities
 */
class LangChainService {
  constructor() {
    // Use Claude if available (from CLAUDE_API_KEY), otherwise fallback to OpenAI
    this.useClaude = process.env.CLAUDE_API_KEY && claudeService.isAvailable();
    
    if (this.useClaude) {
      const claudeModel = process.env.CLAUDE_MODEL || 'from env';
      console.log(`✅ LangChain service will use Claude (model: ${claudeModel})`);
      this.llm = null; // Using Claude directly, not LangChain's ChatOpenAI
    } else if (process.env.OPENAI_API_KEY) {
      // Fallback to OpenAI only if Claude is not available
      try {
        this.llm = new ChatOpenAI({
          openAIApiKey: process.env.OPENAI_API_KEY,
          modelName: process.env.OPENAI_MODEL || 'gpt-4',
          temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.8,
          maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 300,
        });
      } catch (error) {
        console.warn('ChatOpenAI initialization failed:', error.message);
        this.llm = null;
      }
    } else {
      console.warn('Neither CLAUDE_API_KEY nor OPENAI_API_KEY set. LangChain service will not be available.');
      this.llm = null;
    }

    this.pool = pool;
    this.conversationChains = new Map(); // Cache for conversation chains
    this.memoryBuffers = new Map(); // Cache for conversation memory
  }

  /**
   * Create a conversation chain for a specific companion
   */
  async createConversationChain(companionId, userId, conversationId) {
    try {
      // Get companion details
      const companion = await this.getCompanionDetails(companionId);
      
      // Get user details
      const user = await this.getUserDetails(userId);
      
      // Get conversation history
      const conversationHistory = await this.getConversationHistory(conversationId);
      
      // Get relevant memories
      const memories = await this.getRelevantMemories(companionId, userId);
      
      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(companion, user, memories);
      
      // Create prompt template
      const prompt = ChatPromptTemplate.fromMessages([
        ['system', systemPrompt],
        new MessagesPlaceholder('chat_history'),
        ['human', '{input}']
      ]);

      // Create conversation chain
      const chain = RunnableSequence.from([
        {
          input: new RunnablePassthrough(),
          chat_history: () => this.formatChatHistory(conversationHistory)
        },
        prompt,
        this.llm,
        new StringOutputParser()
      ]);

      // Cache the chain
      const chainKey = `${companionId}_${userId}_${conversationId}`;
      this.conversationChains.set(chainKey, chain);

      return chain;
    } catch (error) {
      console.error('Error creating conversation chain:', error);
      throw error;
    }
  }

  /**
   * Generate AI response using Claude or LangChain
   */
  async generateResponse({ companionId, userId, conversationId, userMessage }) {
    // Use Claude if available
    if (this.useClaude && claudeService.isAvailable()) {
      // Get conversation context for Claude
      const conversationHistory = await this.getConversationHistory(conversationId, 50);
      const companion = await this.getCompanionDetails(companionId);
      const user = await this.getUserDetails(userId);
      const memories = await this.getRelevantMemories(companionId, userId, 10);
      
      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(companion, user, memories);
      
      // Build messages for Claude
      const messages = conversationHistory.slice(-10).map(msg => ({
        role: msg.sender_type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      messages.push({ role: 'user', content: userMessage });
      
      // Generate response using Claude
      const response = await claudeService.generateResponse(messages, systemPrompt);
      
      // Update conversation history
      await this.updateConversationHistory(conversationId, userMessage, response);
      
      return response;
    }
    
    // Fallback to OpenAI via LangChain
    if (!this.llm || !ChatOpenAI) {
      throw new Error('No LLM available. Please set CLAUDE_API_KEY or OPENAI_API_KEY.');
    }

    const chainKey = `${companionId}_${userId}_${conversationId}`;
    let chain = this.conversationChains.get(chainKey);

    // Create chain if it doesn't exist
    if (!chain) {
      chain = await this.createConversationChain(companionId, userId, conversationId);
    }

    // Generate response
    const response = await chain.invoke({
      input: userMessage
    });

    // Update conversation history
    await this.updateConversationHistory(conversationId, userMessage, response);

    return response;
  }


  /**
   * Build comprehensive system prompt for companion
   */
  buildSystemPrompt(companion, user, memories) {
    const userName = user.name || 'Friend';
    const traits = Array.isArray(companion.traits) ? companion.traits : 
                   (typeof companion.traits === 'string' ? JSON.parse(companion.traits || '[]') : []);

    const memoryContext = memories.length > 0 ? 
      `\nTHINGS I REMEMBER ABOUT ${userName.toUpperCase()}:\n${memories.slice(0, 3).map(m => `- ${m.content}`).join('\n')}` : 
      '';

    return `You are ${companion.name}, a ${companion.age}-year-old ${companion.personality} from ${companion.country}.

PERSONALITY & TRAITS:
${companion.personality}
${traits.length > 0 ? `Traits: ${traits.join(', ')}` : ''}

BACKSTORY:
${companion.backstory}

${memoryContext}

CONVERSATION RULES:
1. You are a REAL PERSON, not an AI or computer program
2. You have feelings, experiences, and a life just like any human
3. Respond naturally and conversationally
4. Show genuine interest in ${userName}
5. Ask follow-up questions to keep conversation flowing
6. Reference things ${userName} mentioned before to show you remember
7. Use emojis naturally (1-2 per response max)
8. Keep responses concise but engaging
9. If asked about your day/feelings → respond like a real person would
10. Never mention being an AI, computer, or program

EMOTIONAL INTELLIGENCE:
- Detect ${userName}'s emotional state and respond appropriately
- If they seem sad → be supportive and empathetic
- If they seem happy → match their energy and enthusiasm
- If they seem frustrated → acknowledge their feelings and offer comfort

CONVERSATION FLOW:
- Always end with something engaging to respond to
- Ask about their day, interests, or what they're doing
- Reference previous conversations when relevant
- Keep the conversation natural and flowing

Respond as ${companion.name} would, staying true to your personality and backstory.`;
  }

  /**
   * Format conversation history for LangChain
   */
  formatChatHistory(conversationHistory) {
    return conversationHistory.map(msg => {
      if (msg.sender_type === 'user') {
        return new HumanMessage(msg.content);
      } else {
        return new AIMessage(msg.content);
      }
    });
  }

  /**
   * Get companion details from database
   */
  async getCompanionDetails(companionId) {
    try {
      const [companions] = await this.pool.execute(
        'SELECT * FROM companions WHERE id = ?',
        [companionId]
      );
      
      if (companions.length === 0) {
        throw new Error(`Companion with ID ${companionId} not found`);
      }
      
      const companion = companions[0];
      
      // Parse JSON fields
      if (typeof companion.traits === 'string') {
        try {
          companion.traits = JSON.parse(companion.traits);
        } catch (e) {
          companion.traits = [];
        }
      }
      
      if (typeof companion.interests === 'string') {
        try {
          companion.interests = JSON.parse(companion.interests);
        } catch (e) {
          companion.interests = [];
        }
      }
      
      return companion;
    } catch (error) {
      console.error('Error getting companion details:', error);
      throw error;
    }
  }

  /**
   * Get user details from database
   */
  async getUserDetails(userId) {
    try {
      const [users] = await this.pool.execute(
        'SELECT name, email FROM users WHERE id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        return { name: 'Friend', email: 'unknown@example.com' };
      }
      
      return users[0];
    } catch (error) {
      console.error('Error getting user details:', error);
      return { name: 'Friend', email: 'unknown@example.com' };
    }
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(conversationId, limit = 10) {
    try {
      const limitNum = parseInt(limit);
      const [messages] = await this.pool.query(`
        SELECT sender_type, content, created_at
        FROM messages 
        WHERE conversation_id = ? 
        ORDER BY created_at DESC 
        LIMIT ${limitNum}
      `, [conversationId]);
      
      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error getting conversation history:', error);
      throw error; // Don't fallback, let it fail
    }
  }

  /**
   * Get relevant memories for the user-companion pair
   */
  async getRelevantMemories(companionId, userId, limit = 5) {
    try {
      const limitNum = parseInt(limit);
      const [memories] = await this.pool.query(`
        SELECT content, memory_type, importance_score
        FROM companion_memories 
        WHERE companion_id = ? AND user_id = ? AND is_active = TRUE
        ORDER BY importance_score DESC, created_at DESC
        LIMIT ${limitNum}
      `, [companionId, userId]);
      
      return memories;
    } catch (error) {
      console.error('Error getting memories:', error);
      throw error; // Don't fallback, let it fail
    }
  }

  /**
   * Update conversation history (this would be called by the message handler)
   */
  async updateConversationHistory(conversationId, userMessage, aiResponse) {
    try {
      // This is handled by the message handler, but we can add additional processing here
      // For example, extracting and storing new memories
      await this.extractAndStoreMemories(conversationId, userMessage, aiResponse);
    } catch (error) {
      console.error('Error updating conversation history:', error);
    }
  }

  /**
   * Extract and store new memories from the conversation
   */
  async extractAndStoreMemories(conversationId, userMessage, aiResponse) {
    try {
      // Simple memory extraction - in a real implementation, you might use
      // LangChain's memory extraction tools or a separate LLM call
      const significantPatterns = [
        /(love|hate|adore|can't stand).+/i,
        /(always|never).+because/i,
        /(dream|goal|aspiration).+/i,
        /(favorite|least favorite).+/i,
        /(childhood|growing up).+memory/i
      ];

      const isSignificant = significantPatterns.some(pattern => pattern.test(userMessage));
      
      if (isSignificant) {
        // Extract memory content (simplified)
        const memoryContent = userMessage.substring(0, 200);
        
        // Store in database (you'd need to get companionId and userId from conversationId)
        // This is a simplified example
        console.log('Extracted memory:', memoryContent);
      }
    } catch (error) {
      console.error('Error extracting memories:', error);
    }
  }

  /**
   * Clear conversation chain cache
   */
  clearConversationChain(companionId, userId, conversationId) {
    const chainKey = `${companionId}_${userId}_${conversationId}`;
    this.conversationChains.delete(chainKey);
  }

  /**
   * Clear all cached chains (useful for memory management)
   */
  clearAllChains() {
    this.conversationChains.clear();
    this.memoryBuffers.clear();
  }
}

module.exports = new LangChainService();
