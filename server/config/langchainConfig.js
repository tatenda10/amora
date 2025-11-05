/**
 * LangChain Configuration for Amora AI Companion
 * Centralized configuration for LangChain and LangGraph settings
 */

const langchainConfig = {
  // OpenAI Configuration
  openai: {
    model: process.env.OPENAI_MODEL || 'gpt-4',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 150,
    apiKey: process.env.OPENAI_API_KEY
  },

  // LangChain Service Configuration
  langchain: {
    // Conversation chain settings
    conversationChain: {
      maxHistoryLength: 10,
      memoryBufferSize: 1000,
      enableMemoryExtraction: true,
      enableStyleMirroring: true,
      enableEmotionalAttunement: true
    },

    // Memory settings
    memory: {
      maxMemoriesPerUser: 100,
      memoryImportanceThreshold: 6,
      enableMemoryConsolidation: true,
      consolidationSimilarityThreshold: 0.8,
      memoryTypes: [
        'preference',
        'experience', 
        'emotional_moment',
        'personal_revelation',
        'goal',
        'relationship'
      ]
    },

    // Response generation settings
    response: {
      enableEmojiIntegration: true,
      maxEmojiCount: 2,
      enableFollowUpQuestions: true,
      responseLengthLimit: 240,
      enableContentModeration: true
    }
  },

  // LangGraph Agent Configuration
  langgraph: {
    // Agent workflow settings
    workflow: {
      enableEmotionDetection: true,
      enableTopicAnalysis: true,
      enableResponseEnhancement: true,
      enableFollowUpGeneration: true,
      maxProcessingSteps: 10
    },

    // State management
    state: {
      enableStatePersistence: true,
      stateCacheSize: 50,
      stateCleanupInterval: 3600000 // 1 hour
    },

    // Node configuration
    nodes: {
      analyzeInput: {
        enabled: true,
        timeout: 5000
      },
      detectEmotion: {
        enabled: true,
        timeout: 10000,
        model: 'gpt-3.5-turbo'
      },
      analyzeTopic: {
        enabled: true,
        timeout: 8000,
        confidenceThreshold: 0.5
      },
      generateResponse: {
        enabled: true,
        timeout: 15000,
        retryAttempts: 2
      },
      enhanceResponse: {
        enabled: true,
        timeout: 5000
      },
      generateFollowUp: {
        enabled: true,
        timeout: 8000
      }
    }
  },

  // Tools Configuration
  tools: {
    // Available tools
    availableTools: [
      'search_memories',
      'get_user_preferences', 
      'get_conversation_history',
      'get_relationship_status',
      'update_relationship',
      'get_weather_info',
      'get_time_info',
      'calculate_something',
      'suggest_activity',
      'get_joke',
      'get_quote'
    ],

    // Tool categories
    categories: {
      memory: ['search_memories', 'get_user_preferences', 'get_conversation_history'],
      relationship: ['get_relationship_status', 'update_relationship'],
      content: ['get_weather_info', 'get_time_info', 'calculate_something'],
      entertainment: ['suggest_activity', 'get_joke', 'get_quote']
    },

    // Tool execution settings
    execution: {
      timeout: 10000,
      maxRetries: 2,
      enableParallelExecution: true
    }
  },

  // Caching Configuration
  cache: {
    // Conversation chain cache
    conversationChains: {
      enabled: true,
      maxSize: 100,
      ttl: 3600000, // 1 hour
      cleanupInterval: 1800000 // 30 minutes
    },

    // Agent cache
    agents: {
      enabled: true,
      maxSize: 50,
      ttl: 7200000, // 2 hours
      cleanupInterval: 3600000 // 1 hour
    },

    // Memory buffer cache
    memoryBuffers: {
      enabled: true,
      maxSize: 200,
      ttl: 1800000, // 30 minutes
      cleanupInterval: 900000 // 15 minutes
    }
  },

  // Performance Configuration
  performance: {
    // Request limits
    limits: {
      maxConcurrentRequests: 10,
      maxRequestsPerMinute: 60,
      maxRequestsPerHour: 1000
    },

    // Timeout settings
    timeouts: {
      totalRequestTimeout: 30000, // 30 seconds
      aiResponseTimeout: 20000, // 20 seconds
      memoryExtractionTimeout: 10000, // 10 seconds
      toolExecutionTimeout: 15000 // 15 seconds
    },

    // Monitoring
    monitoring: {
      enableMetrics: true,
      enableLogging: true,
      logLevel: process.env.LOG_LEVEL || 'info',
      enablePerformanceTracking: true
    }
  },

  // Security Configuration
  security: {
    // Content moderation
    contentModeration: {
      enabled: true,
      strictMode: false,
      enableUserInputModeration: true,
      enableAIResponseModeration: true
    },

    // Rate limiting
    rateLimiting: {
      enabled: true,
      windowMs: 60000, // 1 minute
      maxRequests: 60,
      skipSuccessfulRequests: false
    },

    // Input validation
    inputValidation: {
      enabled: true,
      maxMessageLength: 1000,
      allowedMessageTypes: ['text', 'image', 'audio'],
      sanitizeInput: true
    }
  },

  // Development Configuration
  development: {
    // Debug settings
    debug: {
      enabled: process.env.NODE_ENV === 'development',
      logRequests: true,
      logResponses: false,
      logMemoryOperations: true,
      logToolExecutions: true
    },

    // Testing
    testing: {
      enableMockResponses: false,
      mockResponseDelay: 1000,
      enableTestTools: true
    }
  }
};

/**
 * Get configuration for a specific section
 */
function getConfig(section) {
  return langchainConfig[section] || {};
}

/**
 * Get all configuration
 */
function getAllConfig() {
  return langchainConfig;
}

/**
 * Update configuration (for runtime changes)
 */
function updateConfig(section, updates) {
  if (langchainConfig[section]) {
    Object.assign(langchainConfig[section], updates);
    return true;
  }
  return false;
}

/**
 * Validate configuration
 */
function validateConfig() {
  const errors = [];

  // Validate OpenAI configuration
  if (!langchainConfig.openai.apiKey) {
    errors.push('OpenAI API key is required');
  }

  // Validate model settings
  if (langchainConfig.openai.temperature < 0 || langchainConfig.openai.temperature > 2) {
    errors.push('OpenAI temperature must be between 0 and 2');
  }

  if (langchainConfig.openai.maxTokens < 1 || langchainConfig.openai.maxTokens > 4000) {
    errors.push('OpenAI max tokens must be between 1 and 4000');
  }

  // Validate cache settings
  if (langchainConfig.cache.conversationChains.maxSize < 1) {
    errors.push('Conversation chains cache size must be at least 1');
  }

  // Validate performance settings
  if (langchainConfig.performance.limits.maxConcurrentRequests < 1) {
    errors.push('Max concurrent requests must be at least 1');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  getConfig,
  getAllConfig,
  updateConfig,
  validateConfig,
  langchainConfig
};
