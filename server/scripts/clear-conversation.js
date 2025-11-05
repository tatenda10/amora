const pool = require('../db/connection');

/**
 * Clear conversation messages and reset conversation
 */

async function clearConversation(conversationId = 1) {
  try {
    console.log(`🗑️ Clearing conversation ${conversationId}...`);
    
    // Clear all messages from the conversation
    const [messageResult] = await pool.execute(
      'DELETE FROM messages WHERE conversation_id = ?',
      [conversationId]
    );
    
    console.log(`✅ Deleted ${messageResult.affectedRows} messages`);
    
    // Reset conversation timestamp
    const [conversationResult] = await pool.execute(
      'UPDATE conversations SET updated_at = NOW() WHERE id = ?',
      [conversationId]
    );
    
    console.log(`✅ Updated conversation ${conversationId} timestamp`);
    
    // Clear related memories (optional - uncomment if you want to clear memories too)
    // const [memoryResult] = await pool.execute(
    //   'DELETE FROM companion_memories WHERE companion_id = 2',
    //   []
    // );
    // console.log(`✅ Deleted ${memoryResult.affectedRows} memories`);
    
    console.log(`🎉 Conversation ${conversationId} cleared successfully!`);
    console.log(`💡 You can now start a fresh conversation.`);
    
  } catch (error) {
    console.error('❌ Error clearing conversation:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const conversationId = process.argv[2] || 1;
  
  clearConversation(parseInt(conversationId))
    .then(() => {
      console.log('\n✨ Conversation clearing completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Failed to clear conversation:', error);
      process.exit(1);
    });
}

module.exports = { clearConversation };
