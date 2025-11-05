const pool = require('../../../db/connection');

/**
 * Create a new conversation
 */
async function createConversation(req, res) {
  try {
    const { companion_id, title } = req.body;
    const user_id = req.user?.id;

    if (!user_id || !companion_id) {
      return res.status(400).json({ message: 'user_id and companion_id are required' });
    }

    const [existingConversations] = await pool.execute(
      'SELECT id FROM conversations WHERE user_id = ? AND companion_id = ?',
      [user_id, companion_id]
    );

    if (existingConversations.length > 0) {
      return res.json({
        conversation: {
          id: existingConversations[0].id,
          user_id,
          companion_id,
          title: title || `Conversation with companion ${companion_id}`
        },
        message: 'Conversation already exists'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO conversations (user_id, companion_id, title, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [user_id, companion_id, title || `Conversation with companion ${companion_id}`]
    );

    const conversationId = result.insertId;

    res.status(201).json({
      conversation: {
        id: conversationId,
        user_id,
        companion_id,
        title: title || `Conversation with companion ${companion_id}`
      },
      message: 'Conversation created successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = { createConversation };


