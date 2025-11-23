const OpenAI = require('openai');
const pool = require('../db/connection');
const RAGService = require('./ragService');
const EnhancedContextService = require('./enhancedContextService');
const ContentModerationService = require('./contentModerationService');
const MultiLanguageService = require('./multiLanguageService');
const claudeService = require('./claudeService');
const chromaMemoryService = require('./chromaMemoryService');
const aiConfig = require('../config/aiCompanionConfig');
const { SIMPLE_GREETING_PROMPT, FULL_CONVERSATION_PROMPT } = require('./prompts/systemPromptTemplates');
const { HUMAN_RESPONSE_RULES, HUMAN_RESPONSE_EXAMPLES, CONVERSATIONAL_ENGAGEMENT, CONVERSATION_KEEPERS, SPECIFIC_TOPIC_ENGAGEMENT, FINAL_REMINDER } = require('./prompts/humanResponseRules');

/**
 * Enhanced OpenAI Service for AI Companions with Emoji Support
 */
class EnhancedOpenAIService {
  constructor() {
    // Get configuration from centralized config
    this.config = aiConfig.getAIConfig();
    
    // Use Claude exclusively - no OpenAI fallback
    this.useClaude = process.env.CLAUDE_API_KEY && (process.env.USE_CLAUDE !== 'false');
    if (this.useClaude && claudeService.isAvailable()) {
      const claudeModel = process.env.CLAUDE_MODEL || 'from env';
      console.log(`✅ Claude is enabled for AI responses (model: ${claudeModel}, Claude-only mode)`);
      // Don't initialize OpenAI - we're using Claude exclusively
      this.openai = null;
    } else {
      // Claude is required - don't fallback to OpenAI
      console.error('❌ CLAUDE_API_KEY is required. Please set it in your .env file.');
      this.openai = null;
      this.useClaude = false;
    }
    
    // AI Configuration from centralized config
    this.model = this.config.model;
    this.maxTokens = this.config.maxTokens;
    this.temperature = this.config.temperature;
    
    // Use centralized database connection pool
    this.pool = pool;
    
    // Initialize RAG service for conversation examples
    this.ragService = new RAGService();
    
    // Initialize enhanced context service for advanced features
    this.contextService = new EnhancedContextService();
    
    // Initialize content moderation service
    this.contentModeration = new ContentModerationService();
    
    // Initialize multi-language service
    this.multiLanguage = new MultiLanguageService();

    // Check if Chroma is available for semantic memory search
    this.useChroma = chromaMemoryService.isAvailable();
    if (this.useChroma) {
      console.log('✅ Chroma semantic memory search is enabled (free & open source)');
      // Initialize Chroma collection on startup
      chromaMemoryService.initializeCollection().catch(err => {
        console.error('Failed to initialize Chroma:', err);
        this.useChroma = false;
      });
    }

    // Store human response rules for easy access
    this.humanResponseRules = {
      rules: HUMAN_RESPONSE_RULES,
      examples: HUMAN_RESPONSE_EXAMPLES,
      engagement: CONVERSATIONAL_ENGAGEMENT,
      keepers: CONVERSATION_KEEPERS,
      topics: SPECIFIC_TOPIC_ENGAGEMENT,
      reminder: FINAL_REMINDER
    };

    // Emoji mapping for different emotional states and contexts
    this.emojiMap = {
      // Emotional states
      'happy': ['😊', '😄', '🙂', '🌟', '💫'],
      'excited': ['🎉', '😃', '🤩', '✨', '🔥'],
      'content': ['😌', '🌿', '☀️', '💖'],
      'calm': ['🌊', '🍃', '😊', '💙'],
      'thoughtful': ['🤔', '💭', '📚', '🔍'],
      'curious': ['🤨', '🔎', '💡', '❓'],
      'playful': ['😜', '😂', '🎈', '🤹'],
      'sad': ['😔', '💔', '🌧️', '🫂'],
      'frustrated': ['😤', '💢', '🌪️', '⚡'],
      'anxious': ['😰', '🌫️', '🌀', '⚠️'],
      'tired': ['😴', '💤', '🌙', '🛌'],
      'neutral': ['😐', '🔸', '⚪', '💠'],
      
      // Response tones
      'warm': ['💕', '🤗', '🌞', '💖'],
      'enthusiastic': ['🚀', '🎊', '⭐', '💥'],
      'supportive': ['🫂', '🤝', '💪', '🌟'],
      'playful': ['😄', '🎭', '🤹', '🌈'],
      'empathetic': ['💝', '🫶', '🌷', '💗'],
      'calm': ['🌊', '🍂', '🕊️', '💠'],
      'curious': ['🔍', '💭', '🤔', '💡'],
      
      // Topics and categories
      'work': ['💼', '📊', '🏢', '📈'],
      'entertainment': ['🎬', '🎮', '🎵', '🎭'],
      'food': ['🍕', '🍜', '🍦', '☕'],
      'travel': ['✈️', '🌍', '🗺️', '🧳'],
      'health': ['💪', '🏃', '🥗', '❤️'],
      'family': ['👨‍👩‍👧‍👦', '🏠', '💝', '🌻'],
      'relationships': ['💑', '💞', '🤝', '💕'],
      'hobbies': ['🎨', '🎸', '📸', '⚽'],
      'daily_life': ['📅', '🌞', '☀️', '🌙'],
      
      // General conversation
      'greeting': ['👋', '💫', '🌟', '😊'],
      'question': ['❓', '💭', '🤔', '🔎'],
      'agreement': ['✅', '👍', '💯', '👏'],
      'surprise': ['😲', '🤯', '🎊', '💫'],
      'celebration': ['🎉', '🥳', '🎊', '✨']
    };

    console.log('Enhanced OpenAI Service with Human Response Rules initialized successfully');
  }

