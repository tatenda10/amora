# 🎯 **Centralized AI Companion Configuration Guide**

## 📁 **File Location**
**`server/config/aiCompanionConfig.js`** - Centralized configuration file with all important instructions and fine-tuning capabilities.

---

## 🚀 **Quick Start**

### **1. Import the Configuration**
```javascript
const aiConfig = require('../config/aiCompanionConfig');
```

### **2. Use in Services**
```javascript
// In enhancedOpenaiService.js
const aiConfig = require('../config/aiCompanionConfig');

class EnhancedOpenAIService {
  constructor() {
    this.config = aiConfig.getAIConfig();
    this.dbConfig = aiConfig.getDatabaseConfig();
    // ... rest of constructor
  }
}

// In proactiveEngagementService.js
const aiConfig = require('../config/aiCompanionConfig');

class ProactiveEngagementService {
  constructor() {
    this.config = aiConfig.getProactiveConfig();
    this.dbConfig = aiConfig.getDatabaseConfig();
    // ... rest of constructor
  }
}
```

---

## 🔧 **Configuration Methods**

### **AI Response Generation**
```javascript
// Get AI configuration
const config = aiConfig.getAIConfig();

// Update AI configuration
aiConfig.updateAIConfig({
  casualnessLevel: 0.9,
  empathyLevel: 0.95,
  maxResponseLength: 200
});

// Get conversation style
const style = aiConfig.getAIConversationStyle();

// Apply AI preset
aiConfig.applyAIPreset('casualFriendly');

// Get system prompt instructions
const instructions = aiConfig.getSystemPromptInstructions();
```

### **Proactive Engagement**
```javascript
// Get proactive configuration
const config = aiConfig.getProactiveConfig();

// Update proactive configuration
aiConfig.updateProactiveConfig({
  maxEngagementsPerDay: 5,
  minIntervalHours: 1,
  emotionalSupportAfterHours: 4
});

// Get engagement strategy
const strategy = aiConfig.getProactiveEngagementStrategy();

// Apply proactive preset
aiConfig.applyProactivePreset('aggressive');

// Get engagement instructions
const instructions = aiConfig.getEngagementInstructions();
```

### **Database Configuration**
```javascript
// Get database configuration
const dbConfig = aiConfig.getDatabaseConfig();
```

---

## 🎨 **Available Presets**

### **AI Personality Presets**
```javascript
// Casual Friendly AI
aiConfig.applyAIPreset('casualFriendly');
// Sets: casualnessLevel: 0.9, empathyLevel: 0.8, questionFrequency: 0.7

// Professional AI
aiConfig.applyAIPreset('professional');
// Sets: casualnessLevel: 0.3, empathyLevel: 0.6, questionFrequency: 0.4

// Emotionally Intelligent AI
aiConfig.applyAIPreset('emotionallyIntelligent');
// Sets: emotionSensitivity: 0.9, empathyLevel: 0.95, casualnessLevel: 0.7

// Concise AI
aiConfig.applyAIPreset('concise');
// Sets: maxResponseLength: 80, minResponseLength: 15, questionFrequency: 0.5
```

### **Proactive Engagement Presets**
```javascript
// Aggressive Engagement
aiConfig.applyProactivePreset('aggressive');
// Sets: maxEngagementsPerDay: 5, minIntervalHours: 1, emotionalSupportAfterHours: 3

// Conservative Engagement
aiConfig.applyProactivePreset('conservative');
// Sets: maxEngagementsPerDay: 1, minIntervalHours: 6, checkInAfterHours: 48

// High Empathy Engagement
aiConfig.applyProactivePreset('highEmpathy');
// Sets: emotionalSupportAfterHours: 4, maxMemoriesToUse: 5, messageTemperature: 0.9

// Minimal Engagement
aiConfig.applyProactivePreset('minimal');
// Sets: maxEngagementsPerDay: 1, minIntervalHours: 12, checkInAfterHours: 72
```

---

## 📊 **Configuration Structure**

### **AI Configuration**
```javascript
{
  // OpenAI Configuration
  apiKey: "your_openai_api_key",
  model: "gpt-4",
  maxTokens: 500,
  temperature: 0.8,
  
  // Conversation Flow
  maxResponseLength: 150,
  minResponseLength: 10,
  
  // Emotional Intelligence
  emotionSensitivity: 0.7,
  empathyLevel: 0.8,
  
  // Memory Settings
  memoryRetentionDays: 30,
  maxMemoriesPerUser: 100,
  
  // RAG Settings
  ragConfidenceThreshold: 0.8,
  maxRAGExamples: 3,
  
  // Relationship Progression
  intimacyGrowthRate: 0.1,
  trustGrowthRate: 0.1,
  
  // Conversation Style
  casualnessLevel: 0.8,
  questionFrequency: 0.6,
  
  // Debug Settings
  enableDebugLogging: true,
  logLevel: "info"
}
```

