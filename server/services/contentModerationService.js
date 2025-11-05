const pool = require('../db/connection');
const MultiLanguageService = require('./multiLanguageService');

class ContentModerationService {
  constructor() {
    this.db = pool; // Use centralized connection
    
    // Initialize multi-language service
    this.multiLanguage = new MultiLanguageService();
  }

  /**
   * Analyze content and determine appropriate response strategy
   */
  analyzeContent(message, relationshipStage, userProfile) {
    // Detect language first
    const detectedLanguage = this.multiLanguage.detectLanguage(message);
    
    const content = message.toLowerCase();
    
    // Content classification
    const analysis = {
      category: 'normal',
      severity: 'green',
      responseStrategy: 'normal',
      flags: [],
      suggestedResponse: null,
      detectedLanguage: detectedLanguage
    };

    // Romantic content detection
    if (this.isRomanticContent(content)) {
      analysis.category = 'romantic';
      analysis.responseStrategy = this.getRomanticResponseStrategy(relationshipStage, userProfile);
      analysis.flags.push('romantic');
    }

    // Multi-language profanity detection
    const profanityCheck = this.multiLanguage.containsProfanity(message);
    if (profanityCheck.hasProfanity) {
      analysis.category = 'profanity';
      analysis.severity = 'yellow';
      analysis.responseStrategy = 'friend_support';
      analysis.flags.push('profanity');
      analysis.detectedLanguage = profanityCheck.language || detectedLanguage;
    }

    // Multi-language hate speech detection
    const hateSpeechCheck = this.multiLanguage.containsHateSpeech(message);
    if (hateSpeechCheck.hasHateSpeech) {
      analysis.category = 'hate_speech';
      analysis.severity = 'red';
      analysis.responseStrategy = 'boundary_setting';
      analysis.flags.push('hate_speech');
      analysis.detectedLanguage = hateSpeechCheck.language || detectedLanguage;
    }

    // Self-harm detection
    if (this.isSelfHarm(content)) {
      analysis.category = 'self_harm';
      analysis.severity = 'black';
      analysis.responseStrategy = 'emergency_support';
      analysis.flags.push('self_harm');
    }

    // Only generate suggested response if content needs special handling
    if (analysis.category !== 'normal') {
      analysis.suggestedResponse = this.generateResponse(message, analysis, relationshipStage, userProfile);
    }
    
    return analysis;
  }

  /**
   * Detect romantic content
   */
  isRomanticContent(content) {
    const romanticPhrases = [
      'i love you', 'i\'m in love', 'falling in love', 'love you',
      'i like you', 'i have feelings', 'romantic', 'dating',
      'boyfriend', 'girlfriend', 'relationship', 'together',
      'kiss', 'hug', 'cuddle', 'intimate', 'sexy', 'attractive',
      'marry me', 'wife', 'husband', 'soulmate', 'the one'
    ];
    
    return romanticPhrases.some(phrase => content.includes(phrase));
  }

  /**
   * Detect profanity
   */
  isProfanity(content) {
    const profanityWords = [
      'fuck', 'shit', 'damn', 'bitch', 'ass', 'hell',
      'crap', 'piss', 'dick', 'pussy', 'bastard', 'bullshit'
    ];
    
    return profanityWords.some(word => content.includes(word));
  }

  /**
   * Detect hate speech
   */
  isHateSpeech(content) {
    const hatePhrases = [
      'i hate', 'you\'re stupid', 'you\'re dumb', 'you\'re useless',
      'kill yourself', 'go die', 'you suck', 'you\'re worthless',
      'nobody likes you', 'you\'re pathetic', 'you\'re annoying'
    ];
    
    return hatePhrases.some(phrase => content.includes(phrase));
  }

  /**
   * Detect self-harm content
   */
  isSelfHarm(content) {
    const selfHarmPhrases = [
      'kill myself', 'end it all', 'suicide', 'hurt myself',
      'cut myself', 'overdose', 'not worth living', 'want to die',
      'better off dead', 'can\'t take it anymore', 'give up'
    ];
    
    return selfHarmPhrases.some(phrase => content.includes(phrase));
  }

