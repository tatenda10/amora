const pool = require('../db/connection');
const enhancedOpenaiService = require('./enhancedOpenaiService');
const aiConfig = require('../config/aiCompanionConfig');


class ProactiveEngagementService {
  constructor() {
    // Get configuration from centralized config
    this.config = aiConfig.getProactiveConfig();
    
    // Use centralized database connection pool
    this.pool = pool;
    
    console.log('Proactive Engagement Service initialized successfully');
  }

  /**
   * FINE-TUNING CONFIGURATION METHODS
   * These methods delegate to the centralized configuration
   */

  /**
   * Get proactive engagement configuration
   */
  getProactiveConfig() {
    return aiConfig.getProactiveConfig();
  }

  /**
   * Update proactive engagement configuration dynamically
   */
  updateProactiveConfig(newConfig) {
    return aiConfig.updateProactiveConfig(newConfig);
  }

  /**
   * Get engagement strategy based on fine-tuning config
   */
  getEngagementStrategy() {
    return aiConfig.getProactiveEngagementStrategy();
  }

  /**
   * Apply proactive preset
   */
  applyPreset(presetName) {
    return aiConfig.applyProactivePreset(presetName);
  }

  /**
   * Get engagement instructions
   */
  getEngagementInstructions() {
    return aiConfig.getEngagementInstructions();
  }

  /**
   * Schedule proactive engagements for companions
   */
  async scheduleProactiveEngagements() {
    try {
      const config = this.config;
      
      // Check if proactive engagement is enabled
      if (!config.enabled) {
        console.log('Proactive engagement is disabled');
        return;
      }
      
      console.log('Scheduling proactive engagements...');
      
      // Get all active user-companion relationships based on fine-tuning config
      const [relationships] = await this.pool.execute(`
        SELECT rp.*, c.name as companion_name, u.name as user_name
        FROM relationship_progression rp
        JOIN companions c ON rp.companion_id = c.id
        JOIN users u ON rp.user_id = u.id
        WHERE rp.relationship_stage >= ?
        AND rp.intimacy_level >= ?
        AND rp.trust_level >= ?
        AND rp.last_interaction < DATE_SUB(NOW(), INTERVAL ? HOUR)
        ORDER BY rp.last_interaction ASC
        LIMIT ?
      `, [
        config.minRelationshipStage,
        config.minIntimacyLevel,
        config.minTrustLevel,
        config.minIntervalHours,
        config.maxScheduledEngagements
      ]);
      
      console.log(`Found ${relationships.length} relationships for proactive engagement`);
      
      for (const relationship of relationships) {
        await this.scheduleEngagementForRelationship(relationship);
      }
      
      console.log('Proactive engagement scheduling completed');
      
    } catch (error) {
      console.error('Error scheduling proactive engagements:', error.message);
    }
  }

  /**
   * Schedule engagement for a specific relationship
   */
  async scheduleEngagementForRelationship(relationship) {
    try {
      const { user_id, companion_id, relationship_stage, intimacy_level } = relationship;
      
      // Check if there's already a pending engagement
      const [existingEngagements] = await this.pool.execute(`
        SELECT id FROM proactive_engagements 
        WHERE user_id = ? AND companion_id = ? 
        AND engagement_status IN ('scheduled', 'sent')
        AND scheduled_for > NOW()
      `, [user_id, companion_id]);
      
      if (existingEngagements.length > 0) {
        // Skipping relationship (already has pending engagement)
        return;
      }
      
      // Determine engagement type based on relationship stage and time since last interaction
      const hoursSinceLastInteraction = await this.getHoursSinceLastInteraction(user_id, companion_id);
      const engagementType = this.determineEngagementType(relationship_stage, intimacy_level, hoursSinceLastInteraction);
      
      if (!engagementType) {
        // No engagement needed
        return;
      }
      
      // Generate engagement content
      const engagementContent = await this.generateEngagementContent(
        companion_id, 
        user_id, 
        engagementType, 
        relationship
      );
      
      // Schedule the engagement
      const scheduledTime = this.calculateScheduledTime(hoursSinceLastInteraction);
      
      await this.pool.execute(`
        INSERT INTO proactive_engagements 
        (companion_id, user_id, engagement_type, engagement_content, scheduled_for)
        VALUES (?, ?, ?, ?, ?)
      `, [companion_id, user_id, engagementType, engagementContent, scheduledTime]);
      
      // Scheduled engagement
      
    } catch (error) {
      // Error scheduling engagement
    }
  }

