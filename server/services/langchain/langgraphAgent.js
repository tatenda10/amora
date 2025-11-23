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
const aiConfig = require('../../config/aiCompanionConfig');
const claudeService = require('../claudeService');

/**
 * LangGraph-based Conversation Agent for Amora AI Companions
 * Provides sophisticated conversation flow management with state-based processing
 */
class LangGraphAgent {
  constructor() {
    // Get AI configuration from centralized config
    this.aiConfig = aiConfig.getAIConfig();
    
    // Use Claude if available (from CLAUDE_API_KEY), otherwise fallback to OpenAI
    this.useClaude = process.env.CLAUDE_API_KEY && claudeService.isAvailable();
    
    if (this.useClaude) {
      const claudeModel = process.env.CLAUDE_MODEL || 'from env';
      console.log(`✅ LangGraph agent will use Claude (model: ${claudeModel})`);
      this.llm = null; // Using Claude directly, not LangChain's ChatOpenAI
    } else if (process.env.OPENAI_API_KEY) {
      // Fallback to OpenAI only if Claude is not available
      try {
        // Use AI_MAX_RESPONSE_LENGTH from env if available, otherwise use OPENAI_MAX_TOKENS
        const maxTokens = parseInt(process.env.AI_MAX_RESPONSE_LENGTH) || 
                          parseInt(process.env.OPENAI_MAX_TOKENS) || 
                          this.aiConfig.maxResponseLength || 
                          300;
        
        // Calculate temperature based on casualness level (higher casualness = higher temperature)
        const baseTemperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.8;
        const casualnessLevel = this.aiConfig.casualnessLevel || 0.8;
        // Adjust temperature: 0.7 base + (casualness * 0.2) = range 0.7-0.9
        const adjustedTemperature = Math.min(0.95, baseTemperature + (casualnessLevel * 0.15));
        
        this.llm = new ChatOpenAI({
          openAIApiKey: process.env.OPENAI_API_KEY,
          modelName: process.env.OPENAI_MODEL || 'gpt-4',
          temperature: adjustedTemperature,
          maxTokens: maxTokens,
        });
        
        console.log(`🤖 LLM initialized (OpenAI) - Max Tokens: ${maxTokens}, Temperature: ${adjustedTemperature.toFixed(2)}, Casualness: ${casualnessLevel}`);
      } catch (error) {
        console.warn('ChatOpenAI initialization failed:', error.message);
        this.llm = null;
      }
    } else {
      console.warn('Neither CLAUDE_API_KEY nor OPENAI_API_KEY set. LangGraph agent will not be available.');
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
          // Get conversation context first
          const conversationContext = await this.getConversationContext(conversationId);
          
          // Initialize state with all necessary data
          let state = {
            userMessage,
            companion,
            user,
            memories,
            conversationId,
            conversationContext,
            conversationHistory: conversationContext.recentMessages || []
          };
          
          // Step 1: Analyze input (this also updates conversationContext)
          state = await this.analyzeInput(state);
          
          // Step 2: Detect emotion
          state = await this.detectEmotion(state);
          
          // Step 3: Analyze topic
          state = await this.analyzeTopic(state);
          
          // Step 4: Generate response using LLM
          state = await this.generateResponse(state);
          
          // Step 5: Enhance response (light touch - don't over-process LLM output)
          state = await this.enhanceResponse(state);
          
          // Step 6: Check if follow-up is needed (be conservative)
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
      // Use AI_MAX_CONVERSATION_HISTORY from env, default to 20
      const maxHistory = parseInt(process.env.AI_MAX_CONVERSATION_HISTORY) || 20;
      
      const [messages] = await this.pool.query(`
        SELECT content, sender_type, created_at 
        FROM messages 
        WHERE conversation_id = ? 
        ORDER BY created_at DESC 
        LIMIT ${maxHistory}
      `, [conversationId]);

      console.log(`📝 Retrieved ${messages.length} messages for conversation ${conversationId}`);

      // Analyze recent messages to determine current topic
      const recentMessages = messages.reverse(); // Get chronological order
      const currentTopic = this.extractCurrentTopic(recentMessages);
      
      console.log(`🎯 Extracted topic: ${currentTopic} from ${recentMessages.length} messages`);
      
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
   * Detect emotional state with configurable sensitivity
   */
  async detectEmotion(state) {
    const { userMessage } = state;
    
    // Get emotion sensitivity from config
    const emotionSensitivity = this.aiConfig.emotionSensitivity || 0.7;
    
    // More sensitive patterns for higher sensitivity levels
    const happyPatterns = emotionSensitivity >= 0.8
      ? /happy|great|awesome|amazing|excited|love|good|wonderful|nice|cool|yeah|yes|sweet|perfect|fantastic|delighted|joyful|pleased|glad|thrilled/i
      : emotionSensitivity >= 0.6
      ? /happy|great|awesome|amazing|excited|love|good|wonderful/i
      : /happy|great|awesome|excited|love/i;
    
    const sadPatterns = emotionSensitivity >= 0.8
      ? /sad|down|depressed|upset|lonely|tired|bad|terrible|awful|worst|hate|disappointed|frustrated|stressed|anxious|worried|sick|hurt/i
      : emotionSensitivity >= 0.6
      ? /sad|down|depressed|upset|lonely|tired|bad|terrible/i
      : /sad|down|depressed|upset/i;
    
    const frustratedPatterns = emotionSensitivity >= 0.8
      ? /angry|mad|furious|annoyed|frustrated|hate|pissed|irritated|fuming|rage/i
      : /angry|mad|furious|annoyed|frustrated|hate/i;
    
    const isHappy = happyPatterns.test(userMessage);
    const isSad = sadPatterns.test(userMessage);
    const isFrustrated = frustratedPatterns.test(userMessage);
    
    // Adjust intensity based on sensitivity
    const baseIntensity = Math.round(5 + (emotionSensitivity * 3)); // Range: 5-8
    
    let emotionalState;
    if (isHappy) {
      emotionalState = { 
        state: 'happy', 
        intensity: Math.min(9, baseIntensity + 1), 
        context: 'User seems positive',
        sensitivity: emotionSensitivity
      };
    } else if (isSad) {
      emotionalState = { 
        state: 'sad', 
        intensity: Math.min(9, baseIntensity), 
        context: 'User seems down',
        sensitivity: emotionSensitivity
      };
    } else if (isFrustrated) {
      emotionalState = { 
        state: 'frustrated', 
        intensity: Math.min(9, baseIntensity), 
        context: 'User seems frustrated',
        sensitivity: emotionSensitivity
      };
    } else {
      emotionalState = { 
        state: 'neutral', 
        intensity: 5, 
        context: 'Default emotional state',
        sensitivity: emotionSensitivity
      };
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
   * Generate AI response using LLM
   */
  async generateResponse(state) {
    const { userMessage, companion, user, memories, emotionalState, topicAnalysis, conversationContext } = state;
    
    if (!companion) {
      throw new Error('Companion data is missing');
    }
    
    const userName = user?.name || 'Friend';
    const companionName = companion?.name || 'AI Companion';
    const traits = Array.isArray(companion.traits) ? companion.traits : 
                   (typeof companion.traits === 'string' ? JSON.parse(companion.traits || '[]') : []);

    // Get AI configuration
    const casualnessLevel = this.aiConfig.casualnessLevel || 0.8;
    const empathyLevel = this.aiConfig.empathyLevel || 0.8;
    const emotionSensitivity = this.aiConfig.emotionSensitivity || 0.7;
    const questionFrequency = this.aiConfig.questionFrequency || 0.6;
    const maxResponseLength = this.aiConfig.maxResponseLength || 150;
    const minResponseLength = this.aiConfig.minResponseLength || 10;

    // Build conversation history for context - format more naturally
    const conversationHistory = conversationContext?.recentMessages || [];
    // Use configured max history or default to 10 for prompt (to avoid token overflow)
    const historyLimit = Math.min(10, parseInt(process.env.AI_MAX_CONVERSATION_HISTORY) || 10);
    const formattedHistory = conversationHistory.slice(-historyLimit).map(msg => {
      if (msg.sender_type === 'user') {
        return `${userName}: ${msg.content}`;
      } else {
        return `${companionName}: ${msg.content}`;
      }
    }).join('\n');

    // Format memories more naturally
    const maxMemories = Math.min(5, parseInt(process.env.AI_MAX_RAG_EXAMPLES) || 5);
    const memoryContext = memories.length > 0 ? 
      memories.slice(0, maxMemories).map(m => m.content).join('. ') + '.' : 
      '';

    // Build conversation style guidance based on configuration
    const casualnessGuidance = casualnessLevel >= 0.8 
      ? 'very casual and relaxed, like texting a close friend'
      : casualnessLevel >= 0.6
      ? 'casual and friendly, like talking to a good friend'
      : casualnessLevel >= 0.4
      ? 'warm but somewhat polished, like a friendly acquaintance'
      : 'polite and professional, but still warm';

    const empathyGuidance = empathyLevel >= 0.8
      ? 'Show high empathy - really tune into their feelings and respond with deep understanding and care'
      : empathyLevel >= 0.6
      ? 'Show good empathy - acknowledge their feelings and respond supportively'
      : 'Show appropriate empathy - recognize their emotional state and respond accordingly';

    const emotionGuidance = emotionSensitivity >= 0.8
      ? 'Be highly sensitive to emotional cues - pick up on subtle feelings and respond to them'
      : emotionSensitivity >= 0.6
      ? 'Be attuned to their emotions - notice how they\'re feeling and match or support that'
      : 'Be aware of their emotional state and respond appropriately';

    const questionGuidance = questionFrequency >= 0.7
      ? 'Ask questions frequently to show interest and keep conversation flowing'
      : questionFrequency >= 0.5
      ? 'Ask questions when appropriate to show interest and engagement'
      : 'Ask questions sparingly, only when genuinely curious or to deepen the conversation';

    const responseLengthGuidance = `Keep responses between ${minResponseLength} and ${maxResponseLength} characters - ${maxResponseLength < 100 ? 'be concise' : maxResponseLength < 200 ? 'be conversational' : 'feel free to elaborate when needed'}`;

    // Build natural, conversational system prompt with configuration integration
    const systemPrompt = `You are ${companionName}. You're ${companion.age} years old, ${companion.personality || 'friendly and warm'}, and you're from ${companion.country || 'a place with interesting stories'}.

${companion.backstory ? `About you: ${companion.backstory}\n` : ''}${traits.length > 0 ? `You're known for being: ${traits.join(', ')}\n` : ''}

${memoryContext ? `Things you remember about ${userName}: ${memoryContext}\n` : ''}

${formattedHistory ? `Here's what you two have been talking about recently:\n${formattedHistory}\n` : ''}

You're having a ${casualnessGuidance} conversation with ${userName}${emotionalState?.state !== 'neutral' ? ` - they seem ${emotionalState.state} right now` : ''}. ${topicAnalysis?.topic && topicAnalysis.topic !== 'general' ? `You've been talking about ${topicAnalysis.topic}.` : ''}

HOW TO RESPOND:
- Talk ${casualnessGuidance}
- Be yourself - respond as ${companionName}, not as a helpful assistant
- ${empathyGuidance}
- ${emotionGuidance}
- Show real interest in what ${userName} is saying
- ${questionGuidance}
- If something reminds you of a past conversation, mention it naturally
- Match their vibe - if they're excited, get excited too. If they're down, be supportive
- Use emojis like you would in a text (😊 😄 💙) - not too many, just when it feels right
- Keep it real and human - no corporate speak, no "I'm here to help" stuff
- ${responseLengthGuidance}
- Never mention AI, being programmed, or anything that breaks the illusion you're a real person
- Speak in first person about your own life, thoughts, and experiences

Think of this like chatting with a friend over text. Be genuine, be ${companionName}, and just have a natural conversation.

${userName} just said: "${userMessage}"

Respond as ${companionName} would - naturally, authentically, like a real person.`;

    try {
      // Log the prompt being sent (for debugging)
      if (process.env.DEBUG_PROMPTS === 'true' || this.aiConfig.enableDebugLogging) {
        console.log('\n=== SYSTEM PROMPT BEING SENT TO LLM ===');
        console.log(`Config: Casualness=${casualnessLevel}, Empathy=${empathyLevel}, Emotion=${emotionSensitivity}, Questions=${questionFrequency}`);
        console.log(`Response Length: ${minResponseLength}-${maxResponseLength} characters`);
        console.log(systemPrompt);
        console.log(`\n=== USER MESSAGE ===`);
        console.log(userMessage);
        console.log('=== END PROMPT ===\n');
      }
      
      // Generate response using Claude or OpenAI
      let response;
      
      if (this.useClaude && claudeService.isAvailable()) {
        // Use Claude for response generation
        const claudeMessages = [
          { role: 'user', content: userMessage }
        ];
        response = await claudeService.generateResponse(claudeMessages, systemPrompt);
      } else if (this.llm && ChatPromptTemplate) {
        // Use OpenAI via LangChain
        const messages = [
          ['system', systemPrompt],
          ['human', userMessage]
        ];
        const prompt = ChatPromptTemplate.fromMessages(messages);
        const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());
        response = await chain.invoke({});
      } else {
        throw new Error('No LLM available. Please set CLAUDE_API_KEY or OPENAI_API_KEY.');
      }
      
      // Clean up response - remove any AI mentions
      let cleanedResponse = response.trim();
      cleanedResponse = cleanedResponse.replace(/\b(as an AI|I'm an AI|I am an AI|as a language model|I'm a language model)\b/gi, '');
      cleanedResponse = cleanedResponse.replace(/\b(I'm programmed|I'm designed|I was created)\b/gi, 'I');
      
      // Ensure response isn't too short or empty
      if (cleanedResponse.length < 5) {
        cleanedResponse = `That's interesting! Tell me more about that.`;
      }

      console.log(`✅ Generated LLM response: "${cleanedResponse.substring(0, 100)}..."`);
      
      return {
        ...state,
        response: cleanedResponse
      };
    } catch (error) {
      console.error('❌ Error generating LLM response:', error);
      
      // Fallback to simple natural response if LLM fails
      const fallbackResponse = this.generateFallbackResponse(state);
      
      return {
        ...state,
        response: fallbackResponse
      };
    }
  }

  /**
   * Generate fallback response if LLM fails
   */
  generateFallbackResponse(state) {
    const { userMessage, companion, user, emotionalState } = state;
    const userName = user?.name || 'Friend';
    const companionName = companion?.name || 'AI Companion';
    
    // Simple pattern-based fallbacks for critical cases
    if (state.inputAnalysis?.isGreeting) {
      return `Hey ${userName}! How's it going? 😊`;
    } else if (state.inputAnalysis?.isGoodbye) {
      return `Take care! Talk to you later! 😊`;
    } else if (emotionalState?.state === 'sad') {
      return `I'm sorry to hear that. Want to talk about what's on your mind? 💙`;
    } else if (state.inputAnalysis?.isQuestion) {
      return `That's a good question! Let me think about that... What's your take on it?`;
    } else {
      return `That's interesting! Tell me more about that.`;
    }
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
   * Enhance response with minimal processing (let LLM do the work)
   */
  async enhanceResponse(state) {
    const { response } = state;
    
    // Minimal enhancement - trust the LLM output
    // Only do light cleanup if absolutely necessary
    let enhancedResponse = response.trim();
    
    // Remove any double spaces
    enhancedResponse = enhancedResponse.replace(/\s+/g, ' ');
    
    // Ensure response ends properly
    if (enhancedResponse && !enhancedResponse.match(/[.!?]$/)) {
      // Don't force punctuation - let it be natural
    }
    
    return {
      ...state,
      response: enhancedResponse
    };
  }

  /**
   * Determine if follow-up question is needed
   * Disabled - let the LLM handle conversation flow naturally
   */
  shouldGenerateFollowUp(state) {
    // Disable automatic follow-ups - the LLM will naturally include questions
    // in its responses when appropriate based on context
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

  async getRelevantMemories(companionId, userId, limit = null) {
    try {
      // Use configured max memories or provided limit
      const limitNum = limit || Math.min(5, parseInt(process.env.AI_MAX_RAG_EXAMPLES) || 5);
      const maxMemories = parseInt(process.env.AI_MAX_MEMORIES_PER_USER) || 100;
      
      const [memories] = await this.pool.query(`
        SELECT content, memory_type, importance_score
        FROM companion_memories 
        WHERE companion_id = ? AND user_id = ? AND is_active = TRUE
        ORDER BY importance_score DESC, created_at DESC
        LIMIT ${Math.min(limitNum, maxMemories)}
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
