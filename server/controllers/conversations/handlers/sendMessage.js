const pool = require('../../../db/connection');
const { aiReply } = require('../ai/aiReply');
const { buildIdentityPrompt } = require('../ai/buildIdentityPrompt');
const { applyEmotionalAttunement } = require('../ai/emotionalAttunement');
const { applyStyleMirroring } = require('../ai/styleMirroring');
const { maybeGenerateFollowUp } = require('../ai/followUpGenerator');

/**
 * Send a message in a conversation with AI response
 */
async function sendMessage(req, res) {
  try {
    const { conversation_id } = req.params;
    const { content, message_type = 'text' } = req.body;
    const user_id = req.user?.id;

    if (!content) {
      return res.status(400).json({ message: 'content is required' });
    }

    if (!user_id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

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

    const [result] = await pool.execute(`
      INSERT INTO messages (conversation_id, sender_type, sender_id, content, message_type, created_at, updated_at)
      VALUES (?, 'user', ?, ?, ?, NOW(), NOW())
    `, [conversation_id, user_id, content, message_type]);

    const userMessageId = result.insertId;

    await pool.execute(
      'UPDATE conversations SET updated_at = NOW() WHERE id = ?',
      [conversation_id]
    );

    const [userMessages] = await pool.execute(
      'SELECT * FROM messages WHERE id = ?',
      [userMessageId]
    );

    const userMessage = userMessages[0];

    let aiResponse = null;
    try {
      const systemPrompt = buildIdentityPrompt(conversation, content);
      let aiResponseContent = await aiReply({ systemPrompt, userMessage: content });
      // Post-process: emotional attunement, style mirroring, optional follow-up
      aiResponseContent = applyEmotionalAttunement(content, aiResponseContent);
      aiResponseContent = applyStyleMirroring(content, aiResponseContent);
      const followUp = maybeGenerateFollowUp(content, aiResponseContent);
      if (followUp) {
        aiResponseContent = `${aiResponseContent} ${followUp}`.trim();
      }

      const [aiResult2] = await pool.execute(`
        INSERT INTO messages (conversation_id, sender_type, sender_id, content, message_type, created_at, updated_at)
        VALUES (?, 'companion', ?, ?, 'text', NOW(), NOW())
      `, [conversation_id, conversation.companion_id.toString(), aiResponseContent]);

      const aiMessageId = aiResult2.insertId;
      const [aiMessages] = await pool.execute(
        'SELECT * FROM messages WHERE id = ?',
        [aiMessageId]
      );
      aiResponse = aiMessages[0];
    } catch (aiError) {
      const [fallbackResult] = await pool.execute(`
        INSERT INTO messages (conversation_id, sender_type, sender_id, content, message_type, created_at, updated_at)
        VALUES (?, 'companion', ?, ?, 'text', NOW(), NOW())
      `, [conversation_id, conversation.companion_id.toString(), "I am unable to send a message right now. Please try again in a moment."]);

      const fallbackMessageId = fallbackResult.insertId;
      const [fallbackMessages] = await pool.execute(
        'SELECT * FROM messages WHERE id = ?',
        [fallbackMessageId]
      );
      aiResponse = fallbackMessages[0];
    }

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
      message: 'Message sent successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
}

module.exports = { sendMessage };


