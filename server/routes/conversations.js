const express = require('express');
const router = express.Router();
const { 
  createConversation, 
  selectCompanion,
  getConversations, 
  getConversation, 
  sendMessage, 
  deleteConversation, 
  markAsRead 
} = require('../controllers/conversations/conversationController');

// Import LangChain handlers
const { 
  sendMessageLangChain,
  getConversationLangChain,
  getMemoryInsights,
  searchMemories
} = require('../controllers/conversations/handlers/sendMessageLangChain');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateMessageInput, validateConversationIdParam } = require('../middleware/inputValidator');

// All routes are protected with JWT authentication
router.use(authenticateToken);

/**
 * @route   POST /api/conversations
 * @desc    Create a new conversation
 * @access  Private
 */
router.post('/', createConversation);

/**
 * @route   POST /api/conversations/select-companion
 * @desc    Select a companion and create conversation
 * @access  Private
 * @param   {string} user_id - User ID
 * @param   {number} companion_id - Companion ID to select
 * @param   {string} [selection_reason] - Optional reason for selection
 */
router.post('/select-companion', selectCompanion);

// Debug routes removed for production
// These routes are only available in development mode
if (process.env.NODE_ENV === 'development') {
  /**
   * @route   GET /api/conversations/status
   * @desc    Check if conversations table exists (DEV ONLY)
   * @access  Private
   */
  router.get('/status', async (req, res) => {
    try {
      const pool = require('../db/connection');
      const [tableCheck] = await pool.execute(`
        SELECT COUNT(*) as table_exists 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'conversations'
      `);
      
      res.json({
        conversationsTableExists: tableCheck[0].table_exists > 0,
        database: process.env.DB_NAME || 'amora_db'
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Database error',
        error: error.message
      });
    }
  });

  /**
   * @route   GET /api/conversations/test
   * @desc    Test endpoint to debug conversation creation (DEV ONLY)
   * @access  Private
   */
  router.get('/test', async (req, res) => {
    try {
      const pool = require('../db/connection');
      const [testQuery] = await pool.execute('SELECT 1 as test');
      
      const [tableCheck] = await pool.execute(`
        SELECT COUNT(*) as table_exists 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'conversations'
      `);
      
      res.json({
        user: req.user,
        databaseConnected: testQuery[0].test === 1,
        conversationsTableExists: tableCheck[0].table_exists > 0,
        message: 'Test endpoint working'
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Test endpoint error',
        error: error.message
      });
    }
  });
}

/**
 * @route   GET /api/conversations
 * @desc    Get all conversations for the authenticated user
 * @access  Private
 */
router.get('/', getConversations);

/**
 * @route   GET /api/conversations/user/:user_id
 * @desc    Get all conversations for a specific user
 * @access  Private
 */
router.get('/user/:user_id', getConversations);

/**
 * @route   GET /api/conversations/:conversation_id
 * @desc    Get a specific conversation with messages (now includes LangChain context)
 * @access  Private
 */
router.get('/:conversation_id', validateConversationIdParam, getConversationLangChain);

/**
 * @route   POST /api/conversations/:conversation_id/messages
 * @desc    Send a message in a conversation (now uses LangChain/LangGraph)
 * @access  Private
 */
router.post('/:conversation_id/messages', validateConversationIdParam, validateMessageInput, sendMessageLangChain);

/**
 * @route   POST /api/conversations/:conversation_id/read
 * @desc    Mark messages as read
 * @access  Private
 */
router.post('/:conversation_id/read', markAsRead);

/**
 * @route   DELETE /api/conversations/:conversation_id
 * @desc    Delete a conversation
 * @access  Private
 */
router.delete('/:conversation_id', deleteConversation);

// ========== LANGCHAIN/LANGGRAPH ROUTES ==========

/**
 * @route   POST /api/conversations/:conversation_id/messages/langchain
 * @desc    Send a message using LangChain/LangGraph AI system
 * @access  Private
 * @param   {string} content - Message content
 * @param   {string} [message_type] - Message type (default: 'text')
 * @param   {boolean} [use_langgraph] - Use LangGraph agent (default: true)
 */
router.post('/:conversation_id/messages/langchain', validateConversationIdParam, validateMessageInput, sendMessageLangChain);

/**
 * @route   GET /api/conversations/:conversation_id/langchain
 * @desc    Get conversation with LangChain-enhanced context
 * @access  Private
 */
router.get('/:conversation_id/langchain', getConversationLangChain);

/**
 * @route   GET /api/conversations/:conversation_id/memories/insights
 * @desc    Get memory insights for a conversation
 * @access  Private
 */
router.get('/:conversation_id/memories/insights', getMemoryInsights);

/**
 * @route   GET /api/conversations/:conversation_id/memories/search
 * @desc    Search memories in a conversation
 * @access  Private
 * @param   {string} query - Search query
 * @param   {number} [limit] - Maximum results (default: 10)
 */
router.get('/:conversation_id/memories/search', searchMemories);

module.exports = router; 