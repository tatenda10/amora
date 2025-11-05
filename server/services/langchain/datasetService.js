const fs = require('fs');
const path = require('path');

/**
 * Dataset Service for managing conversation datasets
 * Handles both real and synthetic datasets for training AI responses
 */

class DatasetService {
  constructor() {
    this.datasetsPath = path.join(__dirname, '../../datasets');
    this.loadedDatasets = new Map();
    this.conversationPatterns = new Map();
  }

  /**
   * Load all available datasets
   */
  async loadAllDatasets() {
    try {
      const datasetFiles = fs.readdirSync(this.datasetsPath)
        .filter(file => file.endsWith('.json'));

      console.log(`📚 Loading ${datasetFiles.length} datasets...`);

      for (const file of datasetFiles) {
        await this.loadDataset(file);
      }

      this.buildConversationPatterns();
      console.log('✅ All datasets loaded successfully');
      
      return {
        totalDatasets: datasetFiles.length,
        totalConversations: this.getTotalConversations(),
        patterns: Array.from(this.conversationPatterns.keys())
      };
    } catch (error) {
      console.error('❌ Error loading datasets:', error);
      throw error;
    }
  }

  /**
   * Load a specific dataset
   */
  async loadDataset(filename) {
    try {
      const filePath = path.join(this.datasetsPath, filename);
      const rawData = fs.readFileSync(filePath, 'utf8');
      const conversations = JSON.parse(rawData);

      const datasetName = filename.replace('.json', '');
      this.loadedDatasets.set(datasetName, conversations);

      console.log(`✅ Loaded ${datasetName}: ${conversations.length} conversations`);
      
      return conversations;
    } catch (error) {
      console.error(`❌ Error loading dataset ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Build conversation patterns from loaded datasets
   */
  buildConversationPatterns() {
    this.conversationPatterns.clear();

    for (const [datasetName, conversations] of this.loadedDatasets) {
      conversations.forEach(conv => {
        const context = conv.context || 'general';
        const emotion = conv.emotion || 'neutral';
        const style = conv.style || 'default';

        if (!this.conversationPatterns.has(context)) {
          this.conversationPatterns.set(context, []);
        }

        this.conversationPatterns.get(context).push({
          userMessage: conv.user_message,
          aiResponse: conv.ai_response,
          emotion,
          style,
          dataset: datasetName
        });
      });
    }

    console.log(`🎯 Built ${this.conversationPatterns.size} conversation patterns`);
  }

  /**
   * Find similar conversation patterns
   */
  findSimilarPatterns(userMessage, context = null) {
    const patterns = [];
    
    // If context is specified, look in that context first
    if (context && this.conversationPatterns.has(context)) {
      const contextPatterns = this.conversationPatterns.get(context);
      patterns.push(...this.scoreSimilarity(userMessage, contextPatterns));
    }

    // Also search in general patterns
    if (this.conversationPatterns.has('general')) {
      const generalPatterns = this.conversationPatterns.get('general');
      patterns.push(...this.scoreSimilarity(userMessage, generalPatterns));
    }

    // Search in all other contexts
    for (const [ctx, ctxPatterns] of this.conversationPatterns) {
      if (ctx !== context && ctx !== 'general') {
        patterns.push(...this.scoreSimilarity(userMessage, ctxPatterns));
      }
    }

    // Sort by similarity score and return top matches
    return patterns
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  /**
   * Score similarity between user message and conversation patterns
   */
  scoreSimilarity(userMessage, patterns) {
    const userWords = userMessage.toLowerCase().split(/\s+/);
    
    return patterns.map(pattern => {
      const patternWords = pattern.userMessage.toLowerCase().split(/\s+/);
      const commonWords = userWords.filter(word => 
        patternWords.some(pWord => 
          pWord.includes(word) || word.includes(pWord)
        )
      );
      
      const score = commonWords.length / Math.max(userWords.length, patternWords.length);
      
      return {
        ...pattern,
        score,
        commonWords
      };
    }).filter(item => item.score > 0.1); // Only return patterns with some similarity
  }

  /**
   * Get conversation suggestions based on context
   */
  getConversationSuggestions(context, emotion = 'neutral', style = 'default') {
    const suggestions = [];
    
    for (const [ctx, patterns] of this.conversationPatterns) {
      if (ctx === context || context === 'general') {
        const filtered = patterns.filter(p => 
          p.emotion === emotion || emotion === 'neutral'
        );
        suggestions.push(...filtered);
      }
    }

    return suggestions.slice(0, 10);
  }

  /**
   * Get dataset statistics
   */
  getDatasetStats() {
    const stats = {
      totalDatasets: this.loadedDatasets.size,
      totalConversations: this.getTotalConversations(),
      contexts: Array.from(this.conversationPatterns.keys()),
      datasetBreakdown: {}
    };

    for (const [name, conversations] of this.loadedDatasets) {
      stats.datasetBreakdown[name] = {
        conversations: conversations.length,
        contexts: [...new Set(conversations.map(c => c.context))],
        emotions: [...new Set(conversations.map(c => c.emotion))]
      };
    }

    return stats;
  }

  /**
   * Get total number of conversations across all datasets
   */
  getTotalConversations() {
    let total = 0;
    for (const conversations of this.loadedDatasets.values()) {
      total += conversations.length;
    }
    return total;
  }

  /**
   * Add new conversation pattern (for learning)
   */
  addConversationPattern(userMessage, aiResponse, context = 'general', emotion = 'neutral', style = 'default') {
    if (!this.conversationPatterns.has(context)) {
      this.conversationPatterns.set(context, []);
    }

    this.conversationPatterns.get(context).push({
      userMessage,
      aiResponse,
      emotion,
      style,
      dataset: 'learned'
    });
  }

  /**
   * Export conversation patterns for training
   */
  exportPatternsForTraining() {
    const trainingData = [];
    
    for (const [context, patterns] of this.conversationPatterns) {
      patterns.forEach(pattern => {
        trainingData.push({
          input: pattern.userMessage,
          output: pattern.aiResponse,
          context,
          emotion: pattern.emotion,
          style: pattern.style
        });
      });
    }

    return trainingData;
  }
}

module.exports = DatasetService;
