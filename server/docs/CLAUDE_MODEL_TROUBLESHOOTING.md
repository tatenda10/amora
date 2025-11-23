# Claude Model Troubleshooting

## Issue: Model Not Found (404 Error)

If you're getting `404 model not found` errors, it means your API key might not have access to that specific model, or the model name format is incorrect.

## Solution 1: Check Your API Key Access

1. Go to https://console.anthropic.com/
2. Check which models your API key has access to
3. Some API keys may only have access to certain models

## Solution 2: Try Different Model Names

The service now automatically tries multiple model names. Add to your `.env`:

```bash
# Try these model names (one at a time):

# Option 1: Without date (most common)
CLAUDE_MODEL=claude-3-5-sonnet

# Option 2: With date
CLAUDE_MODEL=claude-3-5-sonnet-20240620

# Option 3: Claude 3 Sonnet (older but more widely available)
CLAUDE_MODEL=claude-3-sonnet-20240229

# Option 4: Claude 3 Opus
CLAUDE_MODEL=claude-3-opus-20240229

# Option 5: Claude 3 Haiku (fastest, cheapest)
CLAUDE_MODEL=claude-3-haiku-20240307
```

## Solution 3: Disable Memory Extraction (Temporary)

If memory extraction keeps failing, you can temporarily disable it. The conversation will still work, just without automatic memory extraction.

The service now handles memory extraction errors gracefully - conversations will continue even if memory extraction fails.

## Current Behavior

✅ **Conversations work** - Even if memory extraction fails
✅ **Automatic fallback** - Tries multiple model names
✅ **Non-blocking** - Memory extraction doesn't break conversations
✅ **Graceful degradation** - Returns empty array if extraction fails

## Testing

After updating your `.env` with a model name, restart your server and check logs:

```
✅ Claude 3.5 Sonnet is enabled for AI responses
✅ Successfully using model: claude-3-5-sonnet
```

If you see model errors, try a different model name from the list above.

## Recommended Model

For best results, use:
```bash
CLAUDE_MODEL=claude-3-5-sonnet
```

This is the most commonly available format and should work with most API keys.

