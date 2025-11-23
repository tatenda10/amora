const pool = require('../../../db/connection');
const claudeService = require('../../../services/claudeService');
const chromaMemoryService = require('../../../services/chromaMemoryService');
const memoryService = require('../../../services/langchain/memoryService');
const MultiLanguageService = require('../../../services/multiLanguageService');
const logger = require('../../../utils/logger');

// Initialize language service
const multiLanguageService = new MultiLanguageService();

/**
 * Truncate response to 2 sentences max (like texting)
 * Keeps complete sentences only, preserves natural flow
 * Makes it human-like by keeping it natural and casual
 */
function truncateToShortResponse(response) {
  if (!response) return response;
  
  // Split into sentences (preserve punctuation)
  const sentences = response.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  
  // If response is already 1-2 complete sentences and reasonable length, return as-is
  if (sentences.length <= 2 && response.length <= 150) {
    return response.trim();
  }
  
  // Target: 2 sentences max, but they must be COMPLETE sentences
  let truncated = '';
  
  // Strategy: Find 2 complete sentences that make sense together
  if (sentences.length >= 2) {
    // Look for a question in the first 3 sentences
    const hasQuestion = sentences.slice(0, 3).some(s => s.includes('?'));
    
    if (hasQuestion) {
      // Find the question and keep the sentence before it (if exists)
      const questionIndex = sentences.findIndex(s => s.includes('?'));
      if (questionIndex === 0) {
        // Question is first sentence - keep it and add a follow-up question if needed
        truncated = sentences[0];
        if (sentences.length > 1 && !truncated.includes('?')) {
          truncated += ' ' + sentences[1];
        }
      } else if (questionIndex === 1) {
        // Question is second sentence - keep both
        truncated = sentences[0] + ' ' + sentences[1];
      } else {
        // Question is later - keep first sentence and the question
        truncated = sentences[0] + ' ' + sentences[questionIndex];
      }
    } else {
      // No question found - keep first sentence, optionally add second if it's short
      truncated = sentences[0].trim();
      // If second sentence is short and natural, include it
      if (sentences.length > 1 && sentences[1].length < 50) {
        truncated += ' ' + sentences[1];
      }
    }
  } else if (sentences.length === 1) {
    // Only one sentence - keep it as-is
    truncated = sentences[0].trim();
  } else {
    // No complete sentences - this shouldn't happen, but handle it
    truncated = response.substring(0, 100).trim();
  }
  
  // Final length check - ensure it's reasonable (max 150 chars for 2 sentences)
  if (truncated.length > 150) {
    // Try to find a good cut point at sentence boundary
    const cutPoint = truncated.substring(0, 147).lastIndexOf('.');
    if (cutPoint > 50) {
      truncated = truncated.substring(0, cutPoint + 1);
    } else {
      // Can't find good cut point - just truncate at word boundary
      truncated = truncated.substring(0, 120).trim();
      // Remove incomplete words at the end
      truncated = truncated.replace(/\s+\w+$/, '');
    }
  }
  
  return truncated.trim();
}

/**
 * Build optimized system prompt (template-based, concise, few-shot examples)
 * Separates static (companion info) from dynamic (language, context)
 */
