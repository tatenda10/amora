# Claude Setup Guide

## ✅ Implementation Complete!

Your backend now supports **Claude 3.5 Sonnet** for better human-like conversations.

## Environment Variables Required

Add these to your `.env` file:

```bash
# Claude API Key (Required for Claude)
CLAUDE_API_KEY=sk-ant-...

# Optional: Override to use OpenAI instead
# USE_CLAUDE=false

# Optional: Claude-specific settings
CLAUDE_MAX_TOKENS=1024
CLAUDE_TEMPERATURE=0.7

# OpenAI API Key (Still needed as fallback)
OPENAI_API_KEY=sk-...
```

## How It Works

### Claude Integration
- **Automatic**: If `CLAUDE_API_KEY` is set, Claude 3.7 Sonnet will be used by default
- **Fallback**: If Claude fails or is disabled, it falls back to OpenAI
- **Better Conversations**: Claude is specifically designed for natural, human-like dialogue
- **Cost-Effective**: Much cheaper than GPT-4-turbo ($3/$15 per 1M tokens vs $10-30/$30-60)
- **Auto-Fallback**: Tries multiple model names automatically if one doesn't work

### Memory Search
- **Enhanced SQL Search**: Uses improved keyword matching for better relevance
- **30 Memories**: Retrieves up to 30 relevant memories (increased from 10)
- **Smart Ranking**: Prioritizes memories that match user's message keywords
- **Free**: No additional costs, uses your existing database

## Setup Steps

### 1. Get Claude API Key
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Create an API key
4. Add to `.env`: `CLAUDE_API_KEY=sk-ant-...`

### 2. Start Your Server
```bash
cd server
npm start
```

You should see:
```
✅ Claude 3.5 Sonnet is enabled for AI responses
```

## Features

### Better Conversations
- **Claude 3.5 Sonnet**: More natural, empathetic responses
- **Better Context**: Remembers more from conversation history (50 messages)
- **Improved Memory**: 30 memories instead of 10
- **Enhanced Search**: Smart keyword matching for relevant memories

### Free & Simple
- **No Additional Services**: Uses your existing database
- **No Extra Costs**: Only pay for Claude API usage (cheaper than GPT-4)
- **Easy Setup**: Just add one API key

## Testing

### Test Claude
1. Send a message in your app
2. Check server logs - should see Claude being used
3. Responses should feel more natural and human-like

### Test Memory Recall
1. Have a conversation with your companion
2. Wait for memories to be stored (importance >= 7)
3. In a new conversation, reference something from the past
4. The AI should recall it with improved keyword matching

## Troubleshooting

### Claude not working
- Check `CLAUDE_API_KEY` is set correctly
- Check API key has credits/quota
- Check server logs for errors
- Falls back to OpenAI automatically

### Memory search not finding relevant memories
- Make sure memories are being stored (importance >= 7)
- Try using similar keywords to what was stored
- Check database for stored memories

## Cost Considerations

### Claude 3.5 Sonnet
- **Input**: $3 per 1M tokens
- **Output**: $15 per 1M tokens
- **Much cheaper** than GPT-4-turbo ($10-30/$30-60)

### Memory Storage
- **Free**: Uses your existing database
- **No Additional Costs**: SQL search is free

## Performance

- **Claude**: Faster responses than GPT-4, better quality than GPT-3.5
- **Memory Search**: Fast SQL queries with smart keyword matching
- **Fallbacks**: Automatic fallback to OpenAI if Claude fails

## Improvements Made

1. ✅ **Claude 3.5 Sonnet** - Better human-like conversations
2. ✅ **50 Message History** - More context awareness
3. ✅ **30 Memories** - Better recall (up from 10)
4. ✅ **Enhanced SQL Search** - Smart keyword matching
5. ✅ **15 Conversation Contexts** - Better topic understanding

## Next Steps

1. ✅ Add `CLAUDE_API_KEY` to `.env`
2. ✅ Test Claude responses
3. ✅ Monitor costs and usage
4. ✅ Fine-tune based on user feedback

## Support

If you encounter issues:
1. Check server logs for error messages
2. Verify API key is correct
3. Check API quotas/limits
4. Service automatically falls back to OpenAI if unavailable