  /**
   * Generate enhanced AI response with memory, emotions, and relationship awareness
   */
  async generateEnhancedCompanionResponse({ companionId, userMessage, conversationId, userId }) {
    try {
      console.log('=== ENHANCED AI RESPONSE GENERATION STARTED ===');
      
      // Validate required parameters
      if (!userMessage) {
        throw new Error('userMessage is required');
      }
      
      // Get companion details
      const companion = await this.getCompanionDetails(companionId);
      
      // Get user details (name)
      const userDetails = await this.getUserDetails(userId);
      
      // Get user profile data from signup (interests, country, preferences)
      const userProfile = await this.getUserProfileData(userId);
      
      // Get relationship progression
      const relationship = await this.getRelationshipProgression(userId, companionId);
      
      // === MULTI-LANGUAGE SUPPORT ===
      const detectedLanguage = this.multiLanguage.detectLanguage(userMessage);
      await this.multiLanguage.storeUserLanguagePreference(userId, detectedLanguage);
      
      // === CONTENT MODERATION (User Input Only) ===
      const userContentAnalysis = this.contentModeration.analyzeContent(userMessage, relationship.relationship_stage, userProfile);
      
      // Only intercept for extreme cases (hate speech, self-harm)
      if (userContentAnalysis.suggestedResponse && ['hate_speech', 'self_harm'].includes(userContentAnalysis.category)) {
        console.log('Using content moderation response for extreme case');
        await this.contentModeration.logModerationEvent(userId, conversationId, userMessage, userContentAnalysis, userContentAnalysis.suggestedResponse);
        
        return {
          content: userContentAnalysis.suggestedResponse,
          content_category: userContentAnalysis.category,
          severity_level: userContentAnalysis.severity,
          response_strategy: userContentAnalysis.responseStrategy,
          flags: userContentAnalysis.flags,
          detected_language: userContentAnalysis.detectedLanguage
        };
      }
      
      // Get user's current emotional state
      let emotionalState;
      try {
        emotionalState = await this.detectEmotionalState(userMessage, userId, companionId);
      } catch (error) {
        console.error('Error detecting emotional state, using default:', error.message);
        emotionalState = {
          state: 'calm',
          intensity: 5,
          context: 'Default emotional state',
          suggested_response_tone: 'warm',
          emoji_suggestions: ['😊']
        };
      }
      
      // Get relevant memories (filtered by time)
      const memories = await this.getRelevantMemories(companionId, userId, userMessage);
      const recentMemories = this.filterRecentMemories(memories);
      
      // Get conversation context (filtered by time)
      const conversationContext = await this.getConversationContext(conversationId);
      const recentConversationContext = this.filterRecentConversationContext(conversationContext);
      
      // === ENHANCED CONTEXT FEATURES ===
      
      // Initialize cultural context from user profile if not exists
      let culturalContext = await this.contextService.getUserCulturalContext(userId);
      if (!culturalContext && userProfile) {
        culturalContext = await this.contextService.initializeCulturalContextFromProfile(userId, userProfile);
      }
      
      // Track current topic and detect topic changes with interest consideration
      let topicHistory = [];
      let topicAnalysis = {
        topic: 'general',
        confidence: 0.1,
        isNewTopic: false,
        transitionType: 'continuation',
        matchedKeywords: [],
        topicDepth: 'shallow',
        interestMatch: false,
        priority: 'normal',
        engagementLevel: 'medium'
      };
      
      let userInterests = [];
      try {
        topicHistory = await this.contextService.getTopicHistory(conversationId);
        userInterests = userProfile ? userProfile.interests : [];
        topicAnalysis = this.contextService.detectTopicChangeWithInterests(userMessage, topicHistory, userInterests);
      } catch (error) {
        console.error('Error getting topic history, using default:', error.message);
      }
      
      // Track the new topic with interest priority
      if (topicAnalysis.isNewTopic) {
        try {
          await this.contextService.trackTopic(
            conversationId, 
            topicAnalysis.topic, 
            topicAnalysis.topic, 
            'neutral', 
            `User mentioned: ${userMessage.substring(0, 100)}${topicAnalysis.interestMatch ? ' (INTEREST MATCH!)' : ''}`
          );
        } catch (error) {
          console.error('Error tracking topic:', error.message);
        }
      }
      
      // Learn user communication style from their message
      let userStyle = {
        formality_level: 'casual',
        humor_preference: 'friendly',
        emoji_usage: 'light',
        emotional_expression: 'moderate',
        response_length: 'medium'
      };
      
      try {
        await this.contextService.updateCommunicationStyle(userId, companionId, userMessage);
        userStyle = await this.contextService.getUserCommunicationStyle(userId, companionId);
      } catch (error) {
        console.error('Error updating communication style, using default:', error.message);
      }
      
      // Handle topic transitions if detected
      let transitionPhrase = '';
      if (topicAnalysis.isNewTopic && topicHistory.length > 0) {
        const lastTopic = topicHistory[0];
        const transitionResult = await this.contextService.handleTopicTransition(
          conversationId,
          lastTopic.topic_name,
          topicAnalysis.topic,
          topicAnalysis.transitionType,
          userMessage
        );
        
        if (transitionResult.success) {
          transitionPhrase = this.contextService.generateTransitionPhrase(
            lastTopic.topic_name,
            topicAnalysis.topic,
            userStyle,
            culturalContext
          );
        }
      }
      
      // Get RAG examples to guide ChatGPT responses
      const ragExamples = await this.ragService.findSimilarConversations(
        userMessage, 
        'greeting', 
        emotionalState.state
      );
      
      // Get recent conversation history
      const conversationHistory = await this.getConversationHistory(conversationId);
      
      // Build enhanced system prompt with multi-language support
      const systemPrompt = this.buildEnhancedSystemPrompt(
        companion,
        userDetails,
        emotionalState,
        relationship,
        recentMemories,
        recentConversationContext,
        ragExamples,
        userMessage,
        conversationHistory,
        userStyle,
        culturalContext,
        topicAnalysis,
        transitionPhrase,
        userProfile,
        detectedLanguage
      );
      
      // Build conversation messages
      const messages = this.buildEnhancedConversationMessages(
        systemPrompt,
        conversationHistory,
        userMessage,
        emotionalState,
        userDetails
      );
      
      // Generate AI response - Use Claude if available, otherwise OpenAI
      let rawAIResponse;
      if (this.useClaude && claudeService.isAvailable()) {
        // Use Claude for better human-like conversations
        rawAIResponse = await claudeService.generateResponse(messages, systemPrompt);
      } else {
        // Fallback to OpenAI
        const completion = await this.openai.chat.completions.create({
          model: this.model,
          messages,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          user: userId.toString(),
        });
        rawAIResponse = completion.choices[0].message.content;
      }
      
      // Add emojis to the raw response based on context
      const responseWithEmojis = await this.addContextualEmojis(
        rawAIResponse,
        emotionalState,
        topicAnalysis,
        userStyle,
        relationship
      );
      
      // Check if conversation is dying off and enhance response
      const enhancedResponse = await this.enhanceConversationFlow(
        responseWithEmojis,
        userMessage,
        memories,
        emotionalState,
        relationship,
        companion,
        topicAnalysis,
        userInterests
      );
      
      // Simple validation - just remove AI references
      const aiResponse = aiConfig.validateAIResponse(enhancedResponse, {
        emotionalState,
        relationship,
        memories
      });
      
      // === AI RESPONSE MODERATION ===
      const aiResponseAnalysis = this.contentModeration.analyzeContent(aiResponse, relationship.relationship_stage, userProfile);
      
      // If AI response is inappropriate, replace it with a safe response
      let finalResponse = aiResponse;
      if (aiResponseAnalysis.suggestedResponse) {
        console.log('Replacing inappropriate AI response');
        finalResponse = aiResponseAnalysis.suggestedResponse;
        await this.contentModeration.logModerationEvent(userId, conversationId, aiResponse, aiResponseAnalysis, finalResponse);
      }
      
      // Update conversation context
      await this.updateConversationContext(conversationId, userMessage, finalResponse, emotionalState);
      
      // Process and store new memories from this interaction
      await this.processAndStoreMemories(companionId, userId, userMessage, finalResponse, emotionalState);
      
      // Update relationship progression
      await this.updateRelationshipProgression(userId, companionId, emotionalState, userMessage);
      
      console.log('=== ENHANCED AI RESPONSE GENERATION COMPLETED ===');
      
      const result = {
        content: finalResponse,
        companionName: companion.name,
        usage: completion.usage,
        emotionalState: emotionalState,
        relationshipStage: relationship.relationship_stage,
        memoriesTriggered: memories.length,
        topicAnalysis: topicAnalysis
      };
      
      return result;
      
    } catch (error) {
      console.error('Failed to generate enhanced AI response:', error);
      throw new Error(`Failed to generate enhanced AI response: ${error.message}`);
    }
  }

