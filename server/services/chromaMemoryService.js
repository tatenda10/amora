const { ChromaClient } = require('chromadb');
const OpenAI = require('openai');
const pool = require('../db/connection');

/**
 * Chroma Vector Memory Service
 * Provides semantic search for memories using Chroma (open source)
 * Uses OpenAI embeddings for high-quality semantic search
 */
class ChromaMemoryService {
  constructor() {
    // Initialize OpenAI for embeddings
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not found. Chroma embeddings will not be available. Falling back to SQL-based memory search.');
      this.openai = null;
      this.client = null;
      this.collection = null;
      return;
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Use text-embedding-3-small (cost-effective, high quality)
    this.embeddingModel = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
    this.dimension = 1536; // text-embedding-3-small dimension

    // Initialize Chroma client
    // Try to connect to Chroma server if available, otherwise use in-memory storage
    this.collectionName = 'companion_memories';
    this.collection = null;
    this.client = null;
    this.memories = new Map(); // In-memory storage for embeddings (fallback)
    this.initialized = false;
    
    // Try to initialize Chroma client (optional - will use in-memory if not available)
    if (process.env.CHROMA_SERVER_URL) {
      try {
        this.client = new ChromaClient({
          path: process.env.CHROMA_SERVER_URL
        });
        console.log(`Chroma client initialized (server mode: ${process.env.CHROMA_SERVER_URL})`);
      } catch (error) {
        console.warn('Chroma server connection failed, using in-memory mode:', error.message);
        this.client = null;
      }
    } else {
      console.log('✅ Chroma memory service initialized (in-memory mode - no server needed)');
      if (this.openai) {
        console.log(`   Using OpenAI embeddings: ${this.embeddingModel} (cost: ~$0.020 per 1M tokens)`);
      }
    }

    this.pool = pool;
  }

  /**
   * Check if Chroma is available
   */
  isAvailable() {
    return this.openai !== null;
  }

