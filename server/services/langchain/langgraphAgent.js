// Import LangGraph components with error handling
let StateGraph, END, ChatOpenAI, ChatPromptTemplate, StringOutputParser;

try {
  const langgraph = require('@langchain/langgraph');
  StateGraph = langgraph.StateGraph;
  END = langgraph.END;
  
  ChatOpenAI = require('@langchain/openai').ChatOpenAI;
  ChatPromptTemplate = require('@langchain/core/prompts').ChatPromptTemplate;
  StringOutputParser = require('@langchain/core/output_parsers').StringOutputParser;
} catch (error) {
  console.warn('LangGraph imports failed, using fallback implementation:', error.message);
}
const pool = require('../../db/connection');
const DatasetService = require('./datasetService');

/**
 * LangGraph-based Conversation Agent for Amora AI Companions
 * Provides sophisticated conversation flow management with state-based processing
 */
class LangGraphAgent {
  constructor() {
    // Initialize LLM with error handling
    try {
      this.llm = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: process.env.OPENAI_MODEL || 'gpt-4',
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 150,
      });
    } catch (error) {
      console.warn('ChatOpenAI initialization failed:', error.message);
      this.llm = null;
    }

    this.pool = pool;
    this.agents = new Map(); // Cache for conversation agents
    this.datasetService = new DatasetService();
    
    // Load datasets on initialization
    this.initializeDatasets();
  }

  /**
   * Initialize datasets for conversation patterns
   */
  async initializeDatasets() {
    try {
      console.log('📚 Initializing conversation datasets...');
      const stats = await this.datasetService.loadAllDatasets();
      console.log(`✅ Loaded ${stats.totalDatasets} datasets with ${stats.totalConversations} conversations`);
      console.log(`🎯 Available patterns: ${stats.patterns.join(', ')}`);
    } catch (error) {
      console.warn('⚠️ Dataset initialization failed:', error.message);
    }
  }

  /**
   * Create a conversation agent for a specific companion
   */
  async createConversationAgent(companionId, userId, conversationId) {
    try {
      // Get companion and user details
      const companion = await this.getCompanionDetails(companionId);
      const user = await this.getUserDetails(userId);
      const memories = await this.getRelevantMemories(companionId, userId);

      // For now, let's use a simpler approach without StateGraph
      // We'll create a simple agent object that processes messages step by step
      const agent = {
        companion,
        user,
        memories,
        processMessage: async (userMessage, conversationId) => {
          // Initialize state with all necessary data
          let state = {
            userMessage,
            companion,
            user,
            memories,
            conversationId,
            conversationHistory: []
          };
          
          // Step 1: Analyze input
          state = await this.analyzeInput(state);
          
          // Step 2: Detect emotion
          state = await this.detectEmotion(state);
          
          // Step 3: Analyze topic
          state = await this.analyzeTopic(state);
          
          // Step 4: Generate response
          state = await this.generateResponse(state);
          
          // Step 5: Enhance response
          state = await this.enhanceResponse(state);
          
          // Step 6: Check if follow-up is needed
          const shouldFollowUp = this.shouldGenerateFollowUp(state);
          if (shouldFollowUp) {
            state = await this.generateFollowUp(state);
          }
          
          return state;
        }
      };

      // Cache the agent
      const agentKey = `${companionId}_${userId}_${conversationId}`;
      this.agents.set(agentKey, agent);

      return agent;
    } catch (error) {
      console.error('Error creating conversation agent:', error);
      throw error;
    }
  }

  /**
   * Process user message through the LangGraph agent
   */
  async processMessage({ companionId, userId, conversationId, userMessage }) {
    // Check if LangChain is available
    if (!this.llm) {
      throw new Error('LangChain components not available. Please check LangChain installation.');
    }

    const agentKey = `${companionId}_${userId}_${conversationId}`;
    let agent = this.agents.get(agentKey);

    // Create agent if it doesn't exist
    if (!agent) {
      agent = await this.createConversationAgent(companionId, userId, conversationId);
    }

    // Process the message through the agent with conversationId
    const result = await agent.processMessage(userMessage, conversationId);

    return result.response;
  }


  /**
   * Analyze user input
   */
  async analyzeInput(state) {
    const { userMessage } = state;
    
    // Get conversation context
    const conversationContext = await this.getConversationContext(state.conversationId);
    console.log(`🎯 Conversation context - Topic: ${conversationContext.currentTopic}, Messages: ${conversationContext.messageCount}`);
    
    // Simple input analysis
    const analysis = {
      isQuestion: userMessage.includes('?'),
      isGreeting: /^(hi|hello|hey|hie|sup|yo|good morning|good afternoon|good evening|good day)/i.test(userMessage.trim()),
      isGratitude: /(thank|thanks|appreciate|grateful)/i.test(userMessage),
      isPersonal: /(i|my|me|myself)/i.test(userMessage),
      isAskingAboutAI: /(what.*you.*doing|what.*are.*you|how.*are.*you|what.*you.*up.*to)/i.test(userMessage),
      isAskingAboutAge: /(how.*old.*are.*you|what.*your.*age|age)/i.test(userMessage),
      isAskingAboutName: /(what.*your.*name|who.*are.*you|name)/i.test(userMessage),
      isAskingAboutLocation: /(where.*are.*you.*from|where.*do.*you.*live|location|country)/i.test(userMessage),
      isAskingAboutJob: /(what.*do.*you.*do|job|work|profession)/i.test(userMessage),
      isSharingAge: /(i.*am.*\d+.*years.*old|i.*\d+.*years.*old|i.*am.*\d+$)/i.test(userMessage),
      isSharingName: /(my.*name.*is|i.*am.*called|i.*go.*by)/i.test(userMessage),
      isSharingLocation: /(i.*am.*from|i.*live.*in|i.*come.*from)/i.test(userMessage),
      isSharingJob: /(i.*work.*as|i.*am.*a|my.*job.*is|i.*do)/i.test(userMessage),
      isRespondingToQuestion: /(it.*been|it.*was|it.*is|yes|no|yeah|nope|sure|okay|alright)/i.test(userMessage),
      isSharingDayStatus: /(been.*great|been.*good|been.*okay|been.*fine|day.*was|day.*is)/i.test(userMessage),
      isSharingWork: /(was.*at.*work|doing.*work|work.*stuff|at.*the.*office|working)/i.test(userMessage),
      isSharingInterests: /(i.*like.*creating|i.*enjoy.*making|i.*love.*building|i.*like.*computers|i.*enjoy.*programming|i.*love.*coding)/i.test(userMessage),
      isGoodbye: /(bye|goodbye|see.*you|gotta.*go|have.*to.*go|going.*to|leaving|take.*care|talk.*later)/i.test(userMessage),
      isContinuingTopic: this.isContinuingTopic(userMessage, conversationContext),
      debugTopicContinuation: this.isContinuingTopic(userMessage, conversationContext) ? 'YES' : 'NO',
      currentTopic: conversationContext.currentTopic,
      length: userMessage.length,
      hasEmojis: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(userMessage)
    };

    return {
      ...state,
      inputAnalysis: analysis,
      conversationContext: conversationContext
    };
  }

  /**
   * Get conversation context from recent messages
   */
  async getConversationContext(conversationId) {
    try {
      const [messages] = await this.pool.query(`
        SELECT content, sender_type, created_at 
        FROM messages 
        WHERE conversation_id = ? 
        ORDER BY created_at DESC 
        LIMIT 10
      `, [conversationId]);

      console.log(`📝 Retrieved ${messages.length} messages for conversation ${conversationId}`);

      // Analyze recent messages to determine current topic
      const recentMessages = messages.reverse(); // Get chronological order
      const currentTopic = this.extractCurrentTopic(recentMessages);
      
      console.log(`🎯 Extracted topic: ${currentTopic} from messages:`, recentMessages.map(m => m.content.substring(0, 50)));
      
      return {
        currentTopic: currentTopic,
        recentMessages: recentMessages,
        messageCount: messages.length
      };
    } catch (error) {
      console.warn('Error getting conversation context:', error.message);
      return {
        currentTopic: null,
        recentMessages: [],
        messageCount: 0
      };
    }
  }

  /**
   * Extract current topic from recent messages
   */
  extractCurrentTopic(messages) {
    if (messages.length === 0) return null;

    // Look for topic keywords in recent messages
    const topicKeywords = {
      'computers': ['computer', 'programming', 'coding', 'software', 'tech', 'technology', 'systems', 'financial modelling', 'financial modeling', 'modelling', 'modeling'],
      'financial': ['financial', 'finance', 'money', 'investment', 'trading', 'modeling', 'modelling', 'systems', 'data', 'analysis'],
      'work': ['work', 'job', 'office', 'career', 'business'],
      'hobbies': ['hobby', 'interest', 'creating', 'making', 'building', 'art', 'music'],
      'personal': ['family', 'friend', 'relationship', 'dating', 'love'],
      'travel': ['travel', 'trip', 'vacation', 'visit', 'country', 'city']
    };

    // Count topic mentions in recent messages
    const topicScores = {};
    const recentText = messages.slice(-6).map(m => m.content.toLowerCase()).join(' ');

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      topicScores[topic] = keywords.reduce((score, keyword) => {
        return score + (recentText.includes(keyword) ? 1 : 0);
      }, 0);
    }

    // Return the topic with highest score
    const topTopic = Object.entries(topicScores)
      .sort(([,a], [,b]) => b - a)[0];

    return topTopic && topTopic[1] > 0 ? topTopic[0] : null;
  }

  /**
   * Check if user is continuing the current topic
   */
  isContinuingTopic(userMessage, conversationContext) {
    if (!conversationContext.currentTopic) {
      console.log(`🔍 Topic continuation: No current topic`);
      return false;
    }

    const message = userMessage.toLowerCase();
    const topic = conversationContext.currentTopic;

    // Check if message contains topic-related keywords
    const topicKeywords = {
      'computers': ['computer', 'programming', 'coding', 'software', 'tech', 'technology', 'financial', 'modelling', 'modeling'],
      'financial': ['financial', 'finance', 'money', 'investment', 'trading', 'modeling', 'modelling', 'data', 'analysis'],
      'work': ['work', 'job', 'office', 'career', 'business', 'project'],
      'hobbies': ['hobby', 'interest', 'creating', 'making', 'building', 'art', 'music', 'design'],
      'personal': ['family', 'friend', 'relationship', 'dating', 'love', 'personal', 'how', 'what', 'where', 'when', 'why', 'good', 'bad', 'fine', 'great', 'okay', 'alright', 'doing', 'going', 'feeling', 'day', 'life', 'time'],
      'travel': ['travel', 'trip', 'vacation', 'visit', 'country', 'city', 'place']
    };

    const keywords = topicKeywords[topic] || [];
    const matches = keywords.filter(keyword => message.includes(keyword));
    const isContinuing = matches.length > 0;
    
    console.log(`🔍 Topic continuation: Topic="${topic}", Message="${message}", Keywords=[${keywords.join(', ')}], Matches=[${matches.join(', ')}], Result=${isContinuing}`);
    
    return isContinuing;
  }

  /**
   * Detect emotional state
   */
  async detectEmotion(state) {
    const { userMessage } = state;
    
    // Simple emotion detection without LangChain for now
    const isHappy = /happy|great|awesome|amazing|excited|love|good|wonderful/i.test(userMessage);
    const isSad = /sad|down|depressed|upset|lonely|tired|bad|terrible/i.test(userMessage);
    const isFrustrated = /angry|mad|furious|annoyed|frustrated|hate/i.test(userMessage);
    
    let emotionalState;
    if (isHappy) {
      emotionalState = { state: 'happy', intensity: 7, context: 'User seems positive' };
    } else if (isSad) {
      emotionalState = { state: 'sad', intensity: 6, context: 'User seems down' };
    } else if (isFrustrated) {
      emotionalState = { state: 'frustrated', intensity: 6, context: 'User seems frustrated' };
    } else {
      emotionalState = { state: 'neutral', intensity: 5, context: 'Default emotional state' };
    }
    
    return {
      ...state,
      emotionalState
    };
  }

  /**
   * Analyze conversation topic
   */
  async analyzeTopic(state) {
    const { userMessage } = state;
    
    // Simple topic analysis without LangChain for now
    const topicKeywords = {
      work: /work|job|career|office|boss|colleague/i,
      entertainment: /movie|show|music|game|book|tv|netflix/i,
      food: /food|eat|restaurant|cook|recipe|meal|hungry/i,
      travel: /travel|trip|vacation|flight|hotel|country|city/i,
      health: /health|exercise|gym|doctor|sick|fitness|workout/i,
      family: /family|mom|dad|parent|sibling|brother|sister/i,
      relationships: /relationship|boyfriend|girlfriend|date|love|crush/i,
      hobbies: /hobby|sport|art|craft|photography|gaming/i
    };
    
    let topic = 'general';
    let confidence = 0.3;
    
    for (const [topicName, pattern] of Object.entries(topicKeywords)) {
      if (pattern.test(userMessage)) {
        topic = topicName;
        confidence = 0.8;
        break;
      }
    }
    
    const topicAnalysis = {
      topic,
      confidence,
      isNewTopic: true,
      keywords: [topic]
    };
    
    return {
      ...state,
      topicAnalysis
    };
  }

  /**
   * Generate AI response
   */
  async generateResponse(state) {
    const { userMessage, companion, user, memories, emotionalState, topicAnalysis } = state;
    
    if (!companion) {
      throw new Error('Companion data is missing');
    }
    
    const userName = user?.name || 'Friend';
    const companionName = companion?.name || 'AI Companion';
    const traits = Array.isArray(companion.traits) ? companion.traits : 
                   (typeof companion.traits === 'string' ? JSON.parse(companion.traits || '[]') : []);

    const memoryContext = memories.length > 0 ? 
      `\nTHINGS I REMEMBER ABOUT ${userName.toUpperCase()}:\n${memories.slice(0, 3).map(m => `- ${m.content}`).join('\n')}` : 
      '';

    // Try to find similar patterns from datasets first (but be conservative)
    let datasetResponse = null;
    try {
      const similarPatterns = this.datasetService.findSimilarPatterns(userMessage, state.inputAnalysis?.context);
      if (similarPatterns.length > 0) {
        const bestPattern = similarPatterns[0];
        
        // Only use dataset response if similarity score is high enough and context makes sense
        if (bestPattern.score > 0.5 && this.isContextuallyAppropriate(bestPattern, userMessage, state.inputAnalysis)) {
          console.log(`🎯 Using dataset pattern: "${bestPattern.userMessage}" -> "${bestPattern.aiResponse}" (score: ${bestPattern.score})`);
          datasetResponse = this.adaptDatasetResponse(bestPattern, companion, userName);
        } else {
          console.log(`📝 Dataset pattern rejected: "${bestPattern.userMessage}" -> "${bestPattern.aiResponse}" (score: ${bestPattern.score} too low or context inappropriate)`);
        }
      } else {
        console.log(`📝 No dataset patterns found for: "${userMessage}"`);
      }
    } catch (error) {
      console.warn('Dataset pattern matching failed:', error.message);
    }

    // Generate responses based on companion's identity
    const responses = {
      greeting: [
        `Hey ${userName}! 😊`,
        `Hi there!`,
        `Hello!`,
        `Hey!`,
        `Hi ${userName}!`,
        `Good afternoon!`,
        `Good morning!`,
        `Good evening!`
      ],
      askingAboutAI: [
        `I'm doing great, thanks for asking! How about you?`,
        `I'm good! How are you doing?`,
        `I'm doing well! How's your day going?`,
        `I'm great! What about you?`
      ],
      askingAboutAge: [
        `I'm ${companion.age} years old! How about you?`,
        `I'm ${companion.age}! What about you - how old are you?`,
        `I'm ${companion.age} years old. How old are you?`
      ],
      askingAboutName: [
        `I'm ${companionName}! Nice to meet you, ${userName}!`,
        `My name is ${companionName}! What's your name?`,
        `I'm ${companionName}! How are you doing today?`
      ],
      askingAboutLocation: [
        `I'm from ${companion.country}! Have you ever been there?`,
        `I live in ${companion.country}! It's a beautiful place. Where are you from?`,
        `I'm from ${companion.country}! What about you - where are you from?`
      ],
      askingAboutJob: [
        `I'm a mechanic by day, but I love cooking and DJing on weekends! What do you do?`,
        `I work as a mechanic, but my real passion is cooking and music. How about you?`,
        `I fix cars during the week, but weekends I'm all about food and music! What's your job?`
      ],
      sharingAge: [
        `Nice! We're pretty close in age then. What do you like to do for fun?`,
        `Cool! I'm 28, so we're not too far apart. What are you into?`,
        `That's great! I'm 28 myself. What's your favorite thing to do?`
      ],
      sharingName: [
        `Nice to meet you! I'm Diego. What brings you here today?`,
        `Pleasure to meet you! I'm Diego. How's your day going?`,
        `Great to meet you! I'm Diego. What's on your mind?`
      ],
      sharingLocation: [
        `That's awesome! I'm from Mexico. Have you ever been there?`,
        `Cool! I'm from Mexico myself. What's it like where you're from?`,
        `Nice! I'm from Mexico. What do you like most about your city?`
      ],
      sharingJob: [
        `That sounds interesting! I'm a mechanic, but I love cooking and music on the side. What do you enjoy about your work?`,
        `Cool job! I fix cars during the week, but weekends I'm all about food and DJing. How long have you been doing that?`,
        `That's great! I'm a mechanic by day, but my real passion is cooking and music. What got you into your field?`
      ],
      respondingToQuestion: [
        `That's great to hear!`,
        `Nice!`,
        `Awesome!`,
        `That's wonderful!`
      ],
      sharingDayStatus: [
        `That's fantastic! I'm glad your day is going well.`,
        `Wonderful! It's always nice to have a good day.`,
        `That's great to hear! What made it so good?`,
        `Awesome! I love hearing when people have great days.`
      ],
      sharingWork: [
        `Ah, the daily grind! How was your day at work?`,
        `Work stuff, huh? Hope it wasn't too stressful.`,
        `Sounds like a typical workday. What kind of work do you do?`,
        `Work can be tiring sometimes. How are you feeling now?`
      ],
      sharingInterests: [
        `That's awesome! I love that you're into creating things. What kind of stuff do you like to make?`,
        `Creating with computers is so cool! I'm a mechanic, but I also love working with my hands. What's your favorite project?`,
        `That sounds really interesting! I enjoy cooking and music, but technology is fascinating too. What got you into it?`,
        `Nice! I'm always impressed by people who can create things. What's the most exciting thing you've built?`
      ],
      continuingTopic: [
        `That's really interesting! Tell me more about that.`,
        `I'd love to hear more details about that.`,
        `That sounds fascinating! How does that work?`,
        `That's cool! What's your experience with that been like?`
      ],
      goodbye: [
        `Have a great lunch! Talk to you later! 😊`,
        `Enjoy your lunch! See you soon!`,
        `Have a good one! Chat with you later!`,
        `Take care! Have a wonderful day!`
      ],
      happy: [
        `That's wonderful! I'm so happy to hear that! What made you feel so good? 😄`,
        `I love your positive energy! Tell me more about what's making you happy!`,
        `That's amazing! I'd love to hear the details!`,
        `That's great! What happened?`
      ],
      sad: [
        `I'm sorry to hear that. Would you like to talk about what's bothering you? 💙`,
        `That sounds really tough. I'm here if you want to share more.`,
        `I can sense you're going through something difficult. How can I help?`
      ],
      question: [
        `That's a great question! I'd love to explore that with you. What do you think? 🤔`,
        `Interesting! I'm curious about your thoughts on that.`,
        `That's something worth discussing! What's your take on it?`
      ],
      gratitude: [
        `You're so welcome! I'm always here to chat. What's on your mind? 😊`,
        `Of course! I love talking with you. How's your day going?`,
        `Anytime! What else is happening in your world?`,
        `My pleasure! What's new with you today?`
      ],
      general: [
        `That's interesting! Tell me more about that.`,
        `I'd love to hear more about what you're thinking.`,
        `What's on your mind today?`,
        `That sounds intriguing! What made you think of that?`
      ]
    };

    let responseType = 'general';
    if (state.inputAnalysis?.isGoodbye) responseType = 'goodbye';
    else if (state.inputAnalysis?.isContinuingTopic) responseType = 'continuingTopic';
    else if (state.inputAnalysis?.isSharingInterests) responseType = 'sharingInterests';
    else if (state.inputAnalysis?.isSharingWork) responseType = 'sharingWork';
    else if (state.inputAnalysis?.isSharingDayStatus) responseType = 'sharingDayStatus';
    else if (state.inputAnalysis?.isRespondingToQuestion) responseType = 'respondingToQuestion';
    else if (state.inputAnalysis?.isSharingAge) responseType = 'sharingAge';
    else if (state.inputAnalysis?.isSharingName) responseType = 'sharingName';
    else if (state.inputAnalysis?.isSharingLocation) responseType = 'sharingLocation';
    else if (state.inputAnalysis?.isSharingJob) responseType = 'sharingJob';
    else if (state.inputAnalysis?.isAskingAboutAge) responseType = 'askingAboutAge';
    else if (state.inputAnalysis?.isAskingAboutName) responseType = 'askingAboutName';
    else if (state.inputAnalysis?.isAskingAboutLocation) responseType = 'askingAboutLocation';
    else if (state.inputAnalysis?.isAskingAboutJob) responseType = 'askingAboutJob';
    else if (state.inputAnalysis?.isAskingAboutAI) responseType = 'askingAboutAI';
    else if (state.inputAnalysis?.isGratitude) responseType = 'gratitude';
    else if (state.inputAnalysis?.isGreeting) responseType = 'greeting';
    else if (emotionalState?.state === 'happy') responseType = 'happy';
    else if (emotionalState?.state === 'sad') responseType = 'sad';
    else if (state.inputAnalysis?.isQuestion) responseType = 'question';

    console.log(`🎯 Response type selected: ${responseType} (continuingTopic: ${state.inputAnalysis?.isContinuingTopic}, currentTopic: ${state.inputAnalysis?.currentTopic})`);

    // Use dataset response if available, otherwise use predefined responses
    let response;
    if (datasetResponse) {
      response = datasetResponse;
    } else {
      const responseOptions = responses[responseType];
      response = responseOptions[Math.floor(Math.random() * responseOptions.length)];
    }
    
    return {
      ...state,
      response
    };
  }

  /**
   * Check if dataset pattern is contextually appropriate
   */
  isContextuallyAppropriate(pattern, userMessage, inputAnalysis) {
    // Don't use dataset patterns for specific response types
    if (inputAnalysis.isSharingDayStatus || inputAnalysis.isRespondingToQuestion || 
        inputAnalysis.isSharingJob || inputAnalysis.isSharingLocation || 
        inputAnalysis.isSharingAge || inputAnalysis.isSharingName ||
        inputAnalysis.isSharingWork || inputAnalysis.isSharingInterests ||
        inputAnalysis.isContinuingTopic || inputAnalysis.isGoodbye) {
      return false;
    }
    
    // Don't use dataset patterns that don't match the user's intent
    const userWords = userMessage.toLowerCase().split(/\s+/);
    const patternWords = pattern.userMessage.toLowerCase().split(/\s+/);
    
    // Check if the pattern is asking about the user when user is sharing information
    if (pattern.aiResponse.toLowerCase().includes('you?') && 
        (userMessage.toLowerCase().includes('i ') || userMessage.toLowerCase().includes('my ') || 
         userMessage.toLowerCase().includes('was ') || userMessage.toLowerCase().includes('doing'))) {
      return false;
    }
    
    // Check if user is sharing work info but pattern is about casual activities
    if (userMessage.toLowerCase().includes('work') && 
        pattern.aiResponse.toLowerCase().includes('chilling')) {
      return false;
    }
    
    return true;
  }

  /**
   * Adapt dataset response to companion's personality
   */
  adaptDatasetResponse(pattern, companion, userName) {
    let adaptedResponse = pattern.aiResponse;
    
    // Replace generic names with actual names
    adaptedResponse = adaptedResponse.replace(/friend/gi, userName);
    adaptedResponse = adaptedResponse.replace(/user/gi, userName);
    
    // Add companion's personality traits
    const companionName = companion?.name || 'AI Companion';
    const traits = Array.isArray(companion.traits) ? companion.traits : 
                   (typeof companion.traits === 'string' ? JSON.parse(companion.traits || '[]') : []);
    
    // Add companion-specific elements based on traits
    if (traits.some(trait => trait.toLowerCase().includes('cooking'))) {
      adaptedResponse = adaptedResponse.replace(/food/gi, 'cooking');
    }
    
    if (traits.some(trait => trait.toLowerCase().includes('music'))) {
      adaptedResponse = adaptedResponse.replace(/entertainment/gi, 'music');
    }
    
    return adaptedResponse;
  }

  /**
   * Enhance response with emotional attunement and style mirroring
   */
  async enhanceResponse(state) {
    const { response, userMessage, emotionalState } = state;
    
    let enhancedResponse = response;
    
    // Apply emotional attunement
    if (emotionalState.state === 'sad' && emotionalState.intensity > 6) {
      enhancedResponse = `I hear you. ${enhancedResponse}`;
    } else if (emotionalState.state === 'frustrated' && emotionalState.intensity > 6) {
      enhancedResponse = `I get why that's frustrating. ${enhancedResponse}`;
    } else if (emotionalState.state === 'happy' && emotionalState.intensity > 7) {
      enhancedResponse = `Love the energy! ${enhancedResponse}`;
    }
    
    // Apply style mirroring (simplified)
    const userEmojiCount = (userMessage.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u) || []).length;
    if (userEmojiCount > 0 && userEmojiCount <= 2 && !enhancedResponse.includes('😊') && !enhancedResponse.includes('😄') && !enhancedResponse.includes('💙') && !enhancedResponse.includes('🤔')) {
      const emojis = ['😊', '🙂', '😄', '😉'];
      enhancedResponse += ` ${emojis[Math.floor(Math.random() * emojis.length)]}`;
    }
    
    return {
      ...state,
      response: enhancedResponse
    };
  }

  /**
   * Determine if follow-up question is needed
   */
  shouldGenerateFollowUp(state) {
    const { userMessage, inputAnalysis } = state;
    
    // Don't generate follow-up for questions, commands, greetings, or when AI is already responding appropriately
    if (inputAnalysis.isQuestion) return false;
    if (inputAnalysis.isGreeting) return false; // Don't add follow-up to greetings
    if (inputAnalysis.isGratitude) return false; // Don't add follow-up to gratitude
    if (inputAnalysis.isRespondingToQuestion) return false; // Don't add follow-up to responses
    if (inputAnalysis.isSharingDayStatus) return false; // Don't add follow-up to day status
    if (inputAnalysis.isSharingWork) return false; // Don't add follow-up to work sharing
    if (inputAnalysis.isSharingInterests) return false; // Don't add follow-up to interests sharing
    if (inputAnalysis.isContinuingTopic) return false; // Don't add follow-up to topic continuation
    if (inputAnalysis.isGoodbye) return false; // Don't add follow-up to goodbyes
    if (inputAnalysis.isAskingAboutAI) return false; // AI is already responding to user's question
    if (inputAnalysis.isAskingAboutAge) return false; // AI is already answering about age
    if (inputAnalysis.isAskingAboutName) return false; // AI is already answering about name
    if (inputAnalysis.isAskingAboutLocation) return false; // AI is already answering about location
    if (inputAnalysis.isAskingAboutJob) return false; // AI is already answering about job
    if (inputAnalysis.isSharingAge) return false; // AI is already responding to user sharing age
    if (inputAnalysis.isSharingName) return false; // AI is already responding to user sharing name
    if (inputAnalysis.isSharingLocation) return false; // AI is already responding to user sharing location
    if (inputAnalysis.isSharingJob) return false; // AI is already responding to user sharing job
    if (/^(stop|wait|don't|dont|no)/i.test(userMessage)) return false;
    
    // Don't generate follow-up for very short responses like "ok", "yes", "no"
    if (userMessage.length < 5 && /^(ok|yes|no|yeah|nope|sure)$/i.test(userMessage.trim())) {
      return false;
    }
    
    // Only generate follow-up for substantial messages that need continuation
    // Be conservative - most responses should stand alone
    if (userMessage.length > 20 && inputAnalysis.isPersonal) {
      return true;
    }
    
    return false;
  }

  /**
   * Generate follow-up question
   */
  async generateFollowUp(state) {
    const { userMessage, topicAnalysis, response, inputAnalysis } = state;
    
    // Generate context-aware follow-up questions
    let followUpQuestion = "";
    
    if (inputAnalysis.isGratitude) {
      const gratitudeFollowUps = [
        "What's on your mind today?",
        "How's your day going?",
        "What's new with you?",
        "What are you up to?"
      ];
      followUpQuestion = gratitudeFollowUps[Math.floor(Math.random() * gratitudeFollowUps.length)];
    } else if (inputAnalysis.isGreeting) {
      const greetingFollowUps = [
        "How's your day going?",
        "What's on your mind?",
        "How are you doing?",
        "What's new with you?"
      ];
      followUpQuestion = greetingFollowUps[Math.floor(Math.random() * greetingFollowUps.length)];
    } else {
      // Topic-based follow-ups
      const followUps = {
        work: "What do you enjoy most about your work?",
        entertainment: "What are you watching or listening to lately?",
        food: "What's your go-to comfort food?",
        travel: "Where would you love to go next?",
        health: "How do you like to stay active?",
        family: "How's your family doing?",
        relationships: "How are things going in your relationships?",
        hobbies: "What's your favorite hobby right now?",
        general: "What about that interests you most?"
      };
      
      followUpQuestion = followUps[topicAnalysis.topic] || followUps.general;
    }
    
    return {
      ...state,
      response: `${response} ${followUpQuestion}`,
      needsFollowUp: true,
      followUpQuestion
    };
  }

  /**
   * Helper methods (same as LangChainService)
   */
  async getCompanionDetails(companionId) {
    try {
      const [companions] = await this.pool.execute(
        'SELECT * FROM companions WHERE id = ?',
        [parseInt(companionId)]
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
      
      return companion;
    } catch (error) {
      console.error('Error getting companion details:', error);
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
      console.error('Error getting user details:', error);
      return { name: 'Friend', email: 'unknown@example.com' };
    }
  }

  async getRelevantMemories(companionId, userId, limit = 5) {
    try {
      const limitNum = parseInt(limit);
      const [memories] = await this.pool.query(`
        SELECT content, memory_type, importance_score
        FROM companion_memories 
        WHERE companion_id = ? AND user_id = ? AND is_active = TRUE
        ORDER BY importance_score DESC, created_at DESC
        LIMIT ${limitNum}
      `, [parseInt(companionId), userId]);
      
      return memories;
    } catch (error) {
      console.error('Error getting memories:', error);
      throw error; // Don't fallback, let it fail
    }
  }

  async getConversationHistory(conversationId, limit = 10) {
    try {
      const limitNum = parseInt(limit);
      const [messages] = await this.pool.query(`
        SELECT sender_type, content, created_at
        FROM messages 
        WHERE conversation_id = ? 
        ORDER BY created_at DESC 
        LIMIT ${limitNum}
      `, [parseInt(conversationId)]);
      
      return messages.reverse();
    } catch (error) {
      console.error('Error getting conversation history:', error);
      throw error; // Don't fallback, let it fail
    }
  }

  /**
   * Clear agent cache
   */
  clearAgent(companionId, userId, conversationId) {
    const agentKey = `${companionId}_${userId}_${conversationId}`;
    this.agents.delete(agentKey);
  }

  clearAllAgents() {
    this.agents.clear();
  }
}

module.exports = new LangGraphAgent();
