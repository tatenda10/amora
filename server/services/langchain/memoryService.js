// Import LangChain components with error handling
let ChatOpenAI, ChatPromptTemplate, StringOutputParser;

try {
  ChatOpenAI = require('@langchain/openai').ChatOpenAI;
  ChatPromptTemplate = require('@langchain/core/prompts').ChatPromptTemplate;
  StringOutputParser = require('@langchain/core/output_parsers').StringOutputParser;
} catch (error) {
  console.warn('LangChain imports failed in memory service:', error.message);
}
// Note: BufferMemory import may need to be adjusted based on actual package exports
// const { BufferMemory } = require('@langchain/community/memory');
const pool = require('../../db/connection');

/**
 * LangChain-based Memory Service for Amora AI Companions
 * Provides sophisticated memory management with extraction, storage, and retrieval
 */
class MemoryService {
  constructor() {
    // Initialize LLM with error handling
    try {
      this.llm = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: process.env.OPENAI_MODEL || 'gpt-4',
        temperature: 0.3, // Lower temperature for more consistent memory extraction
        maxTokens: 200,
      });
    } catch (error) {
      console.warn('ChatOpenAI initialization failed in memory service:', error.message);
      this.llm = null;
    }

    this.pool = pool;
    this.memoryBuffers = new Map(); // Cache for conversation memory buffers
  }

  /**
   * Extract and store memories from conversation
   */
  async extractAndStoreMemories(companionId, userId, conversationId, userMessage, aiResponse) {
    try {
      // Get existing memories for context
      const existingMemories = await this.getRelevantMemories(companionId, userId, 5);
      
      // Extract new memories
      const newMemories = await this.extractMemories(userMessage, aiResponse, existingMemories);
      
      // Store significant memories
      for (const memory of newMemories) {
        if (memory.importance >= 7) {
          await this.storeMemory(companionId, userId, memory);
        }
      }
      
      return newMemories;
    } catch (error) {
      console.error('Error extracting and storing memories:', error);
      return [];
    }
  }

  /**
   * Extract memories from conversation using LLM
   */
  async extractMemories(userMessage, aiResponse, existingMemories) {
    // Check if LangChain is available
    if (!this.llm || !ChatPromptTemplate) {
      throw new Error('LangChain components not available for memory extraction. Please check LangChain installation.');
    }

    const memoryPrompt = ChatPromptTemplate.fromTemplate(`
      Analyze this conversation and extract meaningful memories about the user.
      
      User: "{userMessage}"
      AI Response: "{aiResponse}"
      
      Existing memories: {existingMemories}
      
      Extract 1-3 significant memories that are worth remembering about this user.
      Focus on:
      - Personal preferences and interests
      - Emotional moments or significant experiences
      - Important relationships or life events
      - Goals, dreams, or aspirations
      - Unique personality traits or quirks
      
      Respond with ONLY a JSON array:
      [
        {{
          "type": "preference|experience|emotion|goal|fact",
          "content": "natural phrasing of what to remember",
          "importance": 1-10,
          "emotional_context": "why this is significant"
        }}
      ]
      
      Only include memories with importance >= 6. If no significant memories, return empty array [].
    `);

    const existingMemoriesText = existingMemories.length > 0 ? 
      existingMemories.map(m => `- ${m.content}`).join('\n') : 
      'No existing memories';

    const chain = memoryPrompt.pipe(this.llm).pipe(new StringOutputParser());
    
    try {
      const result = await chain.invoke({
        userMessage,
        aiResponse,
        existingMemories: existingMemoriesText
      });
      
      const memories = JSON.parse(result);
      return Array.isArray(memories) ? memories : [];
    } catch (error) {
      console.error('Error extracting memories:', error);
      throw error; // Don't fallback, let it fail
    }
  }


  /**
   * Hash UUID to integer for database storage
   */
  hashUserId(userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Store memory in database
   */
  async storeMemory(companionId, userId, memory) {
    try {
      // Convert UUID to integer hash for database storage
      const userIdHash = this.hashUserId(userId);
      
      await this.pool.execute(`
        INSERT INTO companion_memories 
        (companion_id, user_id, memory_type, content, importance_score, emotional_context, is_active)
        VALUES (?, ?, ?, ?, ?, ?, TRUE)
      `, [
        companionId,
        userIdHash,
        memory.type,
        memory.content,
        memory.importance,
        JSON.stringify(memory.emotional_context || {})
      ]);
      
      console.log(`Stored memory: ${memory.content.substring(0, 50)}...`);
    } catch (error) {
      console.error('Error storing memory:', error);
    }
  }

  /**
   * Get relevant memories for conversation context
   */
  async getRelevantMemories(companionId, userId, limit = 10) {
    try {
      const limitNum = parseInt(limit);
      const [memories] = await this.pool.query(`
        SELECT 
          id,
          memory_type,
          content,
          importance_score,
          emotional_context,
          created_at,
          last_accessed
        FROM companion_memories 
        WHERE companion_id = ? AND user_id = ? AND is_active = TRUE
        ORDER BY importance_score DESC, last_accessed DESC, created_at DESC
        LIMIT ${limitNum}
      `, [parseInt(companionId), this.hashUserId(userId)]);
      
      // Update last_accessed for retrieved memories
      if (memories.length > 0) {
        const memoryIds = memories.map(m => m.id);
        await this.pool.execute(`
          UPDATE companion_memories 
          SET last_accessed = NOW() 
          WHERE id IN (${memoryIds.map(() => '?').join(',')})
        `, memoryIds);
      }
      
      return memories;
    } catch (error) {
      console.error('Error getting relevant memories:', error);
      throw error; // Don't fallback, let it fail
    }
  }

  /**
   * Get memories by type
   */
  async getMemoriesByType(companionId, userId, memoryType, limit = 5) {
    try {
      const limitNum = parseInt(limit);
      const [memories] = await this.pool.query(`
        SELECT content, importance_score, emotional_context
        FROM companion_memories 
        WHERE companion_id = ? AND user_id = ? AND memory_type = ? AND is_active = TRUE
        ORDER BY importance_score DESC, created_at DESC
        LIMIT ${limitNum}
      `, [companionId, userId, memoryType]);
      
      return memories;
    } catch (error) {
      console.error('Error getting memories by type:', error);
      return [];
    }
  }

  /**
   * Update memory importance based on usage
   */
  async updateMemoryImportance(memoryId, newImportance) {
    try {
      await this.pool.execute(`
        UPDATE companion_memories 
        SET importance_score = ?, updated_at = NOW()
        WHERE id = ?
      `, [newImportance, memoryId]);
    } catch (error) {
      console.error('Error updating memory importance:', error);
    }
  }

  /**
   * Soft delete memory (mark as inactive)
   */
  async deleteMemory(memoryId) {
    try {
      await this.pool.execute(`
        UPDATE companion_memories 
        SET is_active = FALSE, updated_at = NOW()
        WHERE id = ?
      `, [memoryId]);
    } catch (error) {
      console.error('Error deleting memory:', error);
    }
  }

  /**
   * Get memory statistics for a user-companion pair
   */
  async getMemoryStats(companionId, userId) {
    try {
      const [stats] = await this.pool.execute(`
        SELECT 
          COUNT(*) as total_memories,
          COUNT(CASE WHEN memory_type = 'preference' THEN 1 END) as preferences,
          COUNT(CASE WHEN memory_type = 'experience' THEN 1 END) as experiences,
          COUNT(CASE WHEN memory_type = 'emotional_moment' THEN 1 END) as emotional_moments,
          COUNT(CASE WHEN memory_type = 'personal_revelation' THEN 1 END) as personal_revelations,
          COUNT(CASE WHEN memory_type = 'goal' THEN 1 END) as goals,
          COUNT(CASE WHEN memory_type = 'relationship' THEN 1 END) as relationships,
          AVG(importance_score) as avg_importance,
          MAX(created_at) as last_memory_created
        FROM companion_memories 
        WHERE companion_id = ? AND user_id = ? AND is_active = TRUE
      `, [companionId, userId]);
      
      return stats[0] || {
        total_memories: 0,
        preferences: 0,
        experiences: 0,
        emotional_moments: 0,
        personal_revelations: 0,
        goals: 0,
        relationships: 0,
        avg_importance: 0,
        last_memory_created: null
      };
    } catch (error) {
      console.error('Error getting memory stats:', error);
      return null;
    }
  }

  /**
   * Search memories by keywords
   */
  async searchMemories(companionId, userId, searchTerm, limit = 10) {
    try {
      const limitNum = parseInt(limit);
      const [memories] = await this.pool.query(`
        SELECT 
          id,
          memory_type,
          content,
          importance_score,
          emotional_context,
          created_at
        FROM companion_memories 
        WHERE companion_id = ? AND user_id = ? AND is_active = TRUE
        AND content LIKE ?
        ORDER BY importance_score DESC, created_at DESC
        LIMIT ${limitNum}
      `, [
        companionId, 
        userId, 
        `%${searchTerm}%`
      ]);
      
      return memories;
    } catch (error) {
      console.error('Error searching memories:', error);
      return [];
    }
  }

  /**
   * Get conversation memory buffer for LangChain
   * Note: Using simple Map-based memory buffer instead of BufferMemory for now
   */
  getMemoryBuffer(companionId, userId, conversationId) {
    const bufferKey = `${companionId}_${userId}_${conversationId}`;
    
    if (!this.memoryBuffers.has(bufferKey)) {
      // Simple memory buffer implementation
      const memory = {
        chatHistory: [],
        addMessage: function(role, content) {
          this.chatHistory.push({ role, content, timestamp: new Date() });
          // Keep only last 10 messages
          if (this.chatHistory.length > 10) {
            this.chatHistory = this.chatHistory.slice(-10);
          }
        },
        getMessages: function() {
          return this.chatHistory;
        },
        clear: function() {
          this.chatHistory = [];
        }
      };
      this.memoryBuffers.set(bufferKey, memory);
    }
    
    return this.memoryBuffers.get(bufferKey);
  }

  /**
   * Clear memory buffer
   */
  clearMemoryBuffer(companionId, userId, conversationId) {
    const bufferKey = `${companionId}_${userId}_${conversationId}`;
    this.memoryBuffers.delete(bufferKey);
  }

  /**
   * Clear all memory buffers
   */
  clearAllMemoryBuffers() {
    this.memoryBuffers.clear();
  }

  /**
   * Consolidate similar memories to prevent duplication
   */
  async consolidateMemories(companionId, userId) {
    try {
      const [similarMemories] = await this.pool.execute(`
        SELECT 
          id,
          content,
          importance_score,
          memory_type,
          created_at
        FROM companion_memories 
        WHERE companion_id = ? AND user_id = ? AND is_active = TRUE
        ORDER BY memory_type, created_at
      `, [companionId, userId]);
      
      const consolidated = [];
      const toDelete = [];
      
      for (let i = 0; i < similarMemories.length; i++) {
        const current = similarMemories[i];
        let isDuplicate = false;
        
        for (let j = i + 1; j < similarMemories.length; j++) {
          const next = similarMemories[j];
          
          if (current.memory_type === next.memory_type && 
              this.calculateSimilarity(current.content, next.content) > 0.8) {
            // Keep the more important memory
            if (current.importance_score >= next.importance_score) {
              toDelete.push(next.id);
            } else {
              toDelete.push(current.id);
              isDuplicate = true;
              break;
            }
          }
        }
        
        if (!isDuplicate) {
          consolidated.push(current);
        }
      }
      
      // Delete duplicate memories
      if (toDelete.length > 0) {
        await this.pool.execute(`
          UPDATE companion_memories 
          SET is_active = FALSE, updated_at = NOW()
          WHERE id IN (${toDelete.map(() => '?').join(',')})
        `, toDelete);
      }
      
      console.log(`Consolidated ${toDelete.length} duplicate memories`);
      return consolidated;
    } catch (error) {
      console.error('Error consolidating memories:', error);
      return [];
    }
  }

  /**
   * Calculate similarity between two memory contents
   */
  calculateSimilarity(content1, content2) {
    const words1 = content1.toLowerCase().split(/\s+/);
    const words2 = content2.toLowerCase().split(/\s+/);
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }
}

module.exports = new MemoryService();