  /**
   * Initialize Chroma collection
   */
  async initializeCollection() {
    if (!this.isAvailable()) {
      throw new Error('Chroma service is not available.');
    }

    if (this.initialized) {
      return;
    }

    try {
      // Try to connect to Chroma server if available
      if (this.client) {
        try {
          // Check if collection exists
          const collections = await this.client.listCollections();
          const exists = collections.some(c => c.name === this.collectionName);

          if (!exists) {
            // Create collection
            this.collection = await this.client.createCollection({
              name: this.collectionName,
              metadata: { description: 'AI Companion Memories' }
            });
            console.log(`Created Chroma collection: ${this.collectionName}`);
          } else {
            // Get existing collection
            this.collection = await this.client.getCollection({
              name: this.collectionName
            });
            console.log(`Using existing Chroma collection: ${this.collectionName}`);
          }
        } catch (serverError) {
          // Server not available, use in-memory mode
          console.log('Chroma server not available, using in-memory storage');
          this.collection = null;
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing Chroma collection:', error);
      // Continue with in-memory mode
      this.collection = null;
      this.initialized = true;
    }
  }

  /**
   * Generate embedding for text using OpenAI embeddings API
   */
  async generateEmbedding(text) {
    if (!this.openai) {
      throw new Error('OpenAI client not available for embeddings. Check OPENAI_API_KEY.');
    }

    try {
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      // Handle invalid API key - disable Chroma to prevent repeated errors
      if (error.status === 401 || error.code === 'invalid_api_key') {
        console.error('❌ Invalid OpenAI API key. Chroma embeddings disabled. Falling back to SQL-based memory search.');
        console.error('   Please check your OPENAI_API_KEY in .env file.');
        // Disable Chroma to prevent repeated errors
        this.openai = null;
        throw new Error('Invalid OpenAI API key. Chroma disabled.');
      }
      console.error('Error generating embedding with OpenAI:', error.message);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Store memory in Chroma with vector embedding
   * @param {Number} companionId - Companion ID
   * @param {String} userId - User ID
   * @param {Object} memory - Memory object with content, type, importance, etc.
   * @param {Number} dbMemoryId - Database memory ID (for reference)
   */
  async storeMemory(companionId, userId, memory, dbMemoryId) {
    if (!this.isAvailable()) {
      console.warn('Chroma not available, skipping vector storage');
      return;
    }

    await this.initializeCollection();

    try {
      // Generate embedding for memory content
      const embedding = await this.generateEmbedding(memory.content);

      // Create unique ID
      const memoryId = `mem_${companionId}_${userId}_${dbMemoryId || Date.now()}`;

      // Store in Chroma if server is available
      if (this.collection) {
        await this.collection.add({
          ids: [memoryId],
          embeddings: [embedding],
          metadatas: [{
            companionId: companionId.toString(),
            userId: userId.toString(),
            memoryType: memory.type || 'general',
            content: memory.content.substring(0, 500), // Limit metadata size
            importanceScore: memory.importance || 5,
            dbMemoryId: dbMemoryId?.toString() || '',
            createdAt: new Date().toISOString(),
          }]
        });
        console.log(`Stored memory in Chroma: ${memoryId}`);
      } else {
        // Store in-memory
        this.memories.set(memoryId, {
          id: memoryId,
          embedding,
          metadata: {
            companionId: companionId.toString(),
            userId: userId.toString(),
            memoryType: memory.type || 'general',
            content: memory.content,
            importanceScore: memory.importance || 5,
            dbMemoryId: dbMemoryId?.toString() || '',
            createdAt: new Date().toISOString(),
          }
        });
        console.log(`Stored memory in-memory: ${memoryId}`);
        console.log(`DEBUG: Total memories in Map after storing: ${this.memories.size}`);
        console.log(`DEBUG: Memory content: "${memory.content.substring(0, 100)}..."`);
        console.log(`DEBUG: Memory metadata: companionId=${companionId.toString()}, userId=${userId.toString()}`);
      }

      return memoryId;
    } catch (error) {
      console.error('Error storing memory in Chroma:', error);
      throw error;
    }
  }

  /**
   * Search for relevant memories using semantic search
   * @param {Number} companionId - Companion ID
   * @param {String} userId - User ID
   * @param {String} query - Search query (user message or topic)
   * @param {Number} limit - Number of results to return
   * @returns {Array} Array of relevant memories with similarity scores
   */
  async searchMemories(companionId, userId, query, limit = 30) {
    if (!this.isAvailable()) {
      console.warn('Chroma not available, returning empty results');
      return [];
    }

    await this.initializeCollection();

    try {
      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query);

      let results = [];

      if (this.collection) {
        // Search in Chroma server
        const searchResults = await this.collection.query({
          queryEmbeddings: [queryEmbedding],
          nResults: limit,
          where: {
            $and: [
              { companionId: { $eq: companionId.toString() } },
              { userId: { $eq: userId.toString() } }
            ]
          }
        });

        // Format results
        if (searchResults.ids && searchResults.ids[0]) {
          results = searchResults.ids[0].map((id, index) => ({
            id,
            content: searchResults.metadatas[0][index]?.content || '',
            memoryType: searchResults.metadatas[0][index]?.memoryType || 'general',
            importanceScore: parseFloat(searchResults.metadatas[0][index]?.importanceScore || 5),
            relevanceScore: searchResults.distances?.[0]?.[index] ? 
              1 - searchResults.distances[0][index] : 0, // Convert distance to similarity
            dbMemoryId: searchResults.metadatas[0][index]?.dbMemoryId,
            createdAt: searchResults.metadatas[0][index]?.createdAt
          }));
        }
      } else {
        // Search in-memory
        console.log(`DEBUG: Total memories in Map: ${this.memories.size}`);
        console.log(`DEBUG: Searching for companionId=${companionId.toString()}, userId=${userId.toString()}`);
        
        const allMemories = Array.from(this.memories.values())
          .filter(m => {
            const matches = m.metadata.companionId === companionId.toString() &&
                          m.metadata.userId === userId.toString();
            if (!matches && this.memories.size < 10) {
              // Only log if we have few memories (to avoid spam)
              console.log(`DEBUG: Memory ${m.id} doesn't match: companionId=${m.metadata.companionId} (expected ${companionId.toString()}), userId=${m.metadata.userId} (expected ${userId.toString()})`);
            }
            return matches;
          });

        console.log(`DEBUG: Found ${allMemories.length} memories in-memory before similarity calculation`);
        if (allMemories.length > 0) {
          console.log(`DEBUG: Sample memory IDs: ${allMemories.slice(0, 3).map(m => m.id).join(', ')}`);
          console.log(`DEBUG: Sample memory contents: ${allMemories.slice(0, 2).map(m => `"${m.metadata.content.substring(0, 50)}..."`).join(', ')}`);
        } else {
          // Debug: Show all memories to understand why filtering failed
          if (this.memories.size > 0) {
            console.log(`DEBUG: All memories in Map:`);
            Array.from(this.memories.values()).slice(0, 5).forEach(m => {
              console.log(`  - ${m.id}: companionId=${m.metadata.companionId}, userId=${m.metadata.userId}, content="${m.metadata.content.substring(0, 50)}..."`);
            });
          }
        }

        // Calculate similarity for each memory
        const memoriesWithSimilarity = allMemories.map(m => {
          const similarity = this.cosineSimilarity(queryEmbedding, m.embedding);
          console.log(`DEBUG: Memory "${m.metadata.content.substring(0, 50)}..." similarity: ${similarity.toFixed(4)}`);
          return {
            ...m,
            similarity
          };
        });

        // Sort by similarity and take top results
        // No minimum threshold - return all matches sorted by similarity
        results = memoriesWithSimilarity
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, limit)
          .map(m => ({
            id: m.id,
            content: m.metadata.content,
            memoryType: m.metadata.memoryType,
            importanceScore: m.metadata.importanceScore,
            relevanceScore: m.similarity,
            dbMemoryId: m.metadata.dbMemoryId,
            createdAt: m.metadata.createdAt
          }));
        
        console.log(`DEBUG: After sorting and limiting (top ${limit}): ${results.length} results`);
      }

      console.log(`Found ${results.length} relevant memories from Chroma`);
      if (results.length === 0) {
        // Debug: Check if any memories exist for this user/companion
        if (this.collection) {
          try {
            const allMemories = await this.collection.get({
              where: {
                $and: [
                  { companionId: { $eq: companionId.toString() } },
                  { userId: { $eq: userId.toString() } }
                ]
              }
            });
            console.log(`DEBUG: Total memories in Chroma for companionId=${companionId}, userId=${userId}: ${allMemories.ids?.length || 0}`);
          } catch (debugError) {
            console.log(`DEBUG: Could not check total memories:`, debugError.message);
          }
        } else {
          // In-memory mode
          const allMemories = Array.from(this.memories.values())
            .filter(m => 
              m.metadata.companionId === companionId.toString() &&
              m.metadata.userId === userId.toString()
            );
          console.log(`DEBUG: Total memories in-memory for companionId=${companionId}, userId=${userId}: ${allMemories.length}`);
        }
      }
      return results;
    } catch (error) {
      console.error('Error searching memories in Chroma:', error);
      // Return empty array on error, will fallback to SQL
      return [];
    }
  }

  /**
   * Delete memory from Chroma
   */
  async deleteMemory(memoryId) {
    if (!this.collection) {
      // Remove from in-memory storage
      this.memories.delete(memoryId);
      return;
    }

    try {
      await this.collection.delete({
        ids: [memoryId]
      });
      console.log(`Deleted memory from Chroma: ${memoryId}`);
    } catch (error) {
      console.error('Error deleting memory from Chroma:', error);
      throw error;
    }
  }

  /**
   * Update memory in Chroma
   */
  async updateMemory(memoryId, updatedMemory) {
    await this.initializeCollection();

    try {
      // Generate new embedding if content changed
      const embedding = await this.generateEmbedding(updatedMemory.content);

      if (this.collection) {
        await this.collection.update({
          ids: [memoryId],
          embeddings: [embedding],
          metadatas: [{
            content: updatedMemory.content.substring(0, 500),
            importanceScore: updatedMemory.importance || 5,
          }]
        });
      } else {
        // Update in-memory
        const existing = this.memories.get(memoryId);
        if (existing) {
          existing.embedding = embedding;
          existing.metadata.content = updatedMemory.content;
          existing.metadata.importanceScore = updatedMemory.importance || 5;
        }
      }

      console.log(`Updated memory in Chroma: ${memoryId}`);
    } catch (error) {
      console.error('Error updating memory in Chroma:', error);
      throw error;
    }
  }

  /**
   * Get collection stats
   */
  async getStats() {
    await this.initializeCollection();

    if (this.collection) {
      const count = await this.collection.count();
      return { count, mode: 'server' };
    } else {
      return { count: this.memories.size, mode: 'in-memory' };
    }
  }
}

module.exports = new ChromaMemoryService();