  /**
   * Enhanced system prompt builder with human response rules integration
   */
  buildEnhancedSystemPrompt(companion, userDetails, emotionalState, relationship, memories, conversationContext, ragExamples = [], userMessage = '', conversationHistory = [], userStyle = null, culturalContext = null, topicAnalysis = null, transitionPhrase = '', userProfile = null, detectedLanguage = 'en') {
    const userName = userDetails.name || 'Friend';
    
    // Memory context - only mention if we have recent memories
    const memoryContext = memories.length > 0 ? 
      `\nTHINGS I REMEMBER ABOUT ${userName.toUpperCase()}:\n${memories.slice(0, 3).map(m => `- ${m.content}`).join('\n')}` : 
      '';
    
    // Emotional context - keep it natural with emoji suggestions
    const emotionalContext = `\n${userName} seems ${emotionalState.state} right now ${this.getEmojiForState(emotionalState.state)}. Respond with a ${emotionalState.suggested_response_tone} tone.`;
    
    // Emoji usage guidance based on user style
    const emojiGuidance = userStyle ? 
      `\nEMOJI PREFERENCE: ${userStyle.emoji_usage} - ${this.getEmojiUsageGuidance(userStyle.emoji_usage)}` :
      `\nEMOJI PREFERENCE: unknown - use emojis naturally like a human would text`;
    
    // Recent conversation context - only last few messages
    const recentHistory = this.filterRelevantConversationHistory(conversationHistory, userMessage, userName, companion.name);
    const historyStr = recentHistory ? `\nRECENT CHAT:\n${recentHistory}\n` : '';
    
    // User communication style adaptation
    const styleContext = userStyle ? 
      `\n${userName}'s STYLE:\n- Formality: ${userStyle.formality_level}\n- Humor: ${userStyle.humor_preference}\n- Response Length: ${userStyle.response_length_preference}\n- Uses ${userStyle.emoji_usage} emojis\n- Emotional Expression: ${userStyle.emotional_expression}` : 
      '';
    
    // Topic context with specific engagement guidance
    const topicContext = topicAnalysis ? 
      `\nCURRENT TOPIC: ${topicAnalysis.topic}${topicAnalysis.interestMatch ? ' (they love this!)' : ''} ${this.getEmojiForTopic(topicAnalysis.topic)}\n${this.getTopicSpecificGuidance(topicAnalysis.topic)}` : 
      '';
    
    // User profile context
    const userProfileContext = userProfile ? 
      `\n${userName}'s PROFILE:\n- From: ${userProfile.country || 'Unknown'}\n- Interests: ${userProfile.interests ? userProfile.interests.join(', ') : 'general'}\n- Age: ${userProfile.age || 'unknown'}\n- Looking for: ${userProfile.lookingFor ? JSON.stringify(userProfile.lookingFor) : 'friendship'}` : 
      '';
    
    // Enhanced conversation flow guidance
    const conversationGuidance = this.buildConversationGuidance(topicAnalysis, emotionalState, relationship, userStyle);
    
    const additionalContext = `${historyStr}${memoryContext}${emotionalContext}${emojiGuidance}${styleContext}${topicContext}${userProfileContext}${conversationGuidance}`;
    
    // Check if this is a simple greeting
    const isSimpleGreeting = this.isSimpleGreeting(userMessage);
    
    if (isSimpleGreeting) {
      return SIMPLE_GREETING_PROMPT(companion, userDetails);
    }
    
    return FULL_CONVERSATION_PROMPT(companion, userDetails, additionalContext, '');
  }

  /**
   * Build conversation guidance using human response rules
   */
  buildConversationGuidance(topicAnalysis, emotionalState, relationship, userStyle) {
    const guidance = [];
    
    // Add human response rules
    guidance.push(`\nHUMAN RESPONSE RULES:\n${this.humanResponseRules.rules}`);
    
    // Add conversation engagement strategies
    guidance.push(`\nCONVERSATION STRATEGIES:\n${this.humanResponseRules.engagement}`);
    
    // Add conversation keepers for when conversation might die
    guidance.push(`\nCONVERSATION KEEPERS:\n${this.humanResponseRules.keepers}`);
    
    // Add relationship-specific guidance
    guidance.push(this.getRelationshipGuidance(relationship));
    
    // Add emotional tone guidance
    guidance.push(this.getEmotionalGuidance(emotionalState));
    
    return guidance.join('\n');
  }

  /**
   * Get relationship-specific guidance
   */
  getRelationshipGuidance(relationship) {
    const stage = relationship.relationship_stage;
    
    const guidance = {
      'stranger': `\nRELATIONSHIP: Just met - be warm but respectful, ask open-ended questions, don't get too personal`,
      'acquaintance': `\nRELATIONSHIP: Getting to know each other - share a bit more about yourself, find common interests`,
      'friend': `\nRELATIONSHIP: Friends - be more casual, share personal experiences, use inside jokes if you have them`,
      'close_friend': `\nRELATIONSHIP: Close friends - be vulnerable, share deeper thoughts, be supportive and understanding`,
      'intimate': `\nRELATIONSHIP: Intimate connection - be emotionally open, share personal feelings, be deeply supportive`
    };
    
    return guidance[stage] || guidance['stranger'];
  }

