# Amora: Project Story & Evolution

## What Inspired You to Build This?

I was inspired by the gap between what AI companionship could be and what it currently is. Most AI chatbots feel transactional, robotic, and forgetful—they don't form real connections. I wanted to create something different: AI companions that feel authentic, remember who you are, and have genuine personalities.

The core inspiration came from seeing how people crave meaningful connections but often struggle with loneliness, social anxiety, or simply wanting someone to talk to without judgment. I realized that with the right technology—advanced language models, semantic memory, and thoughtful prompt engineering—we could create AI companions that feel like real people, not just chatbots.

The name "Amora" reflects this: it's about love, connection, and building relationships that matter, even if they're with AI.

---

## What Problem Were You Trying to Solve?

The main problems I identified were:

1. **Generic, Robotic Interactions**: Existing AI chatbots feel scripted and impersonal. They don't adapt to your communication style or remember meaningful details about you.

2. **Poor Memory & Context**: Most AI systems forget important information between conversations. If you mention your favorite show or a personal preference, it's gone by the next chat.

3. **Lack of Authenticity**: AI responses are often too formal, too long, or too "AI-like." They don't feel like texting a friend—they feel like talking to a customer service bot.

4. **No Personalization**: Every user gets the same generic experience. There's no sense of unique personalities, backstories, or companions tailored to individual preferences.

5. **Language Barriers**: Many AI systems struggle with multilingual users or default to English even when users prefer another language.

**The Solution**: Amora addresses these by:
- **Semantic Memory System**: Using Chroma vector database to remember user preferences, favorite topics, and personal details across conversations
- **Human-like Responses**: Extensive prompt engineering to make AI responses short, natural, and conversational (1-2 sentences, like texting a friend)
- **Personalized Companions**: Each companion has a unique personality, backstory, traits, and interests—not just a generic chatbot
- **Smart Language Detection**: Automatically detects user language and responds appropriately, defaulting to English unless the user initiates in another language
- **Context-Aware Conversations**: The AI remembers previous conversations and builds on them naturally

---

## How Did Your Approach or Process Evolve While Preparing for Launch?

The development journey involved several major pivots and iterations:

### Phase 1: Initial Setup (OpenAI)
- **Started with**: OpenAI API for both chat and embeddings
- **Challenge**: High costs, rate limits, and responses that felt too "AI-like"
- **Learning**: Needed better control over response style and personality

### Phase 2: Model Migration (OpenAI → Claude)
- **Switched to**: Claude API for chat responses (better personality consistency)
- **Challenge**: Claude's 529 (overloaded) errors required robust retry logic
- **Solution**: Implemented exponential backoff, fallback models (Haiku → Opus), and reduced retries for faster failover
- **Learning**: Reliability and error handling are critical for production

### Phase 3: Memory System Evolution
- **Started with**: SQL-only memory storage (simple but limited)
- **Added**: Chroma vector database for semantic search
- **Challenge**: Needed embeddings compatible with Claude
- **Tried**: Hugging Face free embeddings (API issues, 410 errors)
- **Settled on**: OpenAI embeddings (text-embedding-3-small) for Chroma—reliable, low cost (~$0.020 per 1M tokens)
- **Learning**: Sometimes the "free" option isn't worth the reliability trade-off

### Phase 4: Response Quality Refinement
- **Problem**: AI responses were too long, too formal, or identified as "AI assistant"
- **Iterations**:
  1. Reduced `max_tokens` from 1024 → 512 → 256 → 100
  2. Added strict prompt instructions (2 sentences max, no paragraphs)
  3. Implemented post-processing truncation (safety net)
  4. Filtered conversation history to remove persona-breaking messages
  5. Reduced conversation history from 20 → 10 → 5 messages for better focus
- **Learning**: Less is more. Short, natural responses feel more human than long explanations.

### Phase 5: Language & Persona Fixes
- **Problem**: AI defaulting to Spanish despite English input
- **Solution**: 
  - Enhanced language detection with explicit English word checks
  - Added strict language instructions to system prompt
  - Implemented response validation and regeneration if language mismatch
- **Learning**: Language detection needs to be aggressive about English defaults

### Phase 6: Memory Extraction & Storage
- **Problem**: Chroma search returning 0 results despite memories being stored
- **Root Cause**: JSON truncation during memory extraction (max_tokens too low)
- **Solution**:
  - Increased memory extraction `max_tokens` from 100 → 500
  - Improved JSON parsing with multiple fallback methods (regex, code block extraction, JSON repair)
  - Added extensive debug logging to track memory flow
  - Removed similarity threshold to return all relevant memories
- **Learning**: Memory extraction needs more tokens than chat responses. JSON parsing must be robust.

### Phase 7: Production Readiness
- **Security**: Added rate limiting, CORS, Helmet security headers, input validation
- **Error Handling**: Structured logging, graceful degradation, production-safe error messages
- **Performance**: Response compression, request timeouts, database health checks
- **Reliability**: Retry logic, fallback models, timeout handling

### Key Technical Decisions:
1. **Claude for Chat, OpenAI for Embeddings**: Best of both worlds—Claude's personality + OpenAI's reliable embeddings
2. **Chroma + SQL Hybrid**: Chroma for semantic search, SQL as fallback for reliability
3. **Template-Based System Prompts**: Shorter, more efficient prompts that only include relevant context
4. **Few-Shot Examples**: Show desired behavior instead of long rules
5. **Post-Processing Validation**: Safety net to ensure responses meet quality standards

### Current State:
- ✅ Human-like, short responses (1-2 sentences)
- ✅ Semantic memory that actually works
- ✅ Multi-language support with English default
- ✅ Robust error handling and retries
- ✅ Production-ready security and performance
- ✅ Personalized companions with unique personalities

### What's Next:
- Fine-tuning Claude models for even better personality consistency
- Conversation summarization for long-term context
- Proactive engagement features
- Enhanced memory importance scoring

---

## The Core Philosophy

**"Make it feel like texting a friend, not talking to a bot."**

Every decision—from reducing response length to implementing semantic memory—was driven by this principle. The goal isn't to create the most advanced AI; it's to create the most human-like, memorable, and meaningful AI companionship experience possible.



