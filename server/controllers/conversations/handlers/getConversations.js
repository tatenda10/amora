const pool = require('../../../db/connection');

/**
 * Get all conversations for a user
 */
async function getConversations(req, res) {
  try {
    const user_id = req.params.user_id || req.user?.id;
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    try {
      const [tableCheck] = await pool.execute(`
        SELECT COUNT(*) as table_exists 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'conversations'
      `);
      if (tableCheck[0].table_exists === 0) {
        return res.json({
          conversations: [],
          pagination: {
            total: 0,
            totalPages: 0,
            currentPage: page,
            pageSize: limit,
            hasNext: false,
            hasPrev: false
          }
        });
      }
    } catch (tableError) {
      return res.status(500).json({ 
        message: 'Database error',
        error: process.env.NODE_ENV === 'development' ? tableError.message : undefined
      });
    }

    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const [conversations] = await pool.query(`
      SELECT 
        c.id,
        c.user_id,
        c.companion_id,
        c.title,
        c.created_at,
        c.updated_at,
        comp.name as companion_name,
        comp.profile_image_url,
        comp.personality,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) as message_count,
        (SELECT JSON_OBJECT('content', m.content, 'sender_type', m.sender_type) FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
        (SELECT m.created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message_at
      FROM conversations c
      LEFT JOIN companions comp ON c.companion_id = comp.id
      WHERE c.user_id = ?
      ORDER BY c.updated_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `, [user_id]);

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM conversations WHERE user_id = ?',
      [user_id]
    );

    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      conversations,
      pagination: {
        total: totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = { getConversations };