  /**
   * Get emotional tone guidance
   */
  getEmotionalGuidance(emotionalState) {
    const tone = emotionalState.suggested_response_tone;
    
    const guidance = {
      'warm': `\nEMOTIONAL TONE: Be warm and caring - use supportive language, show genuine interest`,
      'enthusiastic': `\nEMOTIONAL TONE: Be enthusiastic and excited - match their energy, share their excitement`,
      'supportive': `\nEMOTIONAL TONE: Be supportive and understanding - validate their feelings, offer comfort`,
      'playful': `\nEMOTIONAL TONE: Be playful and lighthearted - use humor, be fun and engaging`,
      'empathetic': `\nEMOTIONAL TONE: Be empathetic and compassionate - show deep understanding, be gentle`,
      'calm': `\nEMOTIONAL TONE: Be calm and reassuring - maintain peaceful energy, be a steady presence`,
      'curious': `\nEMOTIONAL TONE: Be curious and interested - ask thoughtful questions, show genuine curiosity`
    };
    
    return guidance[tone] || guidance['warm'];
  }

  /**
   * Get topic-specific engagement guidance
   */
  getTopicSpecificGuidance(topic) {
    const topicGuidance = {
      'work': `TOPIC GUIDANCE: Ask about specific projects, challenges, colleagues. Share work experiences. Focus on achievements and learning.`,
      'entertainment': `TOPIC GUIDANCE: Reference specific characters, plot points, scenes. Share your favorite moments. Ask about their opinions and preferences.`,
      'food': `TOPIC GUIDANCE: Ask about specific dishes, restaurants, cooking experiences. Share food memories. Discuss flavors and cultural aspects.`,
      'travel': `TOPIC GUIDANCE: Ask about specific destinations, experiences, memories. Share travel stories. Discuss cultural differences and adventures.`,
      'health': `TOPIC GUIDANCE: Be supportive and understanding. Share healthy habits. Focus on wellbeing and self-care.`,
      'family': `TOPIC GUIDANCE: Be respectful and caring. Share family stories if appropriate. Show understanding of family dynamics.`,
      'relationships': `TOPIC GUIDANCE: Be empathetic and non-judgmental. Share relatable experiences. Offer support and understanding.`,
      'hobbies': `TOPIC GUIDANCE: Show genuine interest in their passions. Ask about specific techniques, equipment, achievements. Share your own hobby experiences.`
    };
    
    return topicGuidance[topic] || `TOPIC GUIDANCE: Show genuine interest, ask specific questions, share relevant experiences.`;
  }

  /**
   * Add contextual emojis to AI responses
   */
  async addContextualEmojis(response, emotionalState, topicAnalysis, userStyle, relationship) {
    try {
      // Check if user prefers emojis
      const userPrefersEmojis = userStyle?.emoji_usage !== 'none';
      if (!userPrefersEmojis) return response;
      
      // Determine emoji intensity based on user style and relationship
      let emojiIntensity = 'light';
      if (userStyle?.emoji_usage === 'heavy') {
        emojiIntensity = 'heavy';
      } else if (relationship.intimacy_level >= 7) {
        emojiIntensity = 'medium';
      }
      
      // Get appropriate emojis for the context
      const emojis = this.getContextualEmojis(emotionalState, topicAnalysis, emojiIntensity);
      
      if (emojis.length === 0) return response;
      
      // Add emojis to the response (natural placement)
      return this.placeEmojisNaturally(response, emojis, emojiIntensity);
      
    } catch (error) {
      console.error('Error adding emojis:', error);
      return response;
    }
  }

  /**
   * Get contextual emojis based on emotional state and topic
   */
  getContextualEmojis(emotionalState, topicAnalysis, intensity = 'light') {
    const emojis = [];
    
    // Add emotional state emojis
    if (emotionalState && this.emojiMap[emotionalState.state]) {
      const emotionEmojis = this.emojiMap[emotionalState.state];
      const count = intensity === 'heavy' ? 2 : 1;
      emojis.push(...emotionEmojis.slice(0, count));
    }
    
    // Add topic emojis
    if (topicAnalysis && this.emojiMap[topicAnalysis.topic]) {
      const topicEmojis = this.emojiMap[topicAnalysis.topic];
      emojis.push(topicEmojis[0]);
    }
    
    // Add response tone emojis
    if (emotionalState && this.emojiMap[emotionalState.suggested_response_tone]) {
      const toneEmojis = this.emojiMap[emotionalState.suggested_response_tone];
      emojis.push(toneEmojis[0]);
    }
    
    // Remove duplicates and limit based on intensity
    const uniqueEmojis = [...new Set(emojis)];
    
    switch (intensity) {
      case 'light': return uniqueEmojis.slice(0, 1);
      case 'medium': return uniqueEmojis.slice(0, 2);
      case 'heavy': return uniqueEmojis.slice(0, 3);
      default: return uniqueEmojis.slice(0, 1);
    }
  }

  /**
   * Place emojis naturally in the response
   */
  placeEmojisNaturally(response, emojis, intensity) {
    if (!emojis || emojis.length === 0) return response;
    
    const sentences = response.split(/(?<=[.!?])\s+/);
    let enhancedResponse = response;
    
    if (sentences.length === 1) {
      // Single sentence - add emoji at the end
      enhancedResponse = `${response} ${emojis[0]}`;
    } else {
      // Multiple sentences - add emojis strategically
      const emojiCount = Math.min(emojis.length, intensity === 'heavy' ? 3 : intensity === 'medium' ? 2 : 1);
      
      if (emojiCount === 1) {
        // One emoji at the end
        enhancedResponse = `${response} ${emojis[0]}`;
      } else {
        // Multiple emojis - one at key points
        const lastSentenceIndex = sentences.length - 1;
        const midSentenceIndex = Math.floor(sentences.length / 2);
        
        sentences[lastSentenceIndex] = `${sentences[lastSentenceIndex]} ${emojis[0]}`;
        if (emojiCount >= 2 && midSentenceIndex !== lastSentenceIndex) {
          sentences[midSentenceIndex] = `${sentences[midSentenceIndex]} ${emojis[1]}`;
        }
        
        enhancedResponse = sentences.join(' ');
      }
    }
    
    return enhancedResponse;
  }

