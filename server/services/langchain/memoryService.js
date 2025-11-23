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
const chromaMemoryService = require('../chromaMemoryService');
const claudeService = require('../claudeService');

/**
 * LangChain-based Memory Service for Amora AI Companions
 * Provides sophisticated memory management with extraction, storage, and retrieval
 */
class MemoryService {
  constructor() {
    // Try to use Claude first (if available), otherwise fallback to OpenAI
    this.useClaude = process.env.CLAUDE_API_KEY && claudeService.isAvailable();
    
    // Initialize LLM with error handling - only if not using Claude
    if (!this.useClaude) {
      try {
        if (ChatOpenAI && process.env.OPENAI_API_KEY) {
          this.llm = new ChatOpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: process.env.OPENAI_MODEL || 'gpt-4',
            temperature: 0.3, // Lower temperature for more consistent memory extraction
            maxTokens: 200,
          });
        } else {
          this.llm = null;
        }
      } catch (error) {
        console.warn('ChatOpenAI initialization failed in memory service:', error.message);
        this.llm = null;
      }
    } else {
      this.llm = null; // Using Claude instead
      console.log(`Memory extraction will use Claude (model: ${process.env.CLAUDE_MODEL || 'from env'})`);
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
      
      // Extract new memories (gracefully handles errors)
      let newMemories = [];
      try {
        newMemories = await this.extractMemories(userMessage, aiResponse, existingMemories);
      } catch (error) {
        console.warn('Memory extraction failed, continuing without new memories:', error.message);
        // Continue without new memories - don't block the conversation
        return [];
      }
      
      // Store significant memories
      console.log(`\n=== MEMORY STORAGE DEBUG ===`);
      console.log(`Extracted ${newMemories.length} memories`);
      newMemories.forEach((m, i) => {
        console.log(`Memory ${i + 1}: importance=${m.importance}, type=${m.type}, content="${m.content.substring(0, 50)}..."`);
      });
      
      let storedCount = 0;
      for (const memory of newMemories) {
        if (memory.importance >= 7) {
          console.log(`Storing memory with importance ${memory.importance}: "${memory.content.substring(0, 50)}..."`);
          // Store in database (SQL only - no Chroma/OpenAI needed)
          await this.storeMemory(companionId, userId, memory);
          storedCount++;
        } else {
          console.log(`Skipping memory with importance ${memory.importance} (need >= 7): "${memory.content.substring(0, 50)}..."`);
        }
      }
      console.log(`Stored ${storedCount} memories out of ${newMemories.length} extracted`);
      console.log(`=== END MEMORY STORAGE DEBUG ===\n`);
      
      return newMemories;
    } catch (error) {
      console.error('Error extracting and storing memories:', error);
      // Return empty array instead of throwing - don't block conversation
      return [];
    }
  }

  /**
   * Extract memories from conversation using LLM (Claude or OpenAI)
   */
  async extractMemories(userMessage, aiResponse, existingMemories) {
    const existingMemoriesText = existingMemories.length > 0 ? 
      existingMemories.map(m => `- ${m.content}`).join('\n') : 
      'No existing memories';

    const memoryPrompt = `Analyze this conversation and extract meaningful memories about the user.

User: "${userMessage}"
AI Response: "${aiResponse}"

Existing memories: ${existingMemoriesText}

Extract 1-3 memories that are worth remembering about this user. Be generous - extract memories even for simple mentions.
Focus on:
- Personal preferences and interests (e.g., favorite shows, movies, hobbies)
- Activities the user is doing (e.g., watching something, going somewhere)
- Emotional moments or significant experiences
- Important relationships or life events
- Goals, dreams, or aspirations
- Unique personality traits or quirks

IMPORTANT: If the user mentions ANY specific thing (show, movie, hobby, activity, preference), extract at least 1 memory about it.

Respond with ONLY a JSON array:
[
  {
    "type": "preference|experience|emotion|goal|fact",
    "content": "natural phrasing of what to remember",
    "importance": 6-10,
    "emotional_context": "why this is significant"
  }
]

Always return at least 1 memory if the user mentions something specific. Minimum importance: 6.`;

    // Use Claude if available, otherwise use OpenAI via LangChain
    if (this.useClaude && claudeService.isAvailable()) {
      try {
        console.log(`\n=== MEMORY EXTRACTION FROM CLAUDE ===`);
        console.log(`Prompt: ${memoryPrompt.substring(0, 200)}...`);
        // Use a higher token limit for memory extraction (needs more tokens for JSON)
        // Temporarily increase max_tokens for this call
        const originalMaxTokens = claudeService.maxTokens;
        claudeService.maxTokens = 500; // Increase for memory extraction (JSON needs more tokens)
        
        const response = await claudeService.generateResponse(
          [{ role: 'user', content: memoryPrompt }],
          'You are a helpful assistant that extracts meaningful memories from conversations. Always respond with valid JSON only. Keep emotional_context brief (1 sentence max).'
        );
        
        // Restore original max_tokens
        claudeService.maxTokens = originalMaxTokens;
        
        console.log(`Claude response (full): ${response}`);
        
        // Parse JSON from response - try multiple methods
        let memories = [];
        
        // Method 1: Try to find JSON array with regex (greedy match to end)
        // First, try to find the complete JSON array (may have extra content after)
        const jsonMatch = response.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          try {
            let jsonStr = jsonMatch[0];
            
            // Fix incomplete JSON strings (find unclosed quotes)
            // Look for strings that end without a closing quote before the next comma/brace
            jsonStr = jsonStr.replace(/("emotional_context"\s*:\s*"[^"]*?)(?=\s*[,}\]])/g, (match) => {
              // If the string doesn't end with a quote, add one
              if (!match.endsWith('"')) {
                return match + '"';
              }
              return match;
            });
            
            // Fix incomplete strings at the end
            if (jsonStr.match(/"[^"]*$/)) {
              jsonStr = jsonStr.replace(/("[^"]*)$/, '$1"');
            }
            
            // Count and close unclosed objects/arrays
            const openBraces = (jsonStr.match(/\{/g) || []).length;
            const closeBraces = (jsonStr.match(/\}/g) || []).length;
            const openBrackets = (jsonStr.match(/\[/g) || []).length;
            const closeBrackets = (jsonStr.match(/\]/g) || []).length;
            
            // Close unclosed objects/arrays
            for (let i = 0; i < openBraces - closeBraces; i++) {
              jsonStr += '}';
            }
            for (let i = 0; i < openBrackets - closeBrackets; i++) {
              jsonStr += ']';
            }
            
            memories = JSON.parse(jsonStr);
            console.log(`Method 1 (regex with repair): Parsed ${memories.length} memories`);
          } catch (parseError) {
            console.warn('Method 1 (regex) parse failed:', parseError.message);
            // Try to extract all complete memory objects from the response
            try {
              // Find all memory objects (they might be separated by commas or newlines)
              const memoryObjects = [];
              const memoryPattern = /\{\s*"type"\s*:\s*"([^"]+)",\s*"content"\s*:\s*"([^"]+)",\s*"importance"\s*:\s*(\d+)(?:,\s*"emotional_context"\s*:\s*"([^"]*)")?\s*\}/g;
              let match;
              while ((match = memoryPattern.exec(response)) !== null) {
                memoryObjects.push({
                  type: match[1],
                  content: match[2],
                  importance: parseInt(match[3]),
                  emotional_context: match[4] || ''
                });
              }
              
              if (memoryObjects.length > 0) {
                memories = memoryObjects;
                console.log(`Method 1 (regex extract): Extracted ${memories.length} complete memories`);
              } else {
                // Fallback: Extract just the first memory
                const firstMemoryMatch = response.match(/\{\s*"type"\s*:\s*"([^"]+)",\s*"content"\s*:\s*"([^"]+)",\s*"importance"\s*:\s*(\d+)/);
                if (firstMemoryMatch) {
                  memories = [{
                    type: firstMemoryMatch[1],
                    content: firstMemoryMatch[2],
                    importance: parseInt(firstMemoryMatch[3]),
                    emotional_context: ''
                  }];
                  console.log(`Method 1 (partial extract): Extracted 1 partial memory`);
                }
              }
            } catch (partialError) {
              console.warn('Partial extraction also failed:', partialError.message);
            }
          }
        }
        
        // Method 2: Try parsing the entire response as JSON
        if (memories.length === 0) {
          try {
            const trimmed = response.trim();
            // Remove markdown code blocks if present
            const cleaned = trimmed.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
            memories = JSON.parse(cleaned);
            console.log(`Method 2 (direct parse): Parsed ${memories.length} memories`);
          } catch (parseError) {
            console.warn('Method 2 (direct parse) failed:', parseError.message);
          }
        }
        
        // Method 3: Try to extract JSON from markdown code blocks
        if (memories.length === 0) {
          const codeBlockMatch = response.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
          if (codeBlockMatch) {
            try {
              memories = JSON.parse(codeBlockMatch[1]);
              console.log(`Method 3 (code block): Parsed ${memories.length} memories`);
            } catch (parseError) {
              console.warn('Method 3 (code block) parse failed:', parseError.message);
            }
          }
        }
        
        if (memories.length > 0 && Array.isArray(memories)) {
          console.log(`Successfully parsed ${memories.length} memories from Claude response`);
          console.log(`=== END MEMORY EXTRACTION FROM CLAUDE ===\n`);
          return memories;
        }
        
        console.warn('No valid JSON array found in Claude response after trying all methods');
        console.log(`Response was: ${response.substring(0, 200)}...`);
        console.log(`=== END MEMORY EXTRACTION FROM CLAUDE ===\n`);
        return [];
      } catch (error) {
        // Handle model not found or other Claude errors gracefully
        console.error('Error extracting memories with Claude:', error);
        if (error.status === 404) {
          console.warn('Claude model not found for memory extraction. Skipping memory extraction.');
        } else {
          console.error('Error extracting memories with Claude:', error.message);
        }
        console.log(`=== END MEMORY EXTRACTION FROM CLAUDE ===\n`);
        // Return empty array - don't break the conversation
        return [];
      }
    } else if (this.llm && ChatPromptTemplate) {
      // Use OpenAI via LangChain
      try {
        const promptTemplate = ChatPromptTemplate.fromTemplate(memoryPrompt);
        const chain = promptTemplate.pipe(this.llm).pipe(new StringOutputParser());
        
        const result = await chain.invoke({
          userMessage,
          aiResponse,
          existingMemories: existingMemoriesText
        });
        
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const memories = JSON.parse(jsonMatch[0]);
          return Array.isArray(memories) ? memories : [];
        }
        return [];
      } catch (error) {
        console.error('Error extracting memories with OpenAI:', error);
        // Don't throw - gracefully return empty array
        return [];
      }
    } else {
      // No LLM available - return empty array (memory extraction will be skipped)
      console.warn('No LLM available for memory extraction. Skipping memory extraction.');
      return [];
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
   * Store memory in database (SQL only)
   */
  async storeMemory(companionId, userId, memory) {
    let dbMemoryId = null;
    
    try {
      // Convert UUID to integer hash for database storage
      const userIdHash = this.hashUserId(userId);
      
      const [result] = await this.pool.execute(`
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
      
      dbMemoryId = result.insertId;
      console.log(`Stored memory in database: ${memory.content.substring(0, 50)}...`);
      
      // Also store in Chroma for semantic search (uses Hugging Face free embeddings)
      if (chromaMemoryService.isAvailable()) {
        try {
          console.log(`\n=== STORING MEMORY IN CHROMA ===`);
          console.log(`Memory: "${memory.content.substring(0, 50)}..."`);
          console.log(`companionId=${companionId}, userId=${userId}, dbMemoryId=${dbMemoryId}`);
          await chromaMemoryService.storeMemory(companionId, userId, memory, dbMemoryId);
          console.log(`Successfully stored memory in Chroma`);
          console.log(`=== END CHROMA STORAGE ===\n`);
        } catch (chromaError) {
          console.error('Failed to store memory in Chroma:', chromaError);
          console.error('Error details:', chromaError.message, chromaError.stack);
          // Continue even if Chroma fails
        }
      } else {
        console.warn('Chroma not available, skipping vector storage');
      }
    } catch (error) {
      console.error('Error storing memory:', error);
      throw error;
    }
    
    return dbMemoryId;
  }

  /**
   * Get relevant memories for conversation context
   * Tries Chroma semantic search first, falls back to SQL if unavailable
   */
  async getRelevantMemories(companionId, userId, limit = 10, query = '') {
    try {
      // Try Chroma semantic search first if available
      if (chromaMemoryService.isAvailable() && query) {
        try {
          const chromaResults = await chromaMemoryService.searchMemories(
            companionId,
            userId,
            query,
            limit
          );
          if (chromaResults && chromaResults.length > 0) {
            // Update last_accessed for retrieved memories
            const memoryIds = chromaResults.map(m => m.dbMemoryId).filter(id => id);
            if (memoryIds.length > 0) {
              await this.pool.execute(`
                UPDATE companion_memories 
                SET last_accessed = NOW() 
                WHERE id IN (${memoryIds.map(() => '?').join(',')})
              `, memoryIds);
            }
            return chromaResults.map(m => ({
              id: m.dbMemoryId,
              content: m.content,
              memory_type: m.memoryType,
              importance_score: m.importanceScore,
              relevance_score: m.relevanceScore
            }));
          }
        } catch (chromaError) {
          // Invalid API key or other embedding errors - gracefully fallback to SQL
          if (chromaError.message.includes('Invalid OpenAI API key')) {
            console.warn('⚠️  Chroma disabled due to invalid OpenAI API key. Using SQL-based memory search.');
          } else {
            console.debug('Chroma search failed (embedding service unavailable), falling back to SQL:', chromaError.message);
          }
        }
      }
      
      // Fallback to SQL-based retrieval
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
