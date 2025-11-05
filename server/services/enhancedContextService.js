const pool = require('../db/connection');

class EnhancedContextService {
  constructor() {
    this.db = pool; // Use centralized connection
  }

  /**
   * Track and manage conversation topics naturally
   */
  async trackTopic(conversationId, topicName, topicCategory = 'other', sentiment = 'neutral', contextSummary = '') {
    try {
      // Check if topic already exists for this conversation
      const [existing] = await this.db.execute(
        'SELECT id, mention_count FROM conversation_topics WHERE conversation_id = ? AND topic_name = ?',
        [conversationId, topicName]
      );

      if (existing.length > 0) {
        // Update existing topic - humans remember but not perfectly
        await this.db.execute(
          'UPDATE conversation_topics SET mention_count = mention_count + 1, last_mentioned = NOW(), sentiment = ?, context_summary = ? WHERE id = ?',
          [sentiment, contextSummary, existing[0].id]
        );
        return existing[0].id;
      } else {
        // Create new topic
        const [result] = await this.db.execute(
          'INSERT INTO conversation_topics (conversation_id, topic_name, topic_category, sentiment, context_summary) VALUES (?, ?, ?, ?, ?)',
          [conversationId, topicName, topicCategory, sentiment, contextSummary]
        );
        return result.insertId;
      }
    } catch (error) {
      console.error('Error tracking topic:', error);
      return null;
    }
  }

  /**
   * Get topic history for a conversation - like human memory
   */
  async getTopicHistory(conversationId, limit = 10) {
    try {
      console.log('getTopicHistory called with:', { conversationId, limit, types: { conversationId: typeof conversationId, limit: typeof limit } });
      
      // Handle undefined or null values
      if (conversationId === undefined || conversationId === null) {
        console.error('conversationId is undefined or null');
        return [];
      }
      
      const convId = parseInt(conversationId);
      const limitNum = parseInt(limit);
      
      console.log('Parsed values:', { convId, limitNum });
      
      // Validate parameters
      if (isNaN(convId) || convId <= 0) {
        console.error('Invalid conversationId:', conversationId, 'parsed as:', convId);
        return [];
      }
      
      if (isNaN(limitNum) || limitNum <= 0) {
        console.error('Invalid limit:', limit, 'parsed as:', limitNum);
        return [];
      }
      
      console.log('Executing query with params:', [convId, limitNum]);
      
      const [topics] = await this.db.execute(
        'SELECT * FROM conversation_topics WHERE conversation_id = ? ORDER BY last_mentioned DESC LIMIT ?',
        [convId.toString(), limitNum.toString()]
      );
      
      // Add human-like memory attributes
      return topics.map(topic => ({
        ...topic,
        memoryStrength: this.calculateMemoryStrength(topic.mention_count, topic.last_mentioned),
        recallProbability: this.calculateRecallProbability(topic.mention_count)
      }));
    } catch (error) {
      console.error('Error getting topic history:', error);
      return [];
    }
  }

  /**
   * Calculate how well a human would remember this topic
   */
  calculateMemoryStrength(mentionCount, lastMentioned) {
    const daysAgo = (new Date() - new Date(lastMentioned)) / (1000 * 60 * 60 * 24);
    
    // Recent and frequently mentioned topics are remembered better
    let strength = mentionCount * 0.3;
    
    // Recent topics have stronger memory
    if (daysAgo <= 1) strength += 0.7;
    else if (daysAgo <= 7) strength += 0.4;
    else if (daysAgo <= 30) strength += 0.2;
    
    return Math.min(strength, 1.0);
  }

  /**
   * Calculate probability of recalling this topic naturally
   */
  calculateRecallProbability(mentionCount) {
    // Humans don't remember everything perfectly
    const baseProbability = Math.min(mentionCount * 0.15, 0.8);
    
    // Add some randomness like human memory
    const randomFactor = Math.random() * 0.3;
    
    return baseProbability + randomFactor;
  }