  /**
   * Enhanced conversation flow with human response rules integration
   */
  async enhanceConversationFlow(rawResponse, userMessage, memories, emotionalState, relationship, companion, topicAnalysis, userInterests = []) {
    try {
      // Check if the response seems like it's ending the conversation
      const conversationEndingPhrases = [
        /hope.*goes well/gi,
        /hope.*continues/gi,
        /that's cool/gi,
        /that's nice/gi,
        /that's great/gi,
        /good luck/gi,
        /take care/gi,
        /have a good/gi,
        /hope you have/gi,
        /wish you/gi,
        /sounds good/gi,
        /sounds great/gi,
        /sounds cool/gi,
        /anyway.*bye/gi,
        /talk to you later/gi,
        /catch you later/gi
      ];
      
      const isEndingConversation = conversationEndingPhrases.some(phrase => phrase.test(rawResponse));
      
      // Also check if response violates human response rules
      const violatesHumanRules = this.checkHumanResponseViolations(rawResponse);
      
      // Check if response is too short or lacks engagement
      const isTooShort = rawResponse.length < 20;
      const lacksQuestions = !rawResponse.includes('?');
      const isGeneric = /(okay|alright|nice|cool|great|good)/gi.test(rawResponse) && rawResponse.length < 30;
      
      if (isEndingConversation || violatesHumanRules || (isTooShort && lacksQuestions) || isGeneric) {
        console.log('=== CONVERSATION NEEDS ENHANCEMENT ===');
        
        // Get conversation keepers for this context
        const conversationKeepers = this.getRelevantConversationKeepers(topicAnalysis, emotionalState, userInterests);
        
        // Generate engaging follow-up based on context
        const engagementPrompt = this.buildEnhancedEngagementPrompt(
          rawResponse,
          userMessage,
          userInterests,
          emotionalState,
          relationship,
          topicAnalysis,
          companion,
          conversationKeepers,
          violatesHumanRules
        );
        
        let enhancedResponse;
        if (this.useClaude && claudeService.isAvailable()) {
          // Use Claude for engagement enhancement
          enhancedResponse = await claudeService.generateResponse(
            [{ role: 'user', content: engagementPrompt }],
            'You are a helpful assistant that enhances conversation engagement. Keep responses short and natural (max 80 tokens).'
          );
          enhancedResponse = enhancedResponse.trim();
        } else if (this.openai) {
          // Fallback to OpenAI
          const completion = await this.openai.chat.completions.create({
            model: this.model,
            messages: [{ role: 'user', content: engagementPrompt }],
            max_tokens: 80,
            temperature: 0.7,
          });
          enhancedResponse = completion.choices[0].message.content.trim();
        } else {
          // No AI service available, return original response
          enhancedResponse = rawResponse;
        }
        
        // Add emojis to enhanced response
        enhancedResponse = await this.addContextualEmojis(
          enhancedResponse,
          emotionalState,
          topicAnalysis,
          await this.contextService.getUserCommunicationStyle(relationship.user_id, companion.id),
          relationship
        );
        
        console.log('Enhanced response:', enhancedResponse);
        
        return enhancedResponse;
      }
      
      return rawResponse;
      
    } catch (error) {
      console.log('Error enhancing conversation flow:', error.message);
      return rawResponse;
    }
  }

  /**
   * Check if response violates human response rules
   */
  checkHumanResponseViolations(response) {
    const violations = [
      /hope.*goes well/gi,
      /that's cool/gi,
      /that's nice/gi,
      /sounds good/gi,
      /i understand/gi,
      /that must be/i,
      /as an ai/gi,
      /as a language model/gi,
      /i'm an ai/gi,
      /i cannot/i,
      /i don't have/i,
      /i don't experience/i
    ];
    
    return violations.some(pattern => pattern.test(response));
  }

  /**
   * Get relevant conversation keepers for the current context
   */
  getRelevantConversationKeepers(topicAnalysis, emotionalState, userInterests) {
    const keepers = [];
    
    // Base conversation keepers
    keepers.push(...[
      "What are you up to now?",
      "What did you eat today?",
      "What are you watching/reading/listening to?",
      "How's work/school going?",
      "Any plans for later?",
      "What's your favorite [something they mentioned]?",
      "Tell me more about that!",
      "That sounds interesting!"
    ]);
    
    // Topic-specific keepers
    if (topicAnalysis) {
      switch (topicAnalysis.topic) {
        case 'work':
          keepers.push("What's the most challenging part of your work right now?", "Working on any exciting projects?");
          break;
        case 'entertainment':
          keepers.push("What shows are you really into right now?", "Any movies that really surprised you recently?");
          break;
        case 'food':
          keepers.push("What's your go-to comfort food?", "Any cooking disasters or successes lately?");
          break;
        case 'travel':
          keepers.push("What's your dream destination?", "Any memorable travel stories?");
          break;
      }
    }
    
    // Emotional state keepers
    if (emotionalState.intensity > 7) {
      if (['happy', 'excited'].includes(emotionalState.state)) {
        keepers.push("That's amazing! How did that make you feel?", "I'm so happy for you! Tell me more!");
      } else if (['sad', 'frustrated', 'anxious'].includes(emotionalState.state)) {
        keepers.push("That sounds really tough. Want to talk about it more?", "I'm here for you. What can I do to help?");
      }
    }
    
    return keepers.slice(0, 5); // Return top 5 most relevant keepers
  }