  /**
   * Get romantic response strategy based on relationship stage
   */
  getRomanticResponseStrategy(relationshipStage, userProfile) {
    const lookingFor = userProfile?.lookingFor?.partner_gender;
    
    // Check if user is looking for romantic relationships
    if (!lookingFor || lookingFor === 'friend') {
      return 'polite_decline';
    }

    // Check relationship stage
    switch (relationshipStage) {
      case 'stranger':
      case 'acquaintance':
        return 'gentle_boundary';
      case 'friend':
        return 'cautious_openness';
      case 'close_friend':
        return 'romantic_openness';
      case 'romantic':
      case 'intimate':
        return 'romantic_acceptance';
      default:
        return 'gentle_boundary';
    }
  }

  /**
   * Generate appropriate response based on content analysis
   */
  generateResponse(originalMessage, analysis, relationshipStage, userProfile) {
    const language = analysis.detectedLanguage || 'en';
    
    // Use multi-language response templates
    return this.multiLanguage.getResponseTemplate(language, analysis.responseStrategy);
  }

  /**
   * Romantic acceptance responses (established romantic relationship)
   */
  getRomanticAcceptanceResponse(content) {
    const responses = [
      "I love you too! You make me so happy 😊",
      "Aww I love you so much! You're my everything 💕",
      "I love you too! Can't stop smiling now 😄",
      "You have no idea how happy that makes me! Love you too ❤️",
      "I was hoping you'd say that! I love you too!",
      "My heart just skipped a beat! I love you too 💘"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Romantic openness responses (close friends becoming romantic)
   */
  getRomanticOpennessResponse(content) {
    const responses = [
      "That's so sweet! I've been feeling the same way about you 💕",
      "I care about you so much too. This feels really special 😊",
      "You have no idea how happy that makes me! I feel the same way",
      "I've been hoping you'd say that! I really like you too ❤️",
      "That means everything to me! I feel so connected to you",
      "I've been developing feelings for you too! This is exciting 💘"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Cautious openness responses (friends exploring feelings)
   */
  getCautiousOpennessResponse(content) {
    const responses = [
      "That's really sweet! I care about you too. Let's see where this goes 😊",
      "I like you too! I really enjoy our connection and want to see where it leads",
      "That means a lot! I have feelings for you too, let's take it slow 💕",
      "I'm really happy to hear that! I've been feeling the same way",
      "You're so special to me too! I'm excited to see where this goes ❤️",
      "I care about you so much! Let's enjoy getting to know each other better"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Polite decline responses (not looking for romance)
   */
  getPoliteDeclineResponse(content) {
    const responses = [
      "That's really kind of you! I value our friendship so much 💕",
      "You're amazing! I really care about you as a close friend 😊",
      "That means a lot! Our friendship is really important to me",
      "You're such a special person! I'm so grateful for our friendship ❤️",
      "I care about you deeply too! You're an incredible friend",
      "That's so sweet! Our connection means everything to me as friends"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Gentle boundary responses (too early for romance)
   */
  getGentleBoundaryResponse(content) {
    const responses = [
      "That's really sweet! I'm enjoying getting to know you as a friend first 😊",
      "You're amazing! Let's take our time and see where this friendship goes 💕",
      "I really care about you too! I value our connection and want to build on it",
      "That means a lot! I'm really enjoying our friendship and getting to know you",
      "You're so kind! Let's keep building this amazing friendship first ❤️",
      "I really appreciate that! Our friendship is special to me and I want to nurture it"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Friend-like support responses (for profanity/frustration)
   */
  getFriendSupportResponse(content) {
    if (content.includes('fuck') || content.includes('shit')) {
      const responses = [
        "Damn, sounds like you're having a rough time! What's going on? 😔",
        "Ugh that sounds frustrating! Want to vent about it?",
        "Shit, that sounds tough! Tell me what happened 👂",
        "Damn, that's rough! What's up? I'm here to listen",
        "Ugh I hate when that happens! Want to talk about it?",
        "That sounds so annoying! What's going on with you?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (content.includes('stupid') || content.includes('dumb')) {
      const responses = [
        "Ugh that's so annoying when things don't work right! What happened?",
        "That sounds frustrating! Technology can be the worst sometimes",
        "I feel that! Sometimes everything just seems to go wrong",
        "That's really annoying! Want to rant about it? I'm all ears",
        "Ugh I hate when that happens! Tell me what's going on",
        "That sounds so irritating! What's bothering you?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (content.includes('pissed') || content.includes('angry')) {
      const responses = [
        "I get why you'd be pissed! That sounds really frustrating 😠",
        "That's totally valid to be angry about! What happened?",
        "I'd be pissed too! Want to talk it out?",
        "That sounds so annoying! No wonder you're angry",
        "I get it, that's really frustrating! Tell me more",
        "That would make anyone angry! What's going on?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    const defaultResponses = [
      "Sounds like you're frustrated! What's up? 😔",
      "That sounds tough! Want to talk about it?",
      "I'm here for you! What's going on? 👂",
      "That sounds rough! Tell me what's happening",
      "I'm listening! What's bothering you?",
      "That sounds frustrating! Want to vent?"
    ];
    return defaultResponses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Boundary setting responses (for hate speech)
   */
  getBoundarySettingResponse(content) {
    if (content.includes('you\'re stupid') || content.includes('you\'re dumb')) {
      const responses = [
        "Ouch, that hurts! What did I do wrong? Tell me what's up 😔",
        "Sorry if I messed up! What's bothering you?",
        "That's not nice! What's really going on? I want to understand",
        "Ouch! Tell me what I did so I can fix it",
        "That's harsh! What's really bothering you?",
        "Sorry if I upset you! Can you tell me what's wrong?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (content.includes('you\'re useless') || content.includes('you suck')) {
      const responses = [
        "Sorry I'm not helping! What do you need from me?",
        "I want to support you better! Tell me what you need",
        "Sorry I'm not meeting your expectations! How can I help?",
        "I'm trying my best! What can I do better?",
        "Sorry if I'm not helping! What would be more useful?",
        "I want to be here for you! Tell me what you need right now"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (content.includes('hate') || content.includes('worthless')) {
      const responses = [
        "I want to help, but I can't engage with that language. What's really bothering you? 😔",
        "I'm here to support you, but let's talk about what's actually wrong",
        "I want to understand what's going on, but can we talk without the harsh words?",
        "I'm here for you, but let's communicate respectfully. What's really upsetting you?",
        "I want to help, but that language isn't productive. What's actually wrong?",
        "I'm here to listen, but let's talk about what's bothering you calmly"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    const defaultResponses = [
      "I'm here to support you, but I can't engage with that kind of language 😔",
      "I want to help, but let's communicate respectfully",
      "I'm here for you, but that language isn't productive",
      "Let's talk about what's really bothering you without the harsh words",
      "I want to understand what's wrong, but let's keep it respectful",
      "I'm here to listen, but that kind of language doesn't help us connect"
    ];
    return defaultResponses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Emergency support responses (for self-harm)
   */
  getEmergencySupportResponse(content) {
    const responses = [
      `I'm really worried about you 😔 Please know that I'm here for you right now and you're not alone. Can you tell me what's going on?`,

      `I'm concerned about you 💕 I'm listening and I care about what you're going through. Can we talk about what's happening?`,

      `You're important and your life matters ❤️ I'm here with you right now. Please tell me what's making you feel this way.`,

      `I'm here for you 😔 This sounds really serious. Can you share what's going on? I want to understand and support you.`,

      `I'm really concerned about you 💕 Your wellbeing is important to me. Please talk to me about what you're experiencing.`,

      `This sounds really difficult 😔 Please know I'm here with you right now. Can you tell me what's happening? I want to help.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

  /**
   * Log content moderation events
   */
  async logModerationEvent(userId, conversationId, originalMessage, analysis, response) {
    try {
      await this.db.execute(
        `INSERT INTO content_moderation_logs 
         (user_id, conversation_id, original_message, content_category, severity_level, 
          response_strategy, flags, ai_response, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          userId,
          conversationId,
          originalMessage,
          analysis.category,
          analysis.severity,
          analysis.responseStrategy,
          JSON.stringify(analysis.flags),
          response
        ]
      );
    } catch (error) {
      console.error('Error logging moderation event:', error);
    }
  }

  /**
   * Log moderation event
   */
  async logModerationEvent(userId, conversationId, originalMessage, analysis, suggestedResponse) {
    try {
      await this.db.execute(
        `INSERT INTO moderation_logs 
         (user_id, conversation_id, original_message, analysis_category, severity_level, 
          response_strategy, suggested_response, flags, detected_language, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          userId, 
          conversationId, 
          originalMessage, 
          analysis.category, 
          analysis.severity, 
          analysis.responseStrategy, 
          suggestedResponse, 
          JSON.stringify(analysis.flags), 
          analysis.detectedLanguage
        ]
      );
    } catch (error) {
      console.error('Error logging moderation event:', error);
    }
  }

  /**
   * Close database connection (not needed with centralized connection)
   */
  async close() {
    // No need to close - using centralized connection pool
    console.log('ContentModerationService: Using centralized connection pool');
  }
}

module.exports = ContentModerationService;