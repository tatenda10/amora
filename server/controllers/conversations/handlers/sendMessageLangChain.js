const pool = require('../../../db/connection');
const langchainService = require('../../../services/langchain/langchainService');
const langgraphAgent = require('../../../services/langchain/langgraphAgent');
const memoryService = require('../../../services/langchain/memoryService');
const toolsService = require('../../../services/langchain/toolsService');
const logger = require('../../../utils/logger');

/**
 * Send a message in a conversation with LangChain/LangGraph AI response
 * This is the new enhanced version using LangChain and LangGraph
 */
async function sendMessageLangChain(req, res) {
  try {
    const { conversation_id } = req.params;
    const { content, message_type = 'text', use_langgraph = true } = req.body;
    const user_id = req.user?.id;

    // Input validation is handled by middleware, but double-check
    if (!content) {
      return res.status(400).json({ message: 'content is required' });
    }

    if (!user_id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get conversation and companion details
    const [conversations] = await pool.execute(`
      SELECT 
        c.*,
        comp.id as companion_id,
        comp.name as companion_name,
        comp.personality as companion_personality,
        comp.traits as companion_traits,
        comp.backstory as companion_backstory,
        comp.age as companion_age,
        comp.country as companion_country
      FROM conversations c 
      LEFT JOIN companions comp ON c.companion_id = comp.id 
      WHERE c.id = ?
    `, [conversation_id]);

    if (conversations.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const conversation = conversations[0];

    // Store user message
    const [result] = await pool.execute(`
      INSERT INTO messages (conversation_id, sender_type, sender_id, content, message_type, created_at, updated_at)
      VALUES (?, 'user', ?, ?, ?, NOW(), NOW())
    `, [conversation_id, user_id, content, message_type]);

    const userMessageId = result.insertId;

    // Update conversation timestamp
    await pool.execute(
      'UPDATE conversations SET updated_at = NOW() WHERE id = ?',
      [conversation_id]
    );

    // Get the stored user message
    const [userMessages] = await pool.execute(
      'SELECT * FROM messages WHERE id = ?',
      [userMessageId]
    );

    const userMessage = userMessages[0];

    let aiResponse = null;
    try {
      // Add timeout for AI response generation (30 seconds)
      const AI_TIMEOUT = 30000;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AI response timeout')), AI_TIMEOUT);
      });

      let aiResponseContent;
      if (use_langgraph) {
        // Use LangGraph agent for sophisticated conversation flow
        logger.debug('Using LangGraph agent for response generation');
        aiResponseContent = await Promise.race([
          langgraphAgent.processMessage({
            companionId: conversation.companion_id,
            userId: user_id,
            conversationId: conversation_id,
            userMessage: content
          }),
          timeoutPromise
        ]);
      } else {
        // Use LangChain service for simpler conversation chain
        logger.debug('Using LangChain service for response generation');
        aiResponseContent = await Promise.race([
          langchainService.generateResponse({
            companionId: conversation.companion_id,
            userId: user_id,
            conversationId: conversation_id,
            userMessage: content
          }),
          timeoutPromise
        ]);
      }

      // Store AI response
      const [aiResult] = await pool.execute(`
        INSERT INTO messages (conversation_id, sender_type, sender_id, content, message_type, created_at, updated_at)
        VALUES (?, 'companion', ?, ?, 'text', NOW(), NOW())
      `, [conversation_id, conversation.companion_id.toString(), aiResponseContent]);

      const aiMessageId = aiResult.insertId;
      const [aiMessages] = await pool.execute(
        'SELECT * FROM messages WHERE id = ?',
        [aiMessageId]
      );
      aiResponse = aiMessages[0];

      // Extract and store memories from this interaction
      await memoryService.extractAndStoreMemories(
        conversation.companion_id,
        user_id,
        conversation_id,
        content,
        aiResponseContent
      );

    } catch (aiError) {
      logger.error('AI response generation error:', {
        error: aiError.message,
        conversationId: conversation_id,
        userId: user_id,
        isTimeout: aiError.message === 'AI response timeout'
      });
      
      // Return a graceful fallback response instead of throwing
      if (aiError.message === 'AI response timeout') {
        aiResponseContent = "Sorry, I'm taking a bit longer than usual to respond. Can you try again?";
      } else {
        // For other errors, use a generic fallback
        aiResponseContent = "I'm having trouble responding right now. Could you rephrase that?";
      }
      
      // Store fallback response
      const [fallbackResult] = await pool.execute(`
        INSERT INTO messages (conversation_id, sender_type, sender_id, content, message_type, created_at, updated_at)
        VALUES (?, 'companion', ?, ?, 'text', NOW(), NOW())
      `, [conversation_id, conversation.companion_id.toString(), aiResponseContent]);

      const fallbackMessageId = fallbackResult.insertId;
      const [fallbackMessages] = await pool.execute(
        'SELECT * FROM messages WHERE id = ?',
        [fallbackMessageId]
      );
      aiResponse = fallbackMessages[0];
    }

    // Send real-time update via Socket.IO
    if (req.app.get('io') && aiResponse) {
      req.app.get('io').to(`conversation_${conversation_id}`).emit('new_message', {
        conversation_id,
        message: aiResponse
      });
    }

    res.status(201).json({
      user_message_id: userMessageId,
      user_message: userMessage,
      ai_response: aiResponse,
      message: 'Message sent successfully',
      ai_system: use_langgraph ? 'langgraph' : 'langchain'
    });

  } catch (error) {
    logger.error('Error in sendMessageLangChain:', {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      conversationId: req.params.conversation_id,
      userId: req.user?.id
    });
    
    res.status(500).json({ 
      message: 'Error sending message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get conversation with LangChain-enhanced context
 */
async function getConversationLangChain(req, res) {
  try {
    const { conversation_id } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    // Get conversation details
    const [conversations] = await pool.execute(`
      SELECT 
        c.*,
        comp.name as companion_name,
        comp.profile_image_url,
        comp.personality
      FROM conversations c
      LEFT JOIN companions comp ON c.companion_id = comp.id
      WHERE c.id = ?
    `, [conversation_id]);

    if (conversations.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const conversation = conversations[0];

    // Get messages with pagination
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const [messages] = await pool.query(`
      SELECT 
        id,
        conversation_id,
        sender_type,
        sender_id,
        content,
        message_type,
        created_at,
        updated_at
      FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `, [conversation_id]);

    // Get message count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM messages WHERE conversation_id = ?',
      [conversation_id]
    );

    const totalMessages = countResult[0].total;
    const totalPages = Math.ceil(totalMessages / limit);

    // Get LangChain-enhanced context
    let langchainContext = null;
    const user_id = req.user?.id;
    if (user_id) {
      // Get relevant memories
      const memories = await memoryService.getRelevantMemories(
        conversation.companion_id,
        user_id,
        5
      );

      // Get memory statistics
      const memoryStats = await memoryService.getMemoryStats(
        conversation.companion_id,
        user_id
      );

      langchainContext = {
        memories: memories.slice(0, 3), // Show top 3 memories
        memory_stats: memoryStats,
        available_tools: toolsService.getAllTools().map(tool => ({
          name: tool.name,
          description: tool.description
        }))
      };
    }

    res.json({
      conversation,
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        total: totalMessages,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      langchain_context: langchainContext
    });

  } catch (error) {
    logger.error('Error in getConversationLangChain:', {
      error: error.message,
      conversationId: req.params.conversation_id
    });
    
    res.status(500).json({ 
      message: 'Error fetching conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get memory insights for a conversation
 */
async function getMemoryInsights(req, res) {
  try {
    const { conversation_id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get conversation details
    const [conversations] = await pool.execute(
      'SELECT companion_id FROM conversations WHERE id = ?',
      [conversation_id]
    );

    if (conversations.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const companion_id = conversations[0].companion_id;

    // Get memory statistics
    const memoryStats = await memoryService.getMemoryStats(companion_id, user_id);

    // Get memories by type
    const preferences = await memoryService.getMemoriesByType(companion_id, user_id, 'preference', 5);
    const experiences = await memoryService.getMemoriesByType(companion_id, user_id, 'experience', 5);
    const emotionalMoments = await memoryService.getMemoriesByType(companion_id, user_id, 'emotional_moment', 5);

    res.json({
      memory_stats: memoryStats,
      memories_by_type: {
        preferences,
        experiences,
        emotional_moments: emotionalMoments
      }
    });

  } catch (error) {
    logger.error('Error getting memory insights:', {
      error: error.message,
      conversationId: req.params.conversation_id
    });
    
    res.status(500).json({ 
      message: 'Error fetching memory insights',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Search memories in a conversation
 */
async function searchMemories(req, res) {
  try {
    const { conversation_id } = req.params;
    const { query, limit = 10 } = req.query;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Get conversation details
    const [conversations] = await pool.execute(
      'SELECT companion_id FROM conversations WHERE id = ?',
      [conversation_id]
    );

    if (conversations.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const companion_id = conversations[0].companion_id;

    // Search memories
    const memories = await memoryService.searchMemories(
      companion_id,
      user_id,
      query,
      parseInt(limit)
    );

    res.json({
      query,
      results: memories,
      total: memories.length
    });

  } catch (error) {
    logger.error('Error searching memories:', {
      error: error.message,
      conversationId: req.params.conversation_id,
      query: req.query.query
    });
    
    res.status(500).json({ 
      message: 'Error searching memories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = { 
  sendMessageLangChain,
  getConversationLangChain,
  getMemoryInsights,
  searchMemories
};