  /**
   * Build enhanced engagement prompt with human response rules
   */
  buildEnhancedEngagementPrompt(rawResponse, userMessage, interests, emotionalState, relationship, topicAnalysis, companion, conversationKeepers, hasViolations) {
    const interestContext = interests.length > 0 ? 
      `User interests: ${interests.slice(0, 3).join(', ')}` : 
      'No specific interests known yet';
    
    const topicContext = topicAnalysis ? 
      `Current topic: ${topicAnalysis.topic} (${topicAnalysis.interestMatch ? 'matches their interests!' : 'general topic'})` : 
      'No specific topic detected';
    
    const violationContext = hasViolations ? 
      `The previous response violated human response rules by being too generic or AI-like.` : 
      `The previous response was too brief or conversation-ending.`;
    
    // Get suggested emojis for this context
    const suggestedEmojis = this.getContextualEmojis(emotionalState, topicAnalysis, 'medium');
    const emojiGuidance = suggestedEmojis.length > 0 ? 
      `Consider using emojis like ${suggestedEmojis.join(' ')} naturally in your response.` : 
      'You can use 1-2 emojis if they fit naturally.';
    
    const conversationKeeperExamples = conversationKeepers.slice(0, 3).join('\n- ');

    return `The AI response "${rawResponse}" needs enhancement. ${violationContext}
    Generate a more engaging, human-like follow-up that keeps the conversation flowing naturally.

    CONTEXT:
    - ${interestContext}
    - ${topicContext}
    - User's emotion: ${emotionalState.state} (intensity: ${emotionalState.intensity}/10)
    - Relationship: ${relationship.relationship_stage}
    - User just said: "${userMessage}"
    - You are: ${companion.name}, a ${companion.age}-year-old ${companion.personality} from ${companion.country}
    - ${emojiGuidance}

    CONVERSATION KEEPERS (use these as inspiration):
    - ${conversationKeeperExamples}

    CREATE A RESPONSE THAT:
    1. Shows genuine interest in what they said
    2. Adds personal experience or opinion
    3. Asks a natural follow-up question OR shares a related thought
    4. Keeps it casual and conversational
    5. Feels like a real human continuing the chat
    6. Uses 1-2 emojis naturally if appropriate
    7. Follows human conversation patterns (not robotic Q&A)

    RESPOND WITH JUST THE ENHANCED RESPONSE (no explanations):`;
  }