function buildOptimizedSystemPrompt({ companion, userName, relevantMemories, userMessage, useDetectedLanguage, responseLanguage }) {
  // Static: Companion identity (only include if exists)
  const staticParts = [
    `You are ${companion.name}, ${companion.personality}.`,
    companion.age ? `${companion.age} years old` : null,
    companion.country ? `from ${companion.country}` : null,
    companion.backstory ? `Backstory: ${companion.backstory}` : null,
    companion.traits?.length ? `Traits: ${companion.traits.join(', ')}` : null,
    companion.interests?.length ? `Interests: ${companion.interests.join(', ')}` : null,
    `Chatting with ${userName}.`
  ].filter(Boolean);

  // Dynamic: Memories (only if exist)
  const memoryPart = relevantMemories.length > 0 
    ? `Remember: ${relevantMemories.slice(0, 3).join('; ')}` // Max 3 memories
    : null;

  // Dynamic: Language instruction (concise)
  const languagePart = useDetectedLanguage
    ? `Respond ONLY in ${responseLanguage}. User wrote: "${userMessage}"`
    : `Respond ONLY in English. User wrote: "${userMessage}" in English. Ignore any other language in history.`;

  // Few-shot examples (instead of long rules) - show SHORT responses
  const examples = `Examples:
User: "watching game of thrones" → You: "Nice! What season are you on?"
User: "I love deneries tygarian" → You: "Daenerys is awesome! What do you like most about her?"
User: "I will just maybe watch a movie" → You: "That sounds good! Any movie in mind?"
User: "how is your day" → You: "It's going well, thanks! How's yours?"`;

  // CRITICAL rules - VERY explicit about length - THIS IS THE PRIMARY CONTROL
  const rules = `⚠️⚠️⚠️ CRITICAL - READ THIS FIRST ⚠️⚠️⚠️
YOU MUST GENERATE ONLY 1-2 SENTENCES. MAX 100 TOKENS. NO EXCEPTIONS.

RULES:
1. MAXIMUM 2 SENTENCES - STOP IMMEDIATELY AFTER 2 SENTENCES - COUNT THEM
2. MAXIMUM 100 TOKENS TOTAL - If you hit this limit, STOP writing immediately
3. Sentence 1: Brief, direct answer (1 sentence only, complete thought)
4. Sentence 2: Optional follow-up or question (1 sentence only, if needed)
5. MAKE THE RESPONSES AS HUMAN LIKE AS POSSIBLE - natural, casual, like texting
6. NO PARAGRAPHS - NO LISTS - NO EXPLANATIONS - NO DETAILS - NO APOLOGIES
7. If you write more than 2 sentences, you FAILED - STOP after 2 sentences
8. Think: "How would I text this to a friend?" - Short, natural, to the point
9. NEVER say you are an AI, assistant, or computer - you are ${companion.name}, a real person
10. NEVER mention being here to help - you are chatting as ${companion.name}, not as an assistant
11. IGNORE any previous messages in the conversation history that say you're an AI - those are wrong
12. For "who are you" questions: Answer as ${companion.name} would - briefly, naturally, like a real person

REMEMBER: You have MAX 100 TOKENS. Use them wisely. 2 sentences max. Count your sentences before responding.`;

  // Build final prompt (concise, no redundancy)
  return [
    ...staticParts,
    memoryPart,
    languagePart,
    examples,
    rules
  ].filter(Boolean).join('\n');
}

/**
 * Send a message in a conversation with Claude AI response
 * Simplified version: Claude + Chroma vector search + system prompt
 */