  /**
   * Determine the type of engagement based on relationship context and fine-tuning config
   */
  determineEngagementType(relationshipStage, intimacyLevel, hoursSinceLastInteraction) {
    const config = this.config;
    
    // Check minimum interval
    if (hoursSinceLastInteraction < config.minIntervalHours) {
      return null; // Too soon
    }
    
    // Check-in engagement (longer intervals)
    if (hoursSinceLastInteraction >= config.checkInAfterHours) {
      return 'check_in';
    }
    
    // Emotional support for close relationships
    if (relationshipStage === 'partner' && intimacyLevel >= 8 && 
        hoursSinceLastInteraction >= config.emotionalSupportAfterHours) {
      return 'emotional_support';
    }
    
    // Memory reminder for intimate relationships
    if ((relationshipStage === 'close_friend' || relationshipStage === 'intimate') && 
        hoursSinceLastInteraction >= config.memoryReminderAfterHours) {
      return 'memory_reminder';
    }
    
    // Topic suggestion for friends
    if (relationshipStage === 'friend' && hoursSinceLastInteraction >= config.minIntervalHours) {
      return 'topic_suggestion';
    }
    
    return null;
  }

  /**
   * Generate engagement content using AI
   */
  async generateEngagementContent(companionId, userId, engagementType, relationship) {
    try {
      // Get companion details
      const [companions] = await this.pool.execute(
        'SELECT * FROM companions WHERE id = ?',
        [companionId]
      );
      
      if (companions.length === 0) return "Hey! How are you doing?";
      
      const companion = companions[0];
      
      // Get recent memories
      const [memories] = await this.pool.execute(`
        SELECT content, memory_type FROM companion_memories 
        WHERE companion_id = ? AND user_id = ? AND is_active = TRUE
        ORDER BY importance_score DESC, created_at DESC
        LIMIT 3
      `, [companionId, userId]);
      
      // Get user's recent emotional state
      const [emotionalStates] = await this.pool.execute(`
        SELECT emotional_state, intensity_score FROM user_emotional_states 
        WHERE user_id = ? AND companion_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `, [userId, companionId]);
      
      const prompt = this.buildEngagementPrompt(
        companion, 
        engagementType, 
        relationship, 
        memories, 
        emotionalStates[0]
      );
      
      const config = this.config;
      
      const completion = await enhancedOpenaiService.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.maxMessageLength,
        temperature: config.messageTemperature,
      });
      
      const rawEngagementContent = completion.choices[0].message.content;
      
      // Validate and clean the engagement content
      const engagementContent = aiConfig.validateAIResponse(rawEngagementContent, {
        emotionalState: emotionalStates[0],
        relationship: relationship
      });
      
