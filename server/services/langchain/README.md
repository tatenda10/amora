# LangChain & LangGraph Integration for Amora AI Companion

This directory contains the LangChain and LangGraph integration for the Amora AI Companion system, providing sophisticated AI capabilities with advanced conversation management, memory systems, and agent-based interactions.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    LANGCHAIN/LANGGRAPH SYSTEM                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LangChain     │    │   LangGraph     │    │   Memory        │
│   Service       │    │   Agent         │    │   Service       │
│                 │    │                 │    │                 │
│ • Conversation  │    │ • State-based   │    │ • Memory        │
│   Chains        │    │   Workflow      │    │   Extraction    │
│ • Prompt        │    │ • Multi-step    │    │ • Storage       │
│   Templates     │    │   Processing    │    │ • Retrieval     │
│ • LLM           │    │ • Conditional   │    │ • Consolidation │
│   Integration   │    │   Logic         │    │ • Search        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                        TOOLS SERVICE                           │
│                                                                 │
│ • Memory Tools        • Relationship Tools    • Content Tools   │
│ • Search Memories     • Get Relationship      • Weather Info    │
│ • Get Preferences     • Update Relationship   • Time Info       │
│ • Conversation Hist   • Status Tracking       • Calculations    │
│                                                                 │
│ • Entertainment Tools                                           │
│ • Suggest Activities  • Get Jokes            • Get Quotes      │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
server/services/langchain/
├── README.md                 # This file
├── langchainService.js       # Core LangChain service
├── langgraphAgent.js         # LangGraph agent implementation
├── memoryService.js          # Memory management service
└── toolsService.js           # Tools and utilities service
```

## 🚀 Core Services

### 1. LangChain Service (`langchainService.js`)

**Purpose**: Provides basic LangChain functionality with conversation chains and prompt management.

**Key Features**:
- Conversation chain creation and management
- System prompt building with companion personality
- Memory integration
- Response generation with context

**Usage**:
```javascript
const langchainService = require('./langchainService');

// Generate response
const response = await langchainService.generateResponse({
  companionId: 1,
  userId: 'user123',
  conversationId: 'conv456',
  userMessage: 'Hello!'
});
```

### 2. LangGraph Agent (`langgraphAgent.js`)

**Purpose**: Provides sophisticated conversation flow management using LangGraph's state-based workflow.

**Key Features**:
- Multi-step conversation processing
- Emotional state detection
- Topic analysis
- Response enhancement
- Follow-up question generation

**Workflow Steps**:
1. **Analyze Input** - Process user message
2. **Detect Emotion** - Analyze emotional state
3. **Analyze Topic** - Identify conversation topic
4. **Generate Response** - Create AI response
5. **Enhance Response** - Apply emotional attunement and style mirroring
6. **Generate Follow-up** - Add engaging questions (conditional)

**Usage**:
```javascript
const langgraphAgent = require('./langgraphAgent');

// Process message through agent
const response = await langgraphAgent.processMessage({
  companionId: 1,
  userId: 'user123',
  conversationId: 'conv456',
  userMessage: 'I had a great day today!'
});
```

### 3. Memory Service (`memoryService.js`)

**Purpose**: Manages conversation memories with intelligent extraction, storage, and retrieval.

**Key Features**:
- Automatic memory extraction from conversations
- Memory consolidation to prevent duplicates
- Search functionality
- Memory statistics and insights
- LangChain memory buffer integration

**Memory Types**:
- `preference` - User preferences and interests
- `experience` - Personal experiences shared
- `emotional_moment` - Significant emotional interactions
- `personal_revelation` - Personal information revealed
- `goal` - Goals and aspirations mentioned
- `relationship` - Relationship-related information

**Usage**:
```javascript
const memoryService = require('./memoryService');

// Extract and store memories
const memories = await memoryService.extractAndStoreMemories(
  companionId, userId, conversationId, userMessage, aiResponse
);

// Search memories
const results = await memoryService.searchMemories(
  companionId, userId, 'favorite food', 10
);
```

### 4. Tools Service (`toolsService.js`)

**Purpose**: Provides various tools that AI agents can use during conversations.

**Tool Categories**:

#### Memory Tools
- `search_memories` - Search through user memories
- `get_user_preferences` - Get user preferences and interests
- `get_conversation_history` - Get recent conversation history

#### Relationship Tools
- `get_relationship_status` - Get current relationship status
- `update_relationship` - Update relationship progression

#### Content Tools
- `get_weather_info` - Get weather information
- `get_time_info` - Get current time and date
- `calculate_something` - Perform calculations

#### Entertainment Tools
- `suggest_activity` - Suggest activities
- `get_joke` - Get random jokes
- `get_quote` - Get inspirational quotes

**Usage**:
```javascript
const toolsService = require('./toolsService');

// Get all tools
const tools = toolsService.getAllTools();

// Get specific tool
const searchTool = toolsService.getTool('search_memories');

// Get tools by category
const memoryTools = toolsService.getToolsByCategory('memory');
```

## 🔧 Configuration

Configuration is managed through `server/config/langchainConfig.js`:

```javascript
const { getConfig } = require('../config/langchainConfig');

// Get specific configuration
const openaiConfig = getConfig('openai');
const langgraphConfig = getConfig('langgraph');
```

## 🛣️ API Endpoints

### New LangChain Endpoints

#### Send Message with LangChain
```http
POST /api/conversations/:conversation_id/messages/langchain
Content-Type: application/json

