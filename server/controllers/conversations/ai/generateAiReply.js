const pool = require('../../../db/connection');
const openaiService = require('../../../services/openaiService');

/**
 * Generate an AI reply and persist it to the messages table.
 * Returns the inserted AI message row.
 */
async function generateAiReply({ conversationId, companionId, userContent }) {
  try {
    const aiResult = await openaiService.generateResponse(userContent);
    const aiResponseContent = aiResult && typeof aiResult === 'string' && aiResult.trim().length > 0
      ? aiResult
      : "Hey! How's it going?";

    const [insertResult] = await pool.execute(`
      INSERT INTO messages (conversation_id, sender_type, sender_id, content, message_type, created_at, updated_at)
      VALUES (?, 'companion', ?, ?, 'text', NOW(), NOW())
    `, [conversationId, companionId.toString(), aiResponseContent]);

    const aiMessageId = insertResult.insertId;
    const [rows] = await pool.execute('SELECT * FROM messages WHERE id = ?', [aiMessageId]);
    return rows[0];
  } catch (error) {
    const [fallbackResult] = await pool.execute(`
      INSERT INTO messages (conversation_id, sender_type, sender_id, content, message_type, created_at, updated_at)
      VALUES (?, 'companion', ?, ?, 'text', NOW(), NOW())
    `, [conversationId, companionId.toString(), "I'm sorry, I'm having trouble responding right now. Please try again in a moment."]);

    const fallbackMessageId = fallbackResult.insertId;
    const [fallbackRows] = await pool.execute('SELECT * FROM messages WHERE id = ?', [fallbackMessageId]);
    return fallbackRows[0];
  }
}

module.exports = { generateAiReply };