      return engagementContent;
      
    } catch (error) {
      // Error generating engagement content
      return "Hey! How are you doing?";
    }
  }

  /**
   * Build prompt for engagement content generation
   */
  buildEngagementPrompt(companion, engagementType, relationship, memories, lastEmotionalState) {
    const memoryContext = memories.length > 0 ? 
      `Recent memories: ${memories.map(m => m.content).join(', ')}` : 
      'No specific memories yet';
    
    const emotionalContext = lastEmotionalState ? 
      `Last emotional state: ${lastEmotionalState.emotional_state} (${lastEmotionalState.intensity_score}/10)` : 
      'No recent emotional data';
    
    const engagementInstructions = {
      'check_in': 'Write a caring check-in message. Ask how they are doing and show genuine concern.',
      'memory_reminder': 'Reference a shared memory or experience to reconnect emotionally.',
      'topic_suggestion': 'Suggest an interesting topic to discuss based on their interests.',
      'emotional_support': 'Offer emotional support and let them know you are there for them.',
      'shared_interest': 'Bring up something you both enjoy or are interested in.'
    };
    
    return `You are ${companion.name} (${companion.personality}).

${engagementInstructions[engagementType]}

Relationship stage: ${relationship.relationship_stage}
Intimacy level: ${relationship.intimacy_level}/10
${memoryContext}
${emotionalContext}

Write a natural, personal message that feels authentic to your personality. Keep it conversational and warm. Don't mention that you're checking in or being proactive - just be yourself reaching out naturally.

Respond with ONLY the message content, no explanations.`;
  }

  /**
   * Get hours since last interaction
   */
  async getHoursSinceLastInteraction(userId, companionId) {
    const [result] = await this.pool.execute(`
      SELECT TIMESTAMPDIFF(HOUR, last_interaction, NOW()) as hours_diff
      FROM relationship_progression 
      WHERE user_id = ? AND companion_id = ?
    `, [userId, companionId]);
    
    return result[0]?.hours_diff || 0;
  }

  /**
   * Calculate when to schedule the engagement
   */
  calculateScheduledTime(hoursSinceLastInteraction) {
    const now = new Date();
    
    if (hoursSinceLastInteraction >= 24) {
      // If it's been a day, schedule for next reasonable hour
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
      return nextHour;
    } else {
      // Schedule for a few hours from now
      const scheduledTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
      return scheduledTime;
    }
  }

  /**
   * Process scheduled engagements (send them)
   */
  async processScheduledEngagements() {
    try {
      // Processing scheduled engagements
      
      const [scheduledEngagements] = await this.pool.execute(`
        SELECT pe.*, c.name as companion_name, u.name as user_name
        FROM proactive_engagements pe
        JOIN companions c ON pe.companion_id = c.id
        JOIN users u ON pe.user_id = u.id
        WHERE pe.engagement_status = 'scheduled'
        AND pe.scheduled_for <= NOW()
        ORDER BY pe.scheduled_for ASC
        LIMIT 10
      `);
      
      // Found engagements to process
      
      for (const engagement of scheduledEngagements) {
        await this.sendProactiveEngagement(engagement);
      }
      
      // Scheduled engagements processing completed
      
    } catch (error) {
      // Error processing scheduled engagements
    }
  }

  /**
   * Send a proactive engagement
   */
  async sendProactiveEngagement(engagement) {
    try {
      // Create a new conversation or find existing one
      let conversationId = await this.findOrCreateConversation(engagement.user_id, engagement.companion_id);
      
      // Insert the proactive message
      const [result] = await this.pool.execute(`
        INSERT INTO messages (conversation_id, sender_type, sender_id, content, message_type, created_at, updated_at)
        VALUES (?, 'companion', ?, ?, 'text', NOW(), NOW())
      `, [conversationId, engagement.companion_id, engagement.engagement_content]);
      
      const messageId = result.insertId;
      
      // Update engagement status
      await this.pool.execute(`
        UPDATE proactive_engagements 
        SET engagement_status = 'sent', sent_at = NOW()
        WHERE id = ?
      `, [engagement.id]);
      
      // Update conversation timestamp
      await this.pool.execute(`
        UPDATE conversations SET updated_at = NOW() WHERE id = ?
      `, [conversationId]);
      
      // Sent proactive engagement
      
      // Emit socket event if socket.io is available
      if (global.io) {
        global.io.to(`conversation_${conversationId}`).emit('new_message', {
          conversation_id: conversationId,
          message: {
            id: messageId,
            conversation_id: conversationId,
            sender_type: 'companion',
            sender_id: engagement.companion_id,
            content: engagement.engagement_content,
            message_type: 'text',
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }
      
    } catch (error) {
      // Error sending proactive engagement
      
      // Mark as failed
      await this.pool.execute(`
        UPDATE proactive_engagements 
        SET engagement_status = 'ignored'
        WHERE id = ?
      `, [engagement.id]);
    }
  }

  /**
   * Find or create conversation between user and companion
   */
  async findOrCreateConversation(userId, companionId) {
    // Try to find existing conversation
    const [existingConversations] = await this.pool.execute(`
      SELECT id FROM conversations 
      WHERE user_id = ? AND companion_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId, companionId]);
    
    if (existingConversations.length > 0) {
      return existingConversations[0].id;
    }
    
    // Create new conversation
    const [result] = await this.pool.execute(`
      INSERT INTO conversations (user_id, companion_id, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
    `, [userId, companionId]);
    
    return result.insertId;
  }
}

module.exports = new ProactiveEngagementService();
