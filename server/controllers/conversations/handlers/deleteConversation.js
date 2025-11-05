const pool = require('../../../db/connection');

/**
 * Delete a conversation
 */
async function deleteConversation(req, res) {
  try {
    const { conversation_id } = req.params;

    await pool.execute(
      'DELETE FROM messages WHERE conversation_id = ?',
      [conversation_id]
    );

    const [result] = await pool.execute(
      'DELETE FROM conversations WHERE id = ?',
      [conversation_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting conversation' });
  }
}

module.exports = { deleteConversation };