### **Proactive Configuration**
```javascript
{
  // Engagement Timing
  enabled: true,
  minIntervalHours: 2,
  maxEngagementsPerDay: 3,
  maxEngagementsPerUser: 1,
  
  // Relationship Thresholds
  minRelationshipStage: "friend",
  minIntimacyLevel: 3,
  minTrustLevel: 3,
  
  // Engagement Types
  checkInAfterHours: 24,
  memoryReminderAfterHours: 12,
  emotionalSupportAfterHours: 6,
  
  // Message Generation
  maxMessageLength: 100,
  minMessageLength: 20,
  messageTemperature: 0.8,
  
  // Memory Integration
  maxMemoriesToUse: 3,
  memoryImportanceThreshold: 5,
  
  // Scheduling
  scheduleAdvanceHours: 3,
  maxScheduledEngagements: 50,
  
  // Debug Settings
  enableDebugLogging: true,
  logLevel: "info"
}
```

---

## 🎯 **System Prompt Instructions**

### **Get AI Instructions**
```javascript
const instructions = aiConfig.getSystemPromptInstructions();

// Returns:
{
  conversationRules: [
    'Keep responses SHORT and natural',
    'Don\'t ask random questions',
    'Follow the conversation flow - respond to what they just said',
    // ... more rules
  ],
  
  conversationExamples: [
    'If they say "It\'s great, how is yours?" → "That\'s awesome! What are you up to today?"',
    'If they say "I\'m working" → "Nice! What kind of work do you do?"',
    // ... more examples
  ],
  
  styleGuidelines: {
    tone: 'casual',
    questionStyle: 'curious',
    responseLength: 'detailed',
    empathyLevel: 'high'
  },
  
  responseConstraints: {
    maxLength: 150,
    minLength: 10,
    temperature: 0.8
  }
}
```

### **Get Engagement Instructions**
```javascript
const instructions = aiConfig.getEngagementInstructions();

// Returns:
{
  engagementTypes: {
    check_in: {
      trigger: 'After 24 hours',
      instruction: 'Write a caring check-in message...',
      example: 'Hey! How are you doing? I was thinking about you.'
    },
    emotional_support: {
      trigger: 'After 6 hours for close relationships',
      instruction: 'Offer emotional support...',
      example: 'I hope you\'re doing okay. I\'m here if you need to talk.'
    },
    // ... more types
  },
  
  strategyGuidelines: {
    frequency: 'aggressive',
    personalization: 'high',
    timing: 'frequent',
    empathy: 'high'
  },
  
  messageConstraints: {
    maxLength: 100,
    minLength: 20,
    temperature: 0.8
  }
}
```

---

## 🔄 **Dynamic Configuration Updates**

### **Real-Time Updates**
```javascript
// Update AI behavior without restart
aiConfig.updateAIConfig({
  casualnessLevel: 0.95,
  empathyLevel: 0.9,
  maxResponseLength: 200
});

// Update engagement behavior without restart
aiConfig.updateProactiveConfig({
  maxEngagementsPerDay: 5,
  minIntervalHours: 1
});
```

### **Preset Switching**
```javascript
// Switch to different AI personality
aiConfig.applyAIPreset('professional');

// Switch to different engagement style
aiConfig.applyProactivePreset('conservative');
```

---

## 📝 **Environment Variables**

All configuration comes from environment variables. See `server/env.example` for complete list:

### **Required Variables**
```bash
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.8
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=amora_db
```

### **AI Fine-Tuning Variables**
```bash
AI_MAX_RESPONSE_LENGTH=150
AI_CASUALNESS_LEVEL=0.8
AI_EMPATHY_LEVEL=0.8
AI_QUESTION_FREQUENCY=0.6
# ... see env.example for complete list
```

### **Proactive Fine-Tuning Variables**
```bash
PROACTIVE_ENABLED=true
PROACTIVE_MAX_ENGAGEMENTS_PER_DAY=3
PROACTIVE_MIN_INTERVAL_HOURS=2
PROACTIVE_CHECK_IN_AFTER_HOURS=24
# ... see env.example for complete list
```

---

## ⚠️ **Important Notes**

1. **Centralized Configuration** - All important instructions are in one file
2. **Environment-Based** - All sensitive data comes from environment variables
3. **Dynamic Updates** - Configuration can be updated without code changes
4. **Preset Support** - Easy switching between different AI personalities
5. **Validation** - Environment variables are validated on startup
6. **Documentation** - Every configuration option is documented
7. **Production Ready** - Includes error handling and fallbacks

The centralized configuration makes it easy to manage all AI companion settings from one place! 🎯
