const pool = require('../db/connection');
const fs = require('fs');
const path = require('path');

class ProductionRAGService {
  constructor() {
    this.pool = pool; // Use centralized connection
    
    this.conversationIndex = new Map();
    this.vectorEmbeddings = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize RAG system with academic datasets
   */
  async initialize() {
    try {
      console.log('Initializing Production RAG Service...');
      
      // Create conversation patterns table
      await this.createConversationPatternsTable();
      
      // Load academic datasets
      await this.loadPersonaChatDataset();
      await this.loadDailyDialogDataset();
      await this.loadEmpatheticDialoguesDataset();
      await this.loadCornellMovieDataset();
      
      // Build conversation index
      await this.buildConversationIndex();
      
      this.isInitialized = true;
      console.log('RAG Service initialized successfully');
      
    } catch (error) {
      console.error('Error initializing RAG service:', error.message);
      throw error;
    }
  }

  /**
   * Create conversation patterns table
   */
  async createConversationPatternsTable() {
    try {
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS conversation_patterns (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_message TEXT NOT NULL,
          ai_response TEXT NOT NULL,
          context VARCHAR(100),
          emotion VARCHAR(50),
          dataset_source VARCHAR(50),
          confidence_score DECIMAL(3,2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_user_message (user_message(100)),
          INDEX idx_context (context),
          INDEX idx_emotion (emotion)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      
      console.log('Conversation patterns table created');
    } catch (error) {
      console.log('Error creating conversation patterns table:', error.message);
    }
  }

  /**
   * Load Persona-Chat dataset
   */
  async loadPersonaChatDataset() {
    try {
      const datasetPath = path.join(__dirname, '..', 'datasets', 'persona_chat.json');
      
      if (fs.existsSync(datasetPath)) {
        const data = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
        
        for (const conversation of data) {
          await this.pool.execute(
            'INSERT IGNORE INTO conversation_patterns (user_message, ai_response, context, emotion, dataset_source, confidence_score) VALUES (?, ?, ?, ?, ?, ?)',
            [
              conversation.user_message,
              conversation.ai_response,
              conversation.context || 'persona_chat',
              conversation.emotion || 'neutral',
              'persona_chat',
              0.9
            ]
          );
        }
        
        console.log(`Loaded ${data.length} Persona-Chat conversations`);
      } else {
        console.log('Persona-Chat dataset not found, creating sample data...');
        await this.createSamplePersonaChatData();
      }
    } catch (error) {
      console.log('Error loading Persona-Chat dataset:', error.message);
    }
  }

  /**
   * Load DailyDialog dataset
   */
  async loadDailyDialogDataset() {
    try {
      const datasetPath = path.join(__dirname, '..', 'datasets', 'daily_dialog.json');
      
      if (fs.existsSync(datasetPath)) {
        const data = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
        
        for (const conversation of data) {
          await this.pool.execute(
            'INSERT IGNORE INTO conversation_patterns (user_message, ai_response, context, emotion, dataset_source, confidence_score) VALUES (?, ?, ?, ?, ?, ?)',
            [
              conversation.user_message,
              conversation.ai_response,
              conversation.context || 'daily_dialog',
              conversation.emotion || 'neutral',
              'daily_dialog',
              0.85
            ]
          );
        }
        
        console.log(`Loaded ${data.length} DailyDialog conversations`);
      } else {
        console.log('DailyDialog dataset not found, creating sample data...');
        await this.createSampleDailyDialogData();
      }
    } catch (error) {
      console.log('Error loading DailyDialog dataset:', error.message);
    }
  }

  /**
   * Load EmpatheticDialogues dataset
   */
  async loadEmpatheticDialoguesDataset() {
    try {
      const datasetPath = path.join(__dirname, '..', 'datasets', 'empathetic_dialogues.json');
      
      if (fs.existsSync(datasetPath)) {
        const data = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
        
        for (const conversation of data) {
          await this.pool.execute(
            'INSERT IGNORE INTO conversation_patterns (user_message, ai_response, context, emotion, dataset_source, confidence_score) VALUES (?, ?, ?, ?, ?, ?)',
            [
              conversation.user_message,
              conversation.ai_response,
              conversation.context || 'empathetic',
              conversation.emotion || 'neutral',
              'empathetic_dialogues',
              0.95
            ]
          );
        }
        
        console.log(`Loaded ${data.length} EmpatheticDialogues conversations`);
      } else {
        console.log('EmpatheticDialogues dataset not found, creating sample data...');
        await this.createSampleEmpatheticData();
      }
    } catch (error) {
      console.log('Error loading EmpatheticDialogues dataset:', error.message);
    }
  }

  /**
   * Load Cornell Movie Dialog dataset
   */
  async loadCornellMovieDataset() {
    try {
      const datasetPath = path.join(__dirname, '..', 'datasets', 'cornell_movie.json');
      
      if (fs.existsSync(datasetPath)) {
        const data = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
        
        for (const conversation of data) {
          await this.pool.execute(
            'INSERT IGNORE INTO conversation_patterns (user_message, ai_response, context, emotion, dataset_source, confidence_score) VALUES (?, ?, ?, ?, ?, ?)',
            [
              conversation.user_message,
              conversation.ai_response,
              conversation.context || 'movie_dialog',
              conversation.emotion || 'neutral',
              'cornell_movie',
              0.8
            ]
          );
        }
        
        console.log(`Loaded ${data.length} Cornell Movie conversations`);
      } else {
        console.log('Cornell Movie dataset not found, creating sample data...');
        await this.createSampleCornellData();
      }
    } catch (error) {
      console.log('Error loading Cornell Movie dataset:', error.message);
    }
  }

  /**
   * Build conversation index for fast retrieval
   */
  async buildConversationIndex() {
    try {
      const [patterns] = await this.pool.execute(
        'SELECT user_message, ai_response, context, emotion, dataset_source, confidence_score FROM conversation_patterns'
      );
      
      for (const pattern of patterns) {
        const normalizedMessage = pattern.user_message.toLowerCase().trim();
        
        if (!this.conversationIndex.has(normalizedMessage)) {
          this.conversationIndex.set(normalizedMessage, []);
        }
        
        this.conversationIndex.get(normalizedMessage).push({
          response: pattern.ai_response,
          context: pattern.context,
          emotion: pattern.emotion,
          source: pattern.dataset_source,
          confidence: pattern.confidence_score
        });
      }
      
      console.log(`Built conversation index with ${patterns.length} patterns`);
    } catch (error) {
      console.log('Error building conversation index:', error.message);
    }
  }

  /**
   * Find similar conversations using multiple strategies
   */
  async findSimilarConversations(userMessage, context = "general", emotion = "neutral") {
    try {
      const normalizedMessage = userMessage.toLowerCase().trim();
      const results = [];
      
      // 1. Exact match
      if (this.conversationIndex.has(normalizedMessage)) {
        results.push(...this.conversationIndex.get(normalizedMessage));
      }
      
      // 2. Partial match
      for (const [key, patterns] of this.conversationIndex) {
        if (key.includes(normalizedMessage) || normalizedMessage.includes(key)) {
          results.push(...patterns);
        }
      }
      
      // 3. Context-based match
      if (results.length < 3) {
        const [contextMatches] = await this.pool.execute(
          'SELECT ai_response, context, emotion, dataset_source, confidence_score FROM conversation_patterns WHERE context = ? ORDER BY confidence_score DESC LIMIT 5',
          [context]
        );
        
        results.push(...contextMatches.map(match => ({
          response: match.ai_response,
          context: match.context,
          emotion: match.emotion,
          source: match.dataset_source,
          confidence: match.confidence_score
        })));
      }
      
      // 4. Emotion-based match
      if (results.length < 3) {
        const [emotionMatches] = await this.pool.execute(
          'SELECT ai_response, context, emotion, dataset_source, confidence_score FROM conversation_patterns WHERE emotion = ? ORDER BY confidence_score DESC LIMIT 5',
          [emotion]
        );
        
        results.push(...emotionMatches.map(match => ({
          response: match.ai_response,
          context: match.context,
          emotion: match.emotion,
          source: match.dataset_source,
          confidence: match.confidence_score
        })));
      }
      
      // Sort by confidence and remove duplicates
      const uniqueResults = results.filter((result, index, self) => 
        index === self.findIndex(r => r.response === result.response)
      );
      
      return uniqueResults.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
      
    } catch (error) {
      console.log('Error finding similar conversations:', error.message);
      return [];
    }
  }

  /**
   * Generate RAG response using academic datasets
   */
  async generateRAGResponse(userMessage, context = "general", emotion = "neutral") {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const similarConversations = await this.findSimilarConversations(userMessage, context, emotion);
      
      if (similarConversations.length === 0) {
        return null;
      }
      
      // Use the highest confidence response
      const bestMatch = similarConversations[0];
      
      // Add some variation based on dataset source
      const variations = this.getResponseVariations(bestMatch.response, bestMatch.source);
      const randomResponse = variations[Math.floor(Math.random() * variations.length)];
      
      return {
        response: randomResponse,
        confidence: bestMatch.confidence,
        source: bestMatch.source,
        context: bestMatch.context,
        emotion: bestMatch.emotion,
        examples: similarConversations.slice(0, 3)
      };
      
    } catch (error) {
      console.log('Error generating RAG response:', error.message);
      return null;
    }
  }

  /**
   * Get response variations based on dataset source
   */
  getResponseVariations(baseResponse, source) {
    const variations = {
      persona_chat: [
        baseResponse,
        baseResponse.replace(/!/g, '?'),
        baseResponse.replace(/\./g, '!')
      ],
      daily_dialog: [
        baseResponse,
        baseResponse.toLowerCase(),
        baseResponse.toUpperCase()
      ],
      empathetic_dialogues: [
        baseResponse,
        `I understand. ${baseResponse}`,
        `That sounds tough. ${baseResponse}`
      ],
      cornell_movie: [
        baseResponse,
        baseResponse.replace(/I/g, 'I'),
        baseResponse.replace(/you/g, 'you')
      ]
    };
    
    return variations[source] || [baseResponse];
  }

  /**
   * Create sample data for testing
   */
  async createSamplePersonaChatData() {
    const sampleData = [
      { user_message: "hie", ai_response: "hey!", context: "greeting", emotion: "happy" },
      { user_message: "hi", ai_response: "what's up?", context: "greeting", emotion: "neutral" },
      { user_message: "hello", ai_response: "hey there!", context: "greeting", emotion: "friendly" },
      { user_message: "how are you", ai_response: "good, you?", context: "checkin", emotion: "neutral" },
      { user_message: "what's up", ai_response: "not much, you?", context: "checkin", emotion: "casual" }
    ];
    
    for (const data of sampleData) {
      await this.pool.execute(
        'INSERT IGNORE INTO conversation_patterns (user_message, ai_response, context, emotion, dataset_source, confidence_score) VALUES (?, ?, ?, ?, ?, ?)',
        [data.user_message, data.ai_response, data.context, data.emotion, 'persona_chat', 0.9]
      );
    }
  }

  async createSampleDailyDialogData() {
    const sampleData = [
      { user_message: "good morning", ai_response: "morning!", context: "greeting", emotion: "friendly" },
      { user_message: "how was your day", ai_response: "it was alright, yours?", context: "day", emotion: "neutral" },
      { user_message: "what are you doing", ai_response: "just chilling, you?", context: "activity", emotion: "casual" }
    ];
    
    for (const data of sampleData) {
      await this.pool.execute(
        'INSERT IGNORE INTO conversation_patterns (user_message, ai_response, context, emotion, dataset_source, confidence_score) VALUES (?, ?, ?, ?, ?, ?)',
        [data.user_message, data.ai_response, data.context, data.emotion, 'daily_dialog', 0.85]
      );
    }
  }

  async createSampleEmpatheticData() {
    const sampleData = [
      { user_message: "i'm sad", ai_response: "i'm sorry to hear that. what's going on?", context: "empathetic", emotion: "sad" },
      { user_message: "i'm happy", ai_response: "that's great! what made you happy?", context: "empathetic", emotion: "happy" },
      { user_message: "i'm stressed", ai_response: "i understand. stress can be really tough.", context: "empathetic", emotion: "stressed" }
    ];
    
    for (const data of sampleData) {
      await this.pool.execute(
        'INSERT IGNORE INTO conversation_patterns (user_message, ai_response, context, emotion, dataset_source, confidence_score) VALUES (?, ?, ?, ?, ?, ?)',
        [data.user_message, data.ai_response, data.context, data.emotion, 'empathetic_dialogues', 0.95]
      );
    }
  }

  async createSampleCornellData() {
    const sampleData = [
      { user_message: "what's your favorite movie", ai_response: "i love action movies!", context: "movie_dialog", emotion: "excited" },
      { user_message: "have you seen any good movies", ai_response: "yeah, i watched a great one last week", context: "movie_dialog", emotion: "enthusiastic" }
    ];
    
    for (const data of sampleData) {
      await this.pool.execute(
        'INSERT IGNORE INTO conversation_patterns (user_message, ai_response, context, emotion, dataset_source, confidence_score) VALUES (?, ?, ?, ?, ?, ?)',
        [data.user_message, data.ai_response, data.context, data.emotion, 'cornell_movie', 0.8]
      );
    }
  }
}

module.exports = ProductionRAGService;
