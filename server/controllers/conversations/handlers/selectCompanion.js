const pool = require('../../../db/connection');

/**
 * Select a companion and create conversation
 */
async function selectCompanion(req, res) {
  try {
    const { companion_id, selection_reason } = req.body;
    const user_id = req.user?.id;

    if (!user_id || !companion_id) {
      return res.status(400).json({ message: 'user_id and companion_id are required' });
    }

    const [companions] = await pool.execute(
      'SELECT id, name FROM companions WHERE id = ?',
      [companion_id]
    );

    if (companions.length === 0) {
      return res.status(404).json({ message: 'Companion not found' });
    }

    const companion = companions[0];

    const [existingConversations] = await pool.execute(
      'SELECT id FROM conversations WHERE user_id = ? AND companion_id = ?',
      [user_id, companion_id]
    );

    let conversationId;

    if (existingConversations.length > 0) {
      conversationId = existingConversations[0].id;
      res.json({
        conversation_id: conversationId,
        message: 'Conversation already exists with this companion',
        companion_name: companion.name,
        is_new_conversation: false
      });
    } else {
      const [result] = await pool.execute(
        'INSERT INTO conversations (user_id, companion_id, title, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [user_id, companion_id, `Conversation with ${companion.name}`]
      );

      conversationId = result.insertId;

      try {
        const { createNotification } = require('../../notifications/notificationController');
        await createNotification({
          user_id,
          conversation_id: conversationId,
          type: 'new_conversation',
          title: 'New Conversation Started',
          message: `You've started a conversation with ${companion.name}!`
        });
      } catch (_) {}

      res.status(201).json({
        conversation_id: conversationId,
        message: 'Companion selected and conversation created successfully',
        companion_name: companion.name,
        is_new_conversation: true
      });
    }

    try {
      await pool.execute(
        'INSERT INTO companion_selections (user_id, companion_id, selection_reason, created_at) VALUES (?, ?, ?, NOW())',
        [user_id, companion_id, selection_reason || null]
      );
    } catch (_) {}

  } catch (error) {
    res.status(500).json({ message: 'Error selecting companion' });
  }
}

module.exports = { selectCompanion };


