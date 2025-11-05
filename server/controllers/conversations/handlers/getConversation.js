const pool = require('../../../db/connection');

/**
 * Get a specific conversation with messages
 */
async function getConversation(req, res) {
  try {
    const { conversation_id } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

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

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM messages WHERE conversation_id = ?',
      [conversation_id]
    );

    const totalMessages = countResult[0].total;
    const totalPages = Math.ceil(totalMessages / limit);

    res.json({
      conversation,
      messages: messages.reverse(),
      pagination: {
        total: totalMessages,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversation' });
  }
}

module.exports = { getConversation };


