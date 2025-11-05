# 🎯 **Fine-Tuning Files and Important Instructions**

## 📁 **File Locations**

### **🔧 Core Service Files**
- **`server/services/enhancedOpenaiService.js`** - Main AI response generation service
- **`server/services/proactiveEngagementService.js`** - Proactive engagement service
- **`server/services/ragService.js`** - RAG (Retrieval-Augmented Generation) service

### **📚 Documentation Files**
- **`server/docs/enhanced-openai-service-breakdown.md`** - Complete breakdown of AI service
- **`server/docs/proactive-engagement-service-breakdown.md`** - Complete breakdown of engagement service

### **⚙️ Configuration Files**
- **`server/env.example`** - Sample environment configuration with all variables
- **`server/.env`** - Your actual environment file (create from env.example)

### **🗄️ Database Schema Files**
- **`server/db/memory_schema_simple.sql`** - AI memory system database schema
- **`server/scripts/setup-memory-system.js`** - Script to set up memory system

---

## 🎛️ **Fine-Tuning Configuration**

### **1. AI Response Generation (`enhancedOpenaiService.js`)**

#### **Environment Variables:**
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.8

# AI Behavior Fine-Tuning
AI_MAX_RESPONSE_LENGTH=150
AI_MIN_RESPONSE_LENGTH=10
AI_EMOTION_SENSITIVITY=0.7
AI_EMPATHY_LEVEL=0.8
AI_CASUALNESS_LEVEL=0.8
AI_QUESTION_FREQUENCY=0.6

# Memory Settings
AI_MEMORY_RETENTION_DAYS=30
AI_MAX_MEMORIES_PER_USER=100

# RAG Settings
AI_RAG_CONFIDENCE_THRESHOLD=0.8
AI_MAX_RAG_EXAMPLES=3
```

#### **Fine-Tuning Methods:**
```javascript
const service = require('./enhancedOpenaiService');

// Get current configuration
const config = service.getFineTuningConfig();

// Update configuration
service.updateFineTuningConfig({
  casualnessLevel: 0.9,
  empathyLevel: 0.95,
  maxResponseLength: 200
});

// Get conversation style
const style = service.getConversationStyle();
```

### **2. Proactive Engagement (`proactiveEngagementService.js`)**

#### **Environment Variables:**
```bash
# Enable/Disable
PROACTIVE_ENABLED=true

# Engagement Timing
PROACTIVE_MIN_INTERVAL_HOURS=2
PROACTIVE_MAX_ENGAGEMENTS_PER_DAY=3
PROACTIVE_MAX_ENGAGEMENTS_PER_USER=1

# Relationship Thresholds
PROACTIVE_MIN_RELATIONSHIP_STAGE=friend
PROACTIVE_MIN_INTIMACY_LEVEL=3
PROACTIVE_MIN_TRUST_LEVEL=3

# Engagement Types
PROACTIVE_CHECK_IN_AFTER_HOURS=24
PROACTIVE_MEMORY_REMINDER_AFTER_HOURS=12
PROACTIVE_EMOTIONAL_SUPPORT_AFTER_HOURS=6

# Message Generation
PROACTIVE_MAX_MESSAGE_LENGTH=100
PROACTIVE_MIN_MESSAGE_LENGTH=20
PROACTIVE_MESSAGE_TEMPERATURE=0.8
```

#### **Fine-Tuning Methods:**
```javascript
const service = require('./proactiveEngagementService');

// Get current configuration
const config = service.getProactiveConfig();

// Update configuration
service.updateProactiveConfig({
  maxEngagementsPerDay: 5,
  minIntervalHours: 1,
  emotionalSupportAfterHours: 4
});