{
  "content": "Hello! How are you?",
  "message_type": "text",
  "use_langgraph": true
}
```

#### Get Conversation with LangChain Context
```http
GET /api/conversations/:conversation_id/langchain
```

#### Get Memory Insights
```http
GET /api/conversations/:conversation_id/memories/insights
```

#### Search Memories
```http
GET /api/conversations/:conversation_id/memories/search?query=favorite&limit=10
```

## 🔄 Integration with Existing System

### Backward Compatibility
The new LangChain system is designed to work alongside the existing AI system:

- **Original endpoints** continue to work with the existing AI pipeline
- **New LangChain endpoints** provide enhanced capabilities
- **Gradual migration** is possible by updating client applications

### Migration Strategy
1. **Phase 1**: Deploy LangChain system alongside existing system
2. **Phase 2**: Test with subset of users using new endpoints
3. **Phase 3**: Gradually migrate users to LangChain system
4. **Phase 4**: Deprecate old system once migration is complete

## 🎯 Key Benefits

### Enhanced Conversation Quality
- **Sophisticated Processing**: Multi-step conversation analysis
- **Emotional Intelligence**: Automatic emotion detection and response adaptation
- **Topic Awareness**: Context-aware topic analysis and transitions
- **Memory Integration**: Persistent memory across conversations

### Advanced AI Capabilities
- **Agent-based Architecture**: State-based conversation management
- **Tool Integration**: Access to various utilities and information
- **Flexible Workflows**: Customizable conversation processing pipelines
- **Extensible Design**: Easy to add new tools and capabilities

### Performance & Scalability
- **Caching**: Intelligent caching of conversation chains and agents
- **Memory Management**: Efficient memory storage and retrieval
- **Error Handling**: Robust error handling with fallbacks
- **Monitoring**: Built-in performance tracking and logging

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install langchain @langchain/core @langchain/openai @langchain/community @langchain/langgraph
```

### 2. Environment Variables
```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=150
```

### 3. Database Setup
Ensure your database has the required tables:
- `companion_memories` - For memory storage
- `conversations` - For conversation management
- `messages` - For message storage

### 4. Test the Integration
```bash
# Test LangChain endpoint
curl -X POST http://localhost:5000/api/conversations/1/messages/langchain \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{"content": "Hello!", "use_langgraph": true}'
```

## 🔍 Monitoring & Debugging

### Logging
The system provides comprehensive logging:
- Request/response logging
- Memory operations
- Tool executions
- Performance metrics

### Debug Mode
Enable debug mode in development:
```javascript
// In langchainConfig.js
development: {
  debug: {
    enabled: true,
    logRequests: true,
    logMemoryOperations: true
  }
}
```

### Performance Monitoring
- Response time tracking
- Memory usage monitoring
- Cache hit rates
- Error rate tracking

## 🛠️ Customization

### Adding New Tools
```javascript
// In toolsService.js
toolsService.addCustomTool(
  'my_custom_tool',
  'Description of what this tool does',
  async (input) => {
    // Tool implementation
    return 'Tool result';
  }
);
```

### Custom Memory Types
```javascript
// Add new memory type to configuration
memory: {
  memoryTypes: [
    'preference',
    'experience',
    'custom_type' // Add your custom type
  ]
}
```

### Custom Workflow Steps
```javascript
// In langgraphAgent.js
workflow.addNode('my_custom_step', this.myCustomStep.bind(this));
workflow.addEdge('generate_response', 'my_custom_step');
```

## 📊 Performance Considerations

### Caching Strategy
- **Conversation Chains**: Cached per user-companion-conversation
- **Agents**: Cached with TTL-based expiration
- **Memory Buffers**: Cached for active conversations

### Memory Management
- **Automatic Cleanup**: Regular cleanup of expired cache entries
- **Memory Consolidation**: Prevents duplicate memories
- **Importance-based Storage**: Only stores significant memories

### Scalability
- **Horizontal Scaling**: Stateless design supports multiple instances
- **Database Optimization**: Efficient queries with proper indexing
- **Rate Limiting**: Built-in rate limiting for API protection

## 🔒 Security

### Content Moderation
- User input validation
- AI response moderation
- Inappropriate content filtering

### Rate Limiting
- Request rate limiting
- Per-user limits
- API protection

### Input Validation
- Message length limits
- Content sanitization
- Type validation

## 🧪 Testing

### Unit Tests
```bash
npm test -- --grep "langchain"
```

### Integration Tests
```bash
npm run test:integration -- --grep "conversation"
```

### Load Testing
```bash
npm run test:load -- --endpoint="/api/conversations/*/messages/langchain"
```

## 📈 Future Enhancements

### Planned Features
- **Multi-modal Support**: Image and audio processing
- **Advanced Memory**: Semantic memory search
- **Custom Agents**: User-defined conversation agents
- **Analytics Dashboard**: Conversation insights and metrics

### Extensibility
- **Plugin System**: Easy addition of new capabilities
- **Custom Workflows**: User-defined conversation flows
- **Third-party Integrations**: External service integrations

## 🤝 Contributing

### Development Guidelines
1. Follow existing code patterns
2. Add comprehensive tests
3. Update documentation
4. Follow security best practices

### Code Style
- Use ES6+ features
- Follow async/await patterns
- Implement proper error handling
- Add JSDoc comments

## 📞 Support

For questions or issues:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information
4. Contact the development team

---

**Note**: This LangChain integration represents a significant enhancement to the Amora AI Companion system, providing sophisticated AI capabilities while maintaining backward compatibility with the existing system.