  /**
   * More human-like emotional state detection with emoji awareness
   */
  async detectEmotionalState(userMessage, userId, companionId) {
    try {
      const emotionPrompt = `Analyze the emotional tone of this message from a real human conversation. 
      Consider subtle cues like word choice, punctuation, and context.
      
      Message: "${userMessage}"
      
      Respond with ONLY a JSON object:
      {
        "state": "happy|excited|content|calm|thoughtful|curious|playful|sad|frustrated|anxious|tired|neutral",
        "intensity": 1-10,
        "context": "brief human explanation of emotional cues detected",
        "suggested_response_tone": "warm|enthusiastic|supportive|playful|empathetic|calm|curious",
        "emoji_suggestions": ["array", "of", "appropriate", "emojis"]
      }`;
      
      let emotionData;
      if (this.useClaude && claudeService.isAvailable()) {
        // Use Claude for emotion detection
        const response = await claudeService.generateResponse(
          [{ role: 'user', content: emotionPrompt }],
          'You are a helpful assistant that analyzes emotional tone. Always respond with valid JSON only.'
        );
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          emotionData = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback to neutral if JSON parsing fails
          emotionData = { state: 'neutral', intensity: 5, context: 'Unable to detect emotion', suggested_response_tone: 'warm', emoji_suggestions: [] };
        }
      } else if (this.openai) {
        // Fallback to OpenAI
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: emotionPrompt }],
          max_tokens: 200,
          temperature: 0.3,
        });
        emotionData = JSON.parse(completion.choices[0].message.content);
      } else {
        // No AI service available, return neutral state
        emotionData = { state: 'neutral', intensity: 5, context: 'No AI service available', suggested_response_tone: 'warm', emoji_suggestions: [] };
      }
      
      // Store emotional state
      await this.pool.execute(`
        INSERT INTO user_emotional_states 
        (user_id, companion_id, emotional_state, intensity_score, context, detected_from_message, emoji_suggestions)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        parseInt(userId), 
        parseInt(companionId), 
        emotionData.state, 
        emotionData.intensity, 
        emotionData.context, 
        userMessage,
        JSON.stringify(emotionData.emoji_suggestions || [])
      ]);
      
      return emotionData;
      
    } catch (error) {
      console.error('Error detecting emotional state:', error);
      return {
        state: 'calm',
        intensity: 5,
        context: 'Default emotional state',
        suggested_response_tone: 'warm',
        emoji_suggestions: ['😊']
      };
    }
  }

  /**
   * Get emoji for emotional state
   */
  getEmojiForState(state) {
    const emojis = this.emojiMap[state];
    return emojis && emojis.length > 0 ? emojis[0] : '💬';
  }

  /**
   * Get emoji for topic
   */
  getEmojiForTopic(topic) {
    const emojis = this.emojiMap[topic];
    return emojis && emojis.length > 0 ? emojis[0] : '💭';
  }

  /**
   * Get emoji usage guidance
   */
  getEmojiUsageGuidance(usage) {
    switch (usage) {
      case 'none': return 'Avoid using emojis';
      case 'light': return 'Use 1 emoji occasionally';
      case 'heavy': return 'Use 2-3 emojis naturally throughout conversation';
      default: return 'Use 1-2 emojis naturally';
    }
  }

  /**
   * Enhanced conversation messages builder with emoji context
   */
  buildEnhancedConversationMessages(systemPrompt, conversationHistory, userMessage, emotionalState, userDetails) {
    const messages = [{ role: 'system', content: systemPrompt }];
    
    // Increased from 10 to 30 messages (15 exchanges) for better conversation continuity
    // This allows the AI to remember more context and have more natural, human-like conversations
    const recentHistory = conversationHistory.slice(-30); // 15 exchanges (30 messages)
    for (const message of recentHistory) {
      const role = message.sender_type === 'user' ? 'user' : 'assistant';
      messages.push({
        role,
        content: message.content
      });
    }
    
    // Add current user message without emotional metadata (let system prompt handle it)
    messages.push({
      role: 'user',
      content: userMessage
    });
    
    return messages;
  }

  /**
   * Check if user message is a simple greeting
   */
  isSimpleGreeting(message) {
    const cleanMessage = message.toLowerCase().trim();
    
    // Check for very short messages (3 characters or less)
    if (cleanMessage.length <= 3) {
      return true;
    }
    
    // Check for common greeting words at the start
    const greetingWords = ['hi', 'hey', 'hello', 'hallo', 'hie', 'sup', 'yo', 'greetings'];
    const words = cleanMessage.split(/\s+/);
    const firstWord = words[0];
    
    if (greetingWords.includes(firstWord)) {
      return true;
    }
    
    // Check for greeting patterns (more flexible)
    const greetingPatterns = [
      /^(hi|hey|hello|hallo|hie)\s+(there|ya|you|everyone)/i,
      /^what\'?s\s+up/i,
      /^how\s+(are\s+you|do\s+you\s+do)/i,
      /^good\s+(morning|afternoon|evening)/i,
      /^greetings/i
    ];
    
    return greetingPatterns.some(pattern => pattern.test(cleanMessage));
  }

  /**
   * Filter relevant conversation history
   */
  filterRelevantConversationHistory(conversationHistory, userMessage, userName, companionName) {
    if (!conversationHistory || conversationHistory.length === 0) return '';
    
    const userMessageLower = userMessage.toLowerCase().trim();
    const isSimpleGreeting = userMessageLower.match(/^(hi|hie|hey|hello|yo|what's up|whats up)$/);
    const isTopicChange = userMessageLower.includes('what about') || userMessageLower.includes('whats new') || userMessageLower.includes('what\'s new');
    
    const now = new Date();
    
    if (isSimpleGreeting || isTopicChange) {
      // Filter to only include messages from the last 30 minutes
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const recentMessages = conversationHistory.filter(msg => {
        const msgDate = new Date(msg.created_at);
        return msgDate >= thirtyMinutesAgo;
      });
      
      // Only include the very last exchange (1-2 messages)
      const lastMessages = recentMessages.slice(-2);
      return lastMessages.map(msg => 
        `${msg.sender_type === 'user' ? userName : companionName}: ${msg.content}`
      ).join('\n');
    }
    
    // For normal conversation, include last 5 messages max
    const recentMessages = conversationHistory.slice(-5);
    return recentMessages.map(msg => 
      `${msg.sender_type === 'user' ? userName : companionName}: ${msg.content}`
    ).join('\n');
  }

  // ========== DATABASE HELPER METHODS ==========

  async getCompanionDetails(companionId) {
    try {
      const [companions] = await this.pool.execute(
        'SELECT * FROM companions WHERE id = ?',
        [parseInt(companionId)]
      );
      
      if (companions.length === 0) {
        throw new Error(`Companion with ID ${companionId} not found`);
      }
      
      return companions[0];
    } catch (error) {
      console.log('Error getting companion details:', error.message);
      throw error;
    }
  }

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
      console.log('Error getting user details:', error.message);
      return { name: 'Friend', email: 'unknown@example.com' };
    }
  }

  async getUserProfileData(userId) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM user_profiles WHERE user_id = ?',
        [userId]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const profile = rows[0];
      
      // Parse JSON fields safely
      const parseJSONField = (field) => {
        if (!field) return null;
        if (typeof field === 'object') return field;
        if (typeof field === 'string') {
          try {
            return JSON.parse(field);
          } catch (error) {
            return field;
          }
        }
        return field;
      };
      
      const interests = parseJSONField(profile.interests);
      const lookingFor = parseJSONField(profile.looking_for);
      const preferences = parseJSONField(profile.preferences);
      const attributes = parseJSONField(profile.attributes);
      const selections = parseJSONField(profile.selections);
      
      return {
        ...profile,
        interests,
        lookingFor,
        preferences,
        attributes,
        selections
      };
    } catch (error) {
      console.error('Error fetching user profile data:', error);
      return null;
    }
  }

  async getRelationshipProgression(userId, companionId) {
    try {
      const [relationships] = await this.pool.execute(`
        SELECT * FROM relationship_progression 
        WHERE user_id = ? AND companion_id = ?
      `, [parseInt(userId), parseInt(companionId)]);
      
      if (relationships.length === 0) {
        // Create new relationship record
        await this.pool.execute(`
          INSERT INTO relationship_progression (user_id, companion_id)
          VALUES (?, ?)
        `, [parseInt(userId), parseInt(companionId)]);
        
        return {
          relationship_stage: 'stranger',
          intimacy_level: 1,
          trust_level: 1,
          shared_experiences_count: 0,
          conversation_count: 0
        };
      }
      
      return relationships[0];
      
    } catch (error) {
      return {
        relationship_stage: 'stranger',
        intimacy_level: 1,
        trust_level: 1,
        shared_experiences_count: 0,
        conversation_count: 0
      };
    }
  }

  async getRelevantMemories(companionId, userId, userMessage) {
    try {
      // Try Chroma semantic search first if available
      if (this.useChroma && chromaMemoryService.isAvailable()) {
        try {
          const chromaMemories = await chromaMemoryService.searchMemories(
            companionId,
            userId,
            userMessage,
            30
          );

          if (chromaMemories && chromaMemories.length > 0) {
            console.log(`Found ${chromaMemories.length} relevant memories from Chroma (semantic search)`);
            
            // Get full memory details from database using dbMemoryId or content
            const memoryIds = chromaMemories
              .filter(m => m.dbMemoryId)
              .map(m => parseInt(m.dbMemoryId));
            
            if (memoryIds.length > 0) {
              const [dbMemories] = await this.pool.execute(`
                SELECT 
                  id,
                  memory_type, 
                  content, 
                  importance_score, 
                  emotional_context, 
                  created_at,
                  last_accessed
                FROM companion_memories 
                WHERE id IN (${memoryIds.map(() => '?').join(',')}) AND is_active = TRUE
              `, memoryIds);
              
              // Merge Chroma relevance scores with database records
              const chromaMap = new Map(chromaMemories.map(m => [m.dbMemoryId, m.relevanceScore]));
              const enrichedMemories = dbMemories.map(m => ({
                ...m,
                relevance_score: chromaMap.get(m.id.toString()) || m.importance_score
              }));
              
              // Sort by relevance score
              enrichedMemories.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
              
              return enrichedMemories;
            } else {
              // If no dbMemoryId, use Chroma results directly
              return chromaMemories.map(m => ({
                memory_type: m.memoryType,
                content: m.content,
                importance_score: m.importanceScore,
                emotional_context: {},
                created_at: m.createdAt,
                relevance_score: m.relevanceScore
              }));
            }
          }
        } catch (chromaError) {
          console.warn('Chroma search failed, falling back to SQL:', chromaError.message);
        }
      }

      // Fallback to enhanced SQL search (or use if Chroma not available)
      // Enhanced SQL search with keyword matching for better relevance
      // Increased from 10 to 30 memories for better recall and more personalized responses
      const [memories] = await this.pool.execute(`
        SELECT 
          memory_type, 
          content, 
          importance_score, 
          emotional_context, 
          created_at,
          last_accessed,
          CASE 
            WHEN content LIKE ? THEN importance_score + 2
            WHEN content LIKE ? THEN importance_score + 1
            ELSE importance_score
          END as relevance_score
        FROM companion_memories 
        WHERE companion_id = ? AND user_id = ? AND is_active = TRUE
        ORDER BY relevance_score DESC, last_accessed DESC, created_at DESC
        LIMIT 30
      `, [
        `%${userMessage.substring(0, 20)}%`, // Exact phrase match
        `%${userMessage.split(' ').slice(0, 3).join(' ')}%`, // First few words
        parseInt(companionId), 
        parseInt(userId)
      ]);
      
      return memories;
      
    } catch (error) {
      console.error('Error getting relevant memories:', error);
      return [];
    }
  }

  async getConversationContext(conversationId) {
    try {
      // Increased from 5 to 15 contexts for better understanding of conversation flow and topics
      const [contexts] = await this.pool.execute(`
        SELECT * FROM conversation_contexts 
        WHERE conversation_id = ? 
        ORDER BY importance_score DESC, created_at DESC
        LIMIT 15
      `, [parseInt(conversationId)]);
      
      return contexts;
    } catch (error) {
      return [];
    }
  }

  async getConversationHistory(conversationId) {
    try {
      // Increased from 20 to 50 messages for better conversation context and memory
      const [history] = await this.pool.execute(`
        SELECT sender_type, content, created_at
        FROM messages 
        WHERE conversation_id = ? 
        ORDER BY created_at ASC
        LIMIT 50
      `, [parseInt(conversationId)]);
      
      return history;
    } catch (error) {
      return [];
    }
  }

  filterRecentMemories(memories) {
    if (!memories || memories.length === 0) return [];
    
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    
    return memories.filter(memory => {
      const memoryDate = new Date(memory.created_at);
      return memoryDate >= twoHoursAgo;
    });
  }

  filterRecentConversationContext(conversationContext) {
    if (!conversationContext || conversationContext.length === 0) return [];
    
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    
    return conversationContext.filter(context => {
      const contextDate = new Date(context.created_at);
      return contextDate >= twoHoursAgo;
    });
  }

  async updateConversationContext(conversationId, userMessage, aiResponse, emotionalState) {
    try {
      const contextData = {
        user_emotion: emotionalState.state,
        emotional_intensity: emotionalState.intensity,
        conversation_tone: emotionalState.suggested_response_tone,
        timestamp: new Date().toISOString()
      };
      
      await this.pool.execute(`
        INSERT INTO conversation_contexts 
        (conversation_id, context_type, context_data, importance_score)
        VALUES (?, 'mood', ?, ?)
      `, [parseInt(conversationId), JSON.stringify(contextData), emotionalState.intensity]);
      
    } catch (error) {
      console.error('Error updating conversation context:', error);
    }
  }

  async processAndStoreMemories(companionId, userId, userMessage, aiResponse, emotionalState) {
    try {
      if (this.isSignificantInteraction(userMessage, emotionalState)) {
        const memoryPrompt = `Extract 1-2 truly meaningful things worth remembering from this conversation. 
        
        User: "${userMessage}"
        Response: "${aiResponse}"
        
        Respond with JSON array (max 2 items):
        [{
          "type": "preference|experience|emotional_moment|personal_revelation",
          "content": "natural phrasing of what to remember",
          "importance": 1-10,
          "emotional_context": "why this stood out"
        }]`;
        
        let memories;
        if (this.useClaude && claudeService.isAvailable()) {
          // Use Claude for memory extraction
          try {
            const response = await claudeService.generateResponse(
              [{ role: 'user', content: memoryPrompt }],
              'You are a helpful assistant that extracts meaningful memories. Always respond with valid JSON array only.'
            );
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              memories = JSON.parse(jsonMatch[0]);
            } else {
              memories = [];
            }
          } catch (error) {
            console.error('Error extracting memories with Claude:', error);
            return; // Skip memory processing if extraction fails
          }
        } else if (this.openai) {
          // Fallback to OpenAI
          const completion = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: memoryPrompt }],
            max_tokens: 200,
            temperature: 0.4,
          });
          try {
            memories = JSON.parse(completion.choices[0].message.content);
          } catch (parseError) {
            console.error('Error parsing memory JSON:', parseError);
            console.error('Raw content:', completion.choices[0].message.content);
            return; // Skip memory processing if JSON is invalid
          }
        } else {
          // No AI service available, skip memory extraction
          return;
        }
        
        for (const memory of memories.slice(0, 2)) {
          await this.pool.execute(`
            INSERT INTO companion_memories 
            (companion_id, user_id, memory_type, content, importance_score, emotional_context)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [parseInt(companionId), parseInt(userId), memory.type, memory.content, memory.importance, JSON.stringify(memory.emotional_context)]);
        }
      }
    } catch (error) {
      console.error('Error processing memories:', error);
    }
  }

  isSignificantInteraction(userMessage, emotionalState) {
    if (emotionalState.intensity >= 7) return true;
    
    const significantPatterns = [
      /(love|hate|adore|can't stand).+/i,
      /(always|never).+because/i,
      /(dream|goal|aspiration).+/i,
      /(favorite|least favorite).+/i,
      /(childhood|growing up).+memory/i,
      /(scared|afraid|worried).+about/i
    ];
    
    return significantPatterns.some(pattern => pattern.test(userMessage));
  }

  async updateRelationshipProgression(userId, companionId, emotionalState, userMessage) {
    try {
      const emotionalEngagement = emotionalState.intensity / 10;
      const messageDepth = this.assessMessageDepth(userMessage);
      const trustIncrease = (emotionalEngagement + messageDepth) * 0.15;
      const intimacyIncrease = emotionalEngagement * 0.2;
      
      await this.pool.execute(`
        UPDATE relationship_progression 
        SET 
          intimacy_level = LEAST(10, intimacy_level + ?),
          trust_level = LEAST(10, trust_level + ?),
          conversation_count = conversation_count + 1,
          last_interaction = NOW(),
          total_interaction_time = total_interaction_time + 5,
          relationship_stage = CASE
            WHEN intimacy_level >= 8 AND trust_level >= 8 THEN 'intimate'
            WHEN intimacy_level >= 6 AND trust_level >= 6 THEN 'close_friend'
            WHEN intimacy_level >= 4 AND trust_level >= 4 THEN 'friend'
            WHEN intimacy_level >= 2 AND trust_level >= 2 THEN 'acquaintance'
            ELSE 'stranger'
          END
        WHERE user_id = ? AND companion_id = ?
      `, [intimacyIncrease, trustIncrease, parseInt(userId), parseInt(companionId)]);
      
    } catch (error) {
      console.error('Error updating relationship progression:', error);
    }
  }

  assessMessageDepth(message) {
    const depthIndicators = [
      /because.+/i,
      /feel.+/i,
      /think.+/i,
      /believe.+/i,
      /experience.+/i,
      /memory.+/i,
      /dream.+/i,
      /goal.+/i
    ];
    
    const matches = depthIndicators.filter(pattern => pattern.test(message)).length;
    return Math.min(matches / 3, 1);
  }
}

module.exports = new EnhancedOpenAIService();