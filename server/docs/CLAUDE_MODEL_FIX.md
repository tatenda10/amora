# Claude Model Name Fix

## Issue
The model name `claude-3-5-sonnet-20241022` was not found (404 error).

## Solution
Updated to use the correct Claude 3.5 Sonnet model name: `claude-3-5-sonnet-20240620`

## Available Claude Models

### Claude 3.5 Sonnet (Recommended)
- `claude-3-5-sonnet-20240620` ✅ (Default - most stable)
- Best for: Conversations, general use

### Claude 3 Opus
- `claude-3-opus-20240229`
- Best for: Complex tasks, analysis

### Claude 3 Sonnet
- `claude-3-sonnet-20240229`
- Best for: Balanced performance

### Claude 3 Haiku
- `claude-3-haiku-20240307`
- Best for: Fast, simple tasks

## Environment Variable

You can override the model name in your `.env`:

```bash
# Use default (claude-3-5-sonnet-20240620)
CLAUDE_API_KEY=sk-ant-...

# Or specify a different model
CLAUDE_MODEL=claude-3-5-sonnet-20240620
```

## Automatic Fallback

The service now automatically tries a fallback model if the specified one isn't found:
1. Tries your specified model (or default)
2. If 404 error, tries `claude-3-5-sonnet-20240620`
3. If that fails, throws an error

## Testing

After restarting, you should see:
```
✅ Claude 3.5 Sonnet is enabled for AI responses
Memory extraction will use Claude 3.5 Sonnet
```

No more 404 errors! 🎉