  /**
   * Natural topic detection that feels human
   */
  detectTopicChange(currentMessage, previousTopics = []) {
    const message = currentMessage.toLowerCase();
    
    // More nuanced topic detection
    const topicKeywords = {
      'work': ['work', 'job', 'office', 'career', 'business', 'meeting', 'project', 'boss', 'colleague', 'deadline'],
      'entertainment': ['movie', 'show', 'tv', 'netflix', 'music', 'game', 'book', 'series', 'episode', 'season', 'binge'],
      'food': ['food', 'eat', 'restaurant', 'cooking', 'meal', 'hungry', 'dinner', 'lunch', 'breakfast', 'snack', 'recipe'],
      'travel': ['travel', 'trip', 'vacation', 'flight', 'hotel', 'beach', 'city', 'destination', 'airport', 'sightseeing'],
      'health': ['health', 'exercise', 'gym', 'doctor', 'sick', 'medicine', 'fitness', 'workout', 'diet', 'sleep'],
      'family': ['family', 'mom', 'dad', 'sister', 'brother', 'parents', 'kids', 'cousin', 'aunt', 'uncle'],
      'relationships': ['relationship', 'dating', 'boyfriend', 'girlfriend', 'love', 'marriage', 'partner', 'crush', 'breakup'],
      'hobbies': ['hobby', 'interest', 'sport', 'art', 'craft', 'photography', 'dancing', 'gaming', 'reading', 'painting'],
      'daily_life': ['today', 'yesterday', 'morning', 'evening', 'weekend', 'plan', 'schedule', 'busy', 'tired']
    };
    
    // Find the most relevant topic with confidence
    let detectedTopic = 'general';
    let maxMatches = 0;
    let matchedKeywords = [];
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const matches = keywords.filter(keyword => {
        const hasMatch = message.includes(keyword);
        if (hasMatch) matchedKeywords.push(keyword);
        return hasMatch;
      }).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedTopic = topic;
      }
    }
    
    // Check if this is a new topic or continuation
    const lastTopic = previousTopics.length > 0 ? previousTopics[0].topic_name : null;
    const isNewTopic = detectedTopic !== lastTopic && maxMatches > 0;
    
    // Determine transition type naturally
    let transitionType = 'continuation';
    if (isNewTopic) {
      if (this.isNaturalTransition(lastTopic, detectedTopic)) {
        transitionType = 'natural';
      } else if (this.isAbruptTransition(message)) {
        transitionType = 'abrupt';
      } else {
        transitionType = 'smooth';
      }
    }
    
    return {
      topic: detectedTopic,
      confidence: maxMatches > 0 ? Math.min(maxMatches / 3, 1) : 0.1,
      isNewTopic: isNewTopic,
      transitionType: transitionType,
      matchedKeywords: matchedKeywords,
      topicDepth: this.assessTopicDepth(message, detectedTopic)
    };
  }

  /**
   * Check if topic transition feels natural to humans
   */
  isNaturalTransition(fromTopic, toTopic) {
    const naturalTransitions = {
      'work': ['daily_life', 'health', 'food', 'hobbies'],
      'food': ['health', 'daily_life', 'family', 'travel'],
      'entertainment': ['hobbies', 'daily_life', 'relationships'],
      'health': ['daily_life', 'food', 'work'],
      'family': ['relationships', 'daily_life', 'travel']
    };
    
    return naturalTransitions[fromTopic]?.includes(toTopic) || false;
  }

  /**
   * Check if transition feels abrupt
   */
  isAbruptTransition(message) {
    const abruptIndicators = [
      'anyway', 'changing subject', 'random question', 'completely different',
      'btw', 'by the way', 'oh yeah', 'speaking of'
    ];
    
    return abruptIndicators.some(indicator => message.includes(indicator));
  }

  /**
   * Assess how deeply the user is engaging with the topic
   */
  assessTopicDepth(message, topic) {
    const depthIndicators = {
      shallow: ['like', 'cool', 'nice', 'interesting', 'good', 'bad'],
      medium: ['why', 'how', 'when', 'where', 'think', 'feel', 'opinion'],
      deep: ['because', 'reason', 'experience', 'memory', 'story', 'detail', 'specific']
    };
    
    let depthScore = 0;
    depthIndicators.shallow.forEach(word => {
      if (message.includes(word)) depthScore += 1;
    });
    depthIndicators.medium.forEach(word => {
      if (message.includes(word)) depthScore += 2;
    });
    depthIndicators.deep.forEach(word => {
      if (message.includes(word)) depthScore += 3;
    });
    
    if (depthScore >= 6) return 'deep';
    if (depthScore >= 3) return 'medium';
    return 'shallow';
  }

  /**
   * Enhanced topic detection that considers user interests from signup
   */
  detectTopicChangeWithInterests(currentMessage, previousTopics, userInterests = []) {
    const basicAnalysis = this.detectTopicChange(currentMessage, previousTopics);
    
    // Check if detected topic matches user interests
    const interestMatch = this.checkInterestMatch(basicAnalysis.topic, userInterests);
    
    return {
      ...basicAnalysis,
      interestMatch,
      priority: interestMatch ? 'high' : 'normal',
      engagementLevel: interestMatch ? 'high' : 'medium'
    };
  }

  /**
   * Check if topic matches user interests
   */
  checkInterestMatch(topic, userInterests) {
    const topicInterestMap = {
      'entertainment': ['TV shows', 'movies', 'series', 'entertainment', 'streaming', 'cinema'],
      'personal': ['personal', 'life', 'relationships', 'family', 'friends'],
      'work': ['work', 'career', 'job', 'business', 'professional'],
      'hobbies': ['hobbies', 'sports', 'gaming', 'music', 'art', 'crafts', 'photography'],
      'food': ['food', 'cooking', 'restaurants', 'dining', 'baking', 'recipes'],
      'travel': ['travel', 'vacation', 'tourism', 'places', 'adventure', 'exploring'],
      'health': ['health', 'fitness', 'wellness', 'exercise', 'nutrition']
    };
    
    const relevantInterests = topicInterestMap[topic] || [];
    return userInterests.some(interest => 
      relevantInterests.some(relevant => 
        interest.toLowerCase().includes(relevant.toLowerCase())
      )
    );
  }

  /**
   * Learn and update user communication style naturally
   */
  async updateCommunicationStyle(userId, companionId, messageData) {
    try {
      const {
        messageLength,
        questionCount,
        emojiCount,
        punctuationCount,
        formalityLevel,
        humorLevel,
        emotionalExpression,
        responseTime
      } = this.analyzeMessageStyle(messageData);

      // Get existing style or create new
      const [existing] = await this.db.execute(
        'SELECT * FROM user_communication_styles WHERE user_id = ? AND companion_id = ?',
        [userId, companionId]
      );

      if (existing.length > 0) {
        // Update existing style with gradual learning like human adaptation
        const style = existing[0];
        const learningRate = this.calculateLearningRate(style.sample_count);
        
        await this.db.execute(
          `UPDATE user_communication_styles SET 
           formality_level = ?, 
           humor_preference = ?, 
           response_length_preference = ?, 
           question_frequency = ?, 
           emoji_usage = ?, 
           punctuation_style = ?, 
           emotional_expression = ?, 
           average_response_time = ?,
           sample_count = sample_count + 1,
           learning_confidence = LEAST(0.95, learning_confidence + 0.03),
           last_updated = NOW()
           WHERE user_id = ? AND companion_id = ?`,
          [
            this.updateStyleValue(style.formality_level, formalityLevel, learningRate),
            this.updateStyleValue(style.humor_preference, humorLevel, learningRate),
            this.updateStyleValue(style.response_length_preference, messageLength, learningRate),
            this.updateStyleValue(style.question_frequency, questionCount, learningRate),
            this.updateStyleValue(style.emoji_usage, emojiCount, learningRate),
            this.updateStyleValue(style.punctuation_style, punctuationCount, learningRate),
            this.updateStyleValue(style.emotional_expression, emotionalExpression, learningRate),
            this.updateResponseTime(style.average_response_time, responseTime, style.sample_count),
            userId, companionId
          ]
        );
      } else {
        // Create new style record
        await this.db.execute(
          `INSERT INTO user_communication_styles 
           (user_id, companion_id, formality_level, humor_preference, response_length_preference, 
            question_frequency, emoji_usage, punctuation_style, emotional_expression, average_response_time, sample_count) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [userId, companionId, formalityLevel, humorLevel, messageLength, 
           questionCount, emojiCount, punctuationCount, emotionalExpression, responseTime]
        );
      }
    } catch (error) {
      console.error('Error updating communication style:', error);
    }
  }

  /**
   * Calculate learning rate - humans learn quickly at first, then slower
   */
  calculateLearningRate(sampleCount) {
    if (sampleCount < 10) return 0.2;      // Fast learning initially
    if (sampleCount < 50) return 0.1;      // Moderate learning
    return 0.05;                           // Slow refinement
  }

  /**
   * Update response time with running average
   */
  updateResponseTime(currentAverage, newTime, sampleCount) {
    if (!currentAverage) return newTime;
    return (currentAverage * sampleCount + newTime) / (sampleCount + 1);
  }

  /**
   * Enhanced message style analysis
   */
  analyzeMessageStyle(message) {
    const text = message.toLowerCase();
    
    return {
      messageLength: this.categorizeLength(message.length),
      questionCount: this.categorizeFrequency((message.match(/\?/g) || []).length / Math.max(message.length, 1)),
      emojiCount: this.categorizeEmojiUsage((message.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length, message.length),
      punctuationCount: this.categorizePunctuation((message.match(/[.!?]/g) || []).length / Math.max(message.length, 1)),
      formalityLevel: this.detectFormality(text),
      humorLevel: this.detectHumor(text),
      emotionalExpression: this.detectEmotionalExpression(text),
      responseTime: Math.floor(Date.now() / 1000) // Convert to seconds instead of milliseconds
    };
  }

  /**
   * More nuanced style detection
   */
  detectFormality(text) {
    const formalWords = ['please', 'thank you', 'appreciate', 'regarding', 'concerning', 'sincerely'];
    const casualWords = ['hey', 'yo', 'sup', 'cool', 'awesome', 'lol', 'haha', 'omg', 'btw', 'idk'];
    const slangWords = ['lit', 'fam', 'savage', 'ghost', 'salty', 'woke'];
    
    const formalCount = formalWords.filter(word => text.includes(word)).length;
    const casualCount = casualWords.filter(word => text.includes(word)).length;
    const slangCount = slangWords.filter(word => text.includes(word)).length;
    
    if (slangCount > 0) return 'very_casual';
    if (casualCount > formalCount + 2) return 'very_casual';
    if (casualCount > formalCount) return 'casual';
    if (formalCount > casualCount) return 'formal';
    return 'casual';
  }

  detectHumor(text) {
    const humorWords = ['funny', 'hilarious', 'lol', 'haha', 'lmao', 'joke', 'laugh', 'comedy'];
    const sarcasmWords = ['sure', 'right', 'obviously', 'totally', 'of course', 'clearly'];
    
    const humorCount = humorWords.filter(word => text.includes(word)).length;
    const sarcasmCount = sarcasmWords.filter(word => text.includes(word)).length;
    
    if (sarcasmCount > 0) return 'sarcastic';
    if (humorCount > 2) return 'heavy';
    if (humorCount > 0) return 'moderate';
    return 'light';
  }

  detectEmotionalExpression(text) {
    const strongEmotions = ['love', 'hate', 'excited', 'angry', 'furious', 'ecstatic', 'devastated'];
    const moderateEmotions = ['happy', 'sad', 'annoyed', 'frustrated', 'nervous', 'proud'];
    const reservedWords = ['okay', 'fine', 'good', 'bad', 'yes', 'no', 'maybe'];
    
    const strongCount = strongEmotions.filter(word => text.includes(word)).length;
    const moderateCount = moderateEmotions.filter(word => text.includes(word)).length;
    const reservedCount = reservedWords.filter(word => text.includes(word)).length;
    
    if (strongCount > 0) return 'expressive';
    if (moderateCount > reservedCount) return 'moderate';
    return 'reserved';
  }

  /**
   * Generate natural topic transition phrases that feel human
   */
  generateTransitionPhrase(fromTopic, toTopic, userStyle, culturalContext) {
    const style = userStyle?.formality_level || 'casual';
    
    const transitionPhrases = {
      'very_casual': [
        "Oh btw...", "Speaking of...", "That reminds me!", "Random but...",
        "Wait I just thought of something...", "This is totally off topic but...",
        "You know what else?", "Changing gears for a sec..."
      ],
      'casual': [
        "That reminds me...", "Speaking of that...", "On a related note...",
        "By the way...", "Actually, that makes me think...", "You know what's interesting?",
        "I was just thinking about...", "This might be random but..."
      ],
      'formal': [
        "That brings to mind...", "In relation to that...", "Furthermore...",
        "Additionally...", "On another note...", "Shifting topics slightly...",
        "If I may change the subject briefly...", "This reminds me of..."
      ]
    };

    const phrases = transitionPhrases[style] || transitionPhrases.casual;
    
    // Add some variety - humans don't use the same phrases every time
    return this.pickRandom(phrases);
  }

  /**
   * Generate natural follow-up questions based on topic depth
   */
  generateFollowUpQuestion(topic, topicDepth, userInterests = []) {
    const questions = {
      'work': {
        shallow: ["How was work today?", "Busy day at work?", "Anything interesting happen at work?"],
        medium: ["What's the most challenging part of your work right now?", "Working on any exciting projects?", "How's the team dynamic at work?"],
        deep: ["What do you love most about your career path?", "How has your work changed your perspective on things?", "What's the biggest lesson you've learned from your job?"]
      },
      'entertainment': {
        shallow: ["Watch anything good lately?", "Seen any good movies?", "Listening to any new music?"],
        medium: ["What shows are you really into right now?", "Any movies that really surprised you recently?", "Discover any new artists you love?"],
        deep: ["What's a piece of media that changed how you see the world?", "Why do you think that story resonated with you so much?", "How do you choose what to watch or read next?"]
      },
      'food': {
        shallow: ["What did you eat today?", "Tried any good restaurants?", "Cooking anything fun?"],
        medium: ["What's your go-to comfort food and why?", "Any cooking disasters or successes lately?", "What cuisine have you been craving?"],
        deep: ["What food memories from your childhood stand out?", "How does food connect to your cultural background?", "What's the most meaningful meal you've ever had?"]
      }
    };

    const topicQuestions = questions[topic] || questions.entertainment;
    const depth = topicDepth in topicQuestions ? topicDepth : 'medium';
    
    return this.pickRandom(topicQuestions[depth]);
  }

  pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Assess conversation flow quality
   */
  assessConversationFlow(messages, topics) {
    if (messages.length < 3) return 'establishing';
    
    const recentMessages = messages.slice(-5);
    const topicChanges = this.countTopicChanges(recentMessages, topics);
    const engagementLevel = this.measureEngagement(recentMessages);
    
    if (topicChanges > 3) return 'scattered';
    if (engagementLevel < 0.3) return 'struggling';
    if (engagementLevel > 0.7) return 'flowing';
    return 'steady';
  }

  countTopicChanges(messages, topics) {
    // Simplified implementation
    return Math.floor(messages.length / 2);
  }

  measureEngagement(messages) {
    // Simplified engagement measurement
    const engagementSignals = messages.filter(msg => 
      msg.length > 10 && 
      (msg.includes('?') || msg.includes('!') || msg.length > 20)
    ).length;
    
    return engagementSignals / messages.length;
  }

  /**
   * Get user cultural context
   */
  async getUserCulturalContext(userId) {
    try {
      const [rows] = await this.db.execute(
        'SELECT * FROM user_cultural_context WHERE user_id = ?',
        [userId]
      );
      if (rows.length === 0) {
        return null;
      }
      const context = rows[0];
      return {
        country: context.country,
        language: context.language,
        timezone: context.timezone,
        culturalNorms: this.parseJSONField(context.cultural_norms, {})
      };
    } catch (error) {
      console.error('Error getting user cultural context:', error);
      return null;
    }
  }

  /**
   * Get cultural norms for a country
   */
  getCulturalNorms(country) {
    const baseNorms = {
      'US': {
        formality: 'casual',
        directness: 'high',
        personalSpace: 'medium',
        humor: 'sarcastic',
        communication: 'direct'
      },
      'UK': {
        formality: 'polite',
        directness: 'medium',
        personalSpace: 'high',
        humor: 'dry',
        communication: 'indirect'
      },
      'JP': {
        formality: 'high',
        directness: 'low',
        personalSpace: 'high',
        humor: 'subtle',
        communication: 'contextual'
      },
      'DE': {
        formality: 'high',
        directness: 'very_high',
        personalSpace: 'high',
        humor: 'dry',
        communication: 'direct'
      },
      'FR': {
        formality: 'medium',
        directness: 'medium',
        personalSpace: 'medium',
        humor: 'witty',
        communication: 'eloquent'
      }
    };

    return baseNorms[country] || baseNorms['US'];
  }

  /**
   * Parse JSON field safely
   */
  parseJSONField(field, defaultValue = null) {
    try {
      if (field === null || field === undefined) {
        return defaultValue;
      }
      
      if (typeof field === 'object') {
        return field;
      }
      
      if (typeof field === 'string') {
        return JSON.parse(field);
      }
      
      return defaultValue;
    } catch (error) {
      console.error('Error parsing JSON field:', error);
      return defaultValue;
    }
  }

  /**
   * Initialize cultural context from user profile
   */
  async initializeCulturalContextFromProfile(userId, userProfile) {
    try {
      const culturalNorms = this.getCulturalNorms(userProfile.country || 'US');
      
      await this.db.execute(
        `INSERT INTO user_cultural_context (user_id, country, language, timezone, cultural_norms, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE 
         country = VALUES(country),
         language = VALUES(language),
         timezone = VALUES(timezone),
         cultural_norms = VALUES(cultural_norms),
         updated_at = NOW()`,
        [userId, userProfile.country || 'US', userProfile.language || 'en', userProfile.timezone || 'UTC', JSON.stringify(culturalNorms)]
      );
      
      return {
        country: userProfile.country || 'US',
        language: userProfile.language || 'en',
        timezone: userProfile.timezone || 'UTC',
        culturalNorms: culturalNorms
      };
    } catch (error) {
      console.error('Error initializing cultural context from profile:', error);
      return null;
    }
  }

  /**
   * Handle topic transition
   */
  async handleTopicTransition(conversationId, fromTopic, toTopic, transitionType, userMessage) {
    try {
      await this.db.execute(
        `INSERT INTO topic_transitions (conversation_id, from_topic, to_topic, transition_type, user_message, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [conversationId, fromTopic, toTopic, transitionType, userMessage]
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error handling topic transition:', error);
      return { success: false };
    }
  }

  /**
   * Generate transition phrase
   */
  generateTransitionPhrase(fromTopic, toTopic, userStyle, culturalContext) {
    const transitionPhrases = [
      `Speaking of ${fromTopic}, that reminds me of ${toTopic}`,
      `Oh, that's interesting! Speaking of ${toTopic}`,
      `That's cool! I was just thinking about ${toTopic}`,
      `Nice! That reminds me of ${toTopic}`,
      `Oh yeah! ${toTopic} is also really interesting`
    ];
    
    return transitionPhrases[Math.floor(Math.random() * transitionPhrases.length)];
  }

  /**
   * Categorize message length
   */
  categorizeLength(length) {
    if (length < 20) return 'short';
    if (length < 100) return 'medium';
    return 'long';
  }

  /**
   * Categorize message frequency
   */
  categorizeFrequency(frequency) {
    if (frequency < 0.1) return 'low';
    if (frequency < 0.3) return 'medium';
    return 'high';
  }

  /**
   * Categorize emoji usage
   */
  categorizeEmojiUsage(emojiCount, messageLength) {
    const emojiRatio = emojiCount / messageLength;
    if (emojiRatio === 0) return 'none';
    if (emojiRatio < 0.1) return 'light';
    return 'heavy';
  }

  categorizePunctuation(punctuationRatio) {
    if (punctuationRatio === 0) return 'minimal';
    if (punctuationRatio < 0.1) return 'standard';
    return 'heavy';
  }

  updateStyleValue(currentValue, newValue, learningRate = 0.1) {
    // Simple weighted average for style learning
    if (!currentValue) return newValue;
    if (currentValue === newValue) return currentValue;
    
    // For categorical values, use frequency-based learning
    return Math.random() < learningRate ? newValue : currentValue;
  }

  updateResponseTime(currentTime, newTime, sampleCount) {
    if (!currentTime || sampleCount === 0) return newTime;
    
    // Calculate weighted average
    const weight = 1 / (sampleCount + 1);
    return Math.floor(currentTime * (1 - weight) + newTime * weight);
  }

  /**
   * Get user communication style
   */
  async getUserCommunicationStyle(userId, companionId) {
    try {
      const [rows] = await this.db.execute(
        'SELECT * FROM user_communication_styles WHERE user_id = ? AND companion_id = ?',
        [userId, companionId]
      );
      
      if (rows.length === 0) {
        return {
          formality_level: 'casual',
          humor_preference: 'friendly',
          emoji_usage: 'light',
          emotional_expression: 'moderate',
          response_length: 'medium'
        };
      }
      
      return rows[0];
    } catch (error) {
      console.error('Error getting user communication style:', error);
      return {
        formality_level: 'casual',
        humor_preference: 'friendly',
        emoji_usage: 'light',
        emotional_expression: 'moderate',
        response_length: 'medium'
      };
    }
  }

  /**
   * Close database connection
   */
  async close() {
    // No need to close - using centralized connection pool
    console.log('EnhancedContextService: Using centralized connection pool');
  }
}

module.exports = EnhancedContextService;