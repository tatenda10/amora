const pool = require('../../../db/connection');

/**
 * Mark messages as read
 */
async function markAsRead(req, res) {
  try {
    const { conversation_id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const [result] = await pool.execute(`
      UPDATE messages 
      SET is_read = 1, read_at = NOW()
      WHERE conversation_id = ? AND sender_type = 'companion' AND is_read = 0
    `, [conversation_id]);

    res.json({ 
      message: 'Messages marked as read',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error marking messages as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = { markAsRead };