async function sendMessageLangChain(req, res) {
  try {
    const { conversation_id } = req.params;
    const { content, message_type = 'text' } = req.body;
    const user_id = req.user?.id;

    // Input validation is handled by middleware, but double-check
    if (!content) {
      return res.status(400).json({ message: 'content is required' });
    }

    if (!user_id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if Claude is available
    if (!claudeService.isAvailable()) {
      return res.status(500).json({ 
        message: 'Claude AI service is not available. Please check CLAUDE_API_KEY in environment variables.' 
      });
    }

    // Get conversation and companion details
    const [conversations] = await pool.execute(`
      SELECT 
        c.*,
        comp.id as companion_id,
        comp.name as companion_name,
        comp.personality as companion_personality,
        comp.traits as companion_traits,
        comp.backstory as companion_backstory,
        comp.age as companion_age,
        comp.country as companion_country,
        comp.interests as companion_interests
      FROM conversations c 
      LEFT JOIN companions comp ON c.companion_id = comp.id 
      WHERE c.id = ?
    `, [conversation_id]);

    if (conversations.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const conversation = conversations[0];

    // Store user message
    const [result] = await pool.execute(`
      INSERT INTO messages (conversation_id, sender_type, sender_id, content, message_type, created_at, updated_at)
      VALUES (?, 'user', ?, ?, ?, NOW(), NOW())
    `, [conversation_id, user_id, content, message_type]);

    const userMessageId = result.insertId;

    // Update conversation timestamp
    await pool.execute(
      'UPDATE conversations SET updated_at = NOW() WHERE id = ?',
      [conversation_id]
    );

    // Get the stored user message
    const [userMessages] = await pool.execute(
      'SELECT * FROM messages WHERE id = ?',
      [userMessageId]
    );

    const userMessage = userMessages[0];

    let aiResponse = null;
    try {
      // Add timeout for AI response generation (45 seconds - allows for retry + fallback attempts)
      const AI_TIMEOUT = 45000;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AI response timeout')), AI_TIMEOUT);
      });

      // Get conversation history (last 50 messages)
      const [historyMessages] = await pool.execute(`
        SELECT sender_type, content, created_at
        FROM messages
        WHERE conversation_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `, [conversation_id]);
      
      const conversationHistory = historyMessages.reverse(); // Oldest first

      // Get relevant memories - try Chroma semantic search first, then SQL fallback
      let relevantMemories = [];
      
      // Try Chroma semantic search if available (uses Hugging Face free embeddings)
      if (chromaMemoryService.isAvailable()) {
        try {
          console.log(`\n=== CHROMA SEARCH DEBUG ===`);
          console.log(`Searching for: companionId=${conversation.companion_id}, userId=${user_id}, query="${content}"`);
          const memoryResults = await chromaMemoryService.searchMemories(
            conversation.companion_id,
            user_id,
            content, // Use user message as search query
            10 // Get top 10 relevant memories
          );
          console.log(`Chroma returned ${memoryResults.length} results`);
          if (memoryResults.length > 0) {
            console.log(`Sample result:`, memoryResults[0]);
          }
          console.log(`=== END CHROMA SEARCH DEBUG ===\n`);
          relevantMemories = memoryResults.map(m => m.content || m.metadata?.content || '').filter(m => m);
        } catch (error) {
          console.error('Chroma memory search failed:', error);
          logger.debug('Chroma memory search failed (will use SQL fallback):', error.message);
        }
      }
      
      // Fallback to SQL if Chroma is not available or failed
      if (relevantMemories.length === 0) {
        try {
          const memories = await memoryService.getRelevantMemories(
            conversation.companion_id,
            user_id,
            10,
            content // Pass query for potential semantic search
          );
          relevantMemories = memories.map(m => m.content || '').filter(m => m);
        } catch (error) {
          logger.debug('Memory retrieval failed, continuing without memories:', error.message);
          relevantMemories = [];
        }
      }

      // Get user details
      const [users] = await pool.execute(
        'SELECT name, email FROM users WHERE id = ?',
        [user_id]
      );
      const userName = users[0]?.name || 'Friend';

      // Detect user's language from their CURRENT message only (not conversation history)
      // Default to English unless clearly another language
      let detectedLanguage = multiLanguageService.detectLanguage(content);
      
      // Strong English indicators - if present, force English
      const englishIndicators = ['its', 'its great', 'but', 'just', 'bit', 'cold', 'today', 'your', 'side', 
                                  'the', 'and', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 
                                  'hi', 'hie', 'hey', 'hello', 'how', 'what', 'when', 'where', 'why',
                                  'day', 'up', 'to', 'are', 'you', 'doing', 'going'];
      const lowerContent = content.toLowerCase();
      const hasEnglishIndicators = englishIndicators.some(indicator => lowerContent.includes(indicator));
      
      // If message has English words/patterns, force English (even if detection says otherwise)
      if (hasEnglishIndicators) {
        detectedLanguage = 'en';
      }
      
      // For very short messages or ambiguous, default to English
      if (content.length <= 5 || detectedLanguage === 'en') {
        detectedLanguage = 'en';
      }
      
      const languageNames = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'pt': 'Portuguese',
        'it': 'Italian',
        'ja': 'Japanese',
        'ko': 'Korean'
      };
      const responseLanguage = languageNames[detectedLanguage] || 'English';
      
      // Log detected language for debugging
      logger.debug(`Language detection: "${content}" → ${detectedLanguage} (${responseLanguage})`);
      
      // Only use detected language if it's clearly not English and message is substantial
      const useDetectedLanguage = detectedLanguage !== 'en' && content.length > 10;

      // Parse companion traits and interests
      const traits = typeof conversation.companion_traits === 'string' 
        ? JSON.parse(conversation.companion_traits || '[]') 
        : (conversation.companion_traits || []);
      const interests = typeof conversation.companion_interests === 'string'
        ? JSON.parse(conversation.companion_interests || '[]')
        : (conversation.companion_interests || []);

      // Build optimized system prompt (template-based, concise, few-shot examples)
      const systemPrompt = buildOptimizedSystemPrompt({
        companion: {
          name: conversation.companion_name,
          personality: conversation.companion_personality || 'friendly and empathetic',
          backstory: conversation.companion_backstory,
          traits,
          interests,
          age: conversation.companion_age,
          country: conversation.companion_country
        },
        userName,
        relevantMemories,
        userMessage: content,
        useDetectedLanguage,
        responseLanguage
      });

      // Build messages for Claude
      // Filter conversation history to prioritize recent messages in the same language
      // Also filter out problematic AI responses that say "I'm an AI assistant"
      const recentHistory = conversationHistory.slice(-5); // Only last 5 messages (reduced to avoid old bad responses)
      const messages = recentHistory
        .map(msg => ({
          role: msg.sender_type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
        // Filter out AI responses that incorrectly identify as AI/assistant
        .filter(msg => {
          if (msg.role === 'assistant') {
            const lower = msg.content.toLowerCase();
            // Remove messages where AI says it's an AI/assistant/computer
            if (lower.includes("i'm an ai") || 
                lower.includes("i'm a computer") || 
                lower.includes("i'm an assistant") ||
                lower.includes("ai assistant") ||
                lower.includes("how can i assist") ||
                lower.includes("here to help")) {
              return false; // Filter out this message
            }
          }
          return true;
        });
      
      // Add the current user message
      messages.push({ role: 'user', content: content });
      
      // Add a language reminder as the last user message if we're enforcing English
      if (!useDetectedLanguage) {
        messages.push({ 
          role: 'user', 
          content: `[IMPORTANT: Please respond to my previous message in English only. Do not use Spanish or any other language.]`
        });
      }

      // Generate response using Claude (with timeout to allow for retry + fallbacks)
      logger.debug('Generating response with Claude + Chroma vector search');
      
      // DEBUG: Log the system prompt being sent
      console.log('\n=== SYSTEM PROMPT BEING SENT TO CLAUDE ===');
      console.log(systemPrompt);
      console.log('=== END SYSTEM PROMPT ===\n');
      
      // DEBUG: Log messages being sent
      console.log('\n=== MESSAGES BEING SENT TO CLAUDE ===');
      console.log(JSON.stringify(messages, null, 2));
      console.log('=== END MESSAGES ===\n');
      
      let aiResponseContent = await Promise.race([
        claudeService.generateResponse(messages, systemPrompt),
        timeoutPromise
      ]);
      
      // DEBUG: Log the response received
      console.log('\n=== RESPONSE RECEIVED FROM CLAUDE ===');
      console.log(aiResponseContent);
      console.log(`Length: ${aiResponseContent?.length} characters`);
      console.log('=== END RESPONSE ===\n');
      
      // Post-process: Safety net truncation (only if AI ignored instructions)
      // Primary control is max_tokens=100 and explicit prompt, this is just backup
      const originalLength = aiResponseContent?.length || 0;
      if (originalLength > 150) {
        // Only truncate if response is way too long (AI ignored instructions)
        logger.warn(`Response too long (${originalLength} chars), truncating as safety net`);
        aiResponseContent = truncateToShortResponse(aiResponseContent);
        logger.debug(`Response truncated from ${originalLength} to ${aiResponseContent.length} characters`);
      }
      
      // Post-process: Validate language matches user's language
      if (!useDetectedLanguage) {
        // User wrote in English, validate response is in English
        const responseLanguage = multiLanguageService.detectLanguage(aiResponseContent);
        if (responseLanguage !== 'en') {
          logger.warn(`Response language mismatch: Expected English, got ${responseLanguage}. Regenerating with English-only prompt...`);
          // Regenerate with only current message (no history) and stronger English enforcement
          const englishEnforcementPrompt = `${systemPrompt}\n\n⚠️ CRITICAL: Your previous response was in ${responseLanguage} but the user wrote in English. You MUST respond in English only. Every single word must be in English. Do not use Spanish, French, or any other language.`;
          try {
            aiResponseContent = await Promise.race([
              claudeService.generateResponse(
                [{ role: 'user', content: content }], // Use only current message, no history
                englishEnforcementPrompt
              ),
              timeoutPromise
            ]);
          } catch (retryError) {
            logger.error('Failed to regenerate response in correct language:', retryError.message);
            // Fallback: Use a simple English response
            aiResponseContent = "That sounds good! What are you up to?";
          }
        }
      }

      // Store AI response
      const [aiResult] = await pool.execute(`
        INSERT INTO messages (conversation_id, sender_type, sender_id, content, message_type, created_at, updated_at)
        VALUES (?, 'companion', ?, ?, 'text', NOW(), NOW())
      `, [conversation_id, conversation.companion_id.toString(), aiResponseContent]);

      const aiMessageId = aiResult.insertId;
      const [aiMessages] = await pool.execute(
        'SELECT * FROM messages WHERE id = ?',
        [aiMessageId]
      );
      aiResponse = aiMessages[0];

      // Extract and store memories from this interaction (non-blocking)
      // Don't wait for it - if it fails, conversation continues
      console.log(`\n=== MEMORY EXTRACTION DEBUG ===`);
      console.log(`Extracting memories for: companionId=${conversation.companion_id}, userId=${user_id}`);
      console.log(`User message: "${content}"`);
      console.log(`AI response: "${aiResponseContent.substring(0, 100)}..."`);
      
      memoryService.extractAndStoreMemories(
        conversation.companion_id,
        user_id,
        conversation_id,
        content,
        aiResponseContent
      ).then(() => {
        console.log('Memory extraction completed successfully');
        console.log(`=== END MEMORY EXTRACTION DEBUG ===\n`);
      }).catch(err => {
        // Log errors but don't break conversations
        console.error('Memory extraction failed:', err);
        logger.debug('Memory extraction failed (non-critical):', err.message);
        console.log(`=== END MEMORY EXTRACTION DEBUG ===\n`);
      });

    } catch (aiError) {
      logger.error('AI response generation error:', {
        error: aiError.message,
        conversationId: conversation_id,
        userId: user_id,
        isTimeout: aiError.message === 'AI response timeout'
      });
      
      // Return a graceful fallback response instead of throwing
      if (aiError.message === 'AI response timeout') {
        aiResponseContent = "Sorry, I'm taking a bit longer than usual to respond. Can you try again?";
      } else {
        // For other errors, use a generic fallback
        aiResponseContent = "I'm having trouble responding right now. Could you rephrase that?";
      }
      
      // Store fallback response
      const [fallbackResult] = await pool.execute(`
        INSERT INTO messages (conversation_id, sender_type, sender_id, content, message_type, created_at, updated_at)
        VALUES (?, 'companion', ?, ?, 'text', NOW(), NOW())
      `, [conversation_id, conversation.companion_id.toString(), aiResponseContent]);

      const fallbackMessageId = fallbackResult.insertId;
      const [fallbackMessages] = await pool.execute(
        'SELECT * FROM messages WHERE id = ?',
        [fallbackMessageId]
      );
      aiResponse = fallbackMessages[0];
    }

    // Send real-time update via Socket.IO
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
      message: 'Message sent successfully',
      ai_system: 'claude-chroma'
    });

  } catch (error) {
    logger.error('Error in sendMessageLangChain:', {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      conversationId: req.params.conversation_id,
      userId: req.user?.id
    });
    
    res.status(500).json({ 
      message: 'Error sending message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get conversation with LangChain-enhanced context
 */
async function getConversationLangChain(req, res) {
  try {
    const { conversation_id } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    // Get conversation details
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

    // Get messages with pagination
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

    // Get message count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM messages WHERE conversation_id = ?',
      [conversation_id]
    );

    const totalMessages = countResult[0].total;
    const totalPages = Math.ceil(totalMessages / limit);

      // Get context with Chroma vector search
      let context = null;
      const user_id = req.user?.id;
      if (user_id) {
        // Get relevant memories using SQL (Claude-only mode, no Chroma/OpenAI needed)
        let memories = [];
        try {
          memories = await memoryService.getRelevantMemories(
            conversation.companion_id,
            user_id,
            5
          );
        } catch (error) {
          logger.debug('Memory retrieval failed:', error.message);
          memories = [];
        }

        // Get memory statistics
        let memoryStats = null;
        try {
          memoryStats = await memoryService.getMemoryStats(
            conversation.companion_id,
            user_id
          );
        } catch (error) {
          logger.debug('Memory stats retrieval failed:', error.message);
        }

        context = {
          memories: memories.slice(0, 3), // Show top 3 memories
          memory_stats: memoryStats
        };
      }

    res.json({
      conversation,
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        total: totalMessages,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      context: context
    });

  } catch (error) {
    logger.error('Error in getConversationLangChain:', {
      error: error.message,
      conversationId: req.params.conversation_id
    });
    
    res.status(500).json({ 
      message: 'Error fetching conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get memory insights for a conversation
 */
async function getMemoryInsights(req, res) {
  try {
    const { conversation_id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get conversation details
    const [conversations] = await pool.execute(
      'SELECT companion_id FROM conversations WHERE id = ?',
      [conversation_id]
    );

    if (conversations.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const companion_id = conversations[0].companion_id;

    // Get memory statistics
    const memoryStats = await memoryService.getMemoryStats(companion_id, user_id);

    // Get memories by type
    const preferences = await memoryService.getMemoriesByType(companion_id, user_id, 'preference', 5);
    const experiences = await memoryService.getMemoriesByType(companion_id, user_id, 'experience', 5);
    const emotionalMoments = await memoryService.getMemoriesByType(companion_id, user_id, 'emotional_moment', 5);

    res.json({
      memory_stats: memoryStats,
      memories_by_type: {
        preferences,
        experiences,
        emotional_moments: emotionalMoments
      }
    });

  } catch (error) {
    logger.error('Error getting memory insights:', {
      error: error.message,
      conversationId: req.params.conversation_id
    });
    
    res.status(500).json({ 
      message: 'Error fetching memory insights',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Search memories in a conversation
 */
async function searchMemories(req, res) {
  try {
    const { conversation_id } = req.params;
    const { query, limit = 10 } = req.query;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Get conversation details
    const [conversations] = await pool.execute(
      'SELECT companion_id FROM conversations WHERE id = ?',
      [conversation_id]
    );

    if (conversations.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const companion_id = conversations[0].companion_id;

    // Search memories
    const memories = await memoryService.searchMemories(
      companion_id,
      user_id,
      query,
      parseInt(limit)
    );

    res.json({
      query,
      results: memories,
      total: memories.length
    });

  } catch (error) {
    logger.error('Error searching memories:', {
      error: error.message,
      conversationId: req.params.conversation_id,
      query: req.query.query
    });
    
    res.status(500).json({ 
      message: 'Error searching memories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = { 
  sendMessageLangChain,
  getConversationLangChain,
  getMemoryInsights,
  searchMemories
};