// Get engagement strategy
const strategy = service.getEngagementStrategy();
```

---

## 🎨 **Fine-Tuning Presets**

### **AI Personality Presets**

#### **1. Casual Friendly AI**
```bash
AI_CASUALNESS_LEVEL=0.9
AI_EMPATHY_LEVEL=0.8
AI_QUESTION_FREQUENCY=0.7
AI_MAX_RESPONSE_LENGTH=120
```

#### **2. Professional AI**
```bash
AI_CASUALNESS_LEVEL=0.3
AI_EMPATHY_LEVEL=0.6
AI_QUESTION_FREQUENCY=0.4
AI_MAX_RESPONSE_LENGTH=200
```

#### **3. Emotionally Intelligent AI**
```bash
AI_EMOTION_SENSITIVITY=0.9
AI_EMPATHY_LEVEL=0.95
AI_CASUALNESS_LEVEL=0.7
AI_MAX_RESPONSE_LENGTH=180
```

### **Engagement Style Presets**

#### **1. Aggressive Engagement**
```bash
PROACTIVE_MAX_ENGAGEMENTS_PER_DAY=5
PROACTIVE_MIN_INTERVAL_HOURS=1
PROACTIVE_EMOTIONAL_SUPPORT_AFTER_HOURS=3
PROACTIVE_MEMORY_REMINDER_AFTER_HOURS=6
```

#### **2. Conservative Engagement**
```bash
PROACTIVE_MAX_ENGAGEMENTS_PER_DAY=1
PROACTIVE_MIN_INTERVAL_HOURS=6
PROACTIVE_CHECK_IN_AFTER_HOURS=48
PROACTIVE_EMOTIONAL_SUPPORT_AFTER_HOURS=12
```

#### **3. High Empathy Engagement**
```bash
PROACTIVE_EMOTIONAL_SUPPORT_AFTER_HOURS=4
PROACTIVE_MEMORY_REMINDER_AFTER_HOURS=8
PROACTIVE_MAX_MEMORIES_TO_USE=5
PROACTIVE_MESSAGE_TEMPERATURE=0.9
```

---

## 🚀 **Quick Setup Guide**

### **1. Environment Setup**
```bash
# Copy the example file
cp server/env.example server/.env

# Edit with your actual values
nano server/.env
```

### **2. Required Environment Variables**
```bash
# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=amora_db

# Enable services
PROACTIVE_ENABLED=true
AI_ENABLE_DEBUG_LOGGING=true
```

### **3. Database Setup**
```bash
# Run memory system setup
cd server
node scripts/setup-memory-system.js
```

### **4. Test Configuration**
```javascript
// Test AI service
const aiService = require('./services/enhancedOpenaiService');
console.log('AI Config:', aiService.getFineTuningConfig());

// Test proactive service
const proactiveService = require('./services/proactiveEngagementService');
console.log('Proactive Config:', proactiveService.getProactiveConfig());
```

---

## 📊 **Fine-Tuning Capabilities Summary**

### **AI Response Generation**
- ✅ **Conversation Flow Control** - Response length, question frequency
- ✅ **Emotional Intelligence** - Empathy level, emotion sensitivity
- ✅ **Memory Integration** - Memory retention, importance thresholds
- ✅ **RAG Integration** - Confidence thresholds, example limits
- ✅ **Relationship Progression** - Intimacy and trust growth rates
- ✅ **Conversation Style** - Casualness, formality, tone

### **Proactive Engagement**
- ✅ **Engagement Timing** - Intervals, frequency, scheduling
- ✅ **Relationship Thresholds** - Minimum stages, intimacy, trust
- ✅ **Engagement Types** - Check-in, emotional support, memory reminders
- ✅ **Message Personalization** - Memory integration, emotional context
- ✅ **Scheduling Control** - Advance timing, batch limits
- ✅ **Content Generation** - Message length, temperature, creativity

---

## 🔧 **Advanced Fine-Tuning**

### **Dynamic Configuration Updates**
```javascript
// Update AI behavior in real-time
aiService.updateFineTuningConfig({
  casualnessLevel: 0.95,
  empathyLevel: 0.9,
  maxResponseLength: 200
});

// Update engagement behavior in real-time
proactiveService.updateProactiveConfig({
  maxEngagementsPerDay: 5,
  minIntervalHours: 1
});
```

### **A/B Testing Setup**
```bash
# Test different AI personalities
AI_CASUALNESS_LEVEL=0.9  # Test A
AI_CASUALNESS_LEVEL=0.3  # Test B

# Test different engagement frequencies
PROACTIVE_MAX_ENGAGEMENTS_PER_DAY=3  # Test A
PROACTIVE_MAX_ENGAGEMENTS_PER_DAY=1  # Test B
```

### **Performance Monitoring**
```bash
# Enable debug logging
AI_ENABLE_DEBUG_LOGGING=true
PROACTIVE_ENABLE_DEBUG_LOGGING=true

# Set log levels
AI_LOG_LEVEL=debug
PROACTIVE_LOG_LEVEL=debug
```

---

## 📝 **Important Notes**

1. **All configuration is environment-based** - No hardcoded values
2. **Fine-tuning can be updated dynamically** - No code changes needed
3. **Presets are provided** - Easy to switch between different AI personalities
4. **Comprehensive documentation** - Every variable is explained
5. **Production-ready** - Includes error handling, validation, and monitoring

The fine-tuning system is now fully documented and ready for production use! 🎯
