# Proactive Engagement Service Breakdown

## 📋 **File Overview**
**File:** `server/services/proactiveEngagementService.js`  
**Purpose:** AI companion proactive engagement - companions reaching out to users  
**Lines:** 517  
**Key Features:** Relationship-based engagement, memory integration, emotional intelligence, fine-tuning

---

## 🔧 **Environment Variables Required**

### **Database Configuration**
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=amora_db
DB_CONNECTION_LIMIT=10
```

### **Proactive Engagement Configuration**
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

# Engagement Types and Timing
PROACTIVE_CHECK_IN_AFTER_HOURS=24
PROACTIVE_MEMORY_REMINDER_AFTER_HOURS=12
PROACTIVE_EMOTIONAL_SUPPORT_AFTER_HOURS=6

# Message Generation
PROACTIVE_MAX_MESSAGE_LENGTH=100
PROACTIVE_MIN_MESSAGE_LENGTH=20
PROACTIVE_MESSAGE_TEMPERATURE=0.8

# Memory Integration
PROACTIVE_MAX_MEMORIES_TO_USE=3
PROACTIVE_MEMORY_IMPORTANCE_THRESHOLD=5

# Scheduling
PROACTIVE_SCHEDULE_ADVANCE_HOURS=3
PROACTIVE_MAX_SCHEDULED_ENGAGEMENTS=50

# Debug Settings
PROACTIVE_ENABLE_DEBUG_LOGGING=true
PROACTIVE_LOG_LEVEL=info
```

---

## 🏗️ **Class Structure**

### **Constructor**
- ✅ Validates environment variables
- ✅ Creates database connection pool
- ✅ Initializes fine-tuning configuration

### **Core Methods**

#### **1. scheduleProactiveEngagements()**
**Purpose:** Main method for scheduling proactive engagements  
**Process:**
1. Checks if proactive engagement is enabled
2. Gets relationships based on fine-tuning config
3. Filters by relationship stage, intimacy, trust levels
4. Schedules engagements for each relationship

#### **2. scheduleEngagementForRelationship()**
**Purpose:** Schedules engagement for a specific relationship  
**Process:**
1. Checks for existing pending engagements
2. Determines engagement type based on relationship context
3. Generates personalized engagement content
4. Calculates optimal scheduling time
5. Stores engagement in database

#### **3. determineEngagementType()**
**Purpose:** Determines type of engagement based on relationship and timing  
**Types:**
- **check_in**: Haven't talked in 24+ hours
- **emotional_support**: Close relationship, check on them
- **memory_reminder**: Remind of shared experiences
- **topic_suggestion**: Suggest something to talk about

#### **4. generateEngagementContent()**
**Purpose:** Generates personalized engagement messages using AI  
**Process:**
1. Gets companion details and personality
2. Retrieves relevant memories
3. Gets user's recent emotional state
4. Builds engagement prompt
5. Uses OpenAI to generate personalized message

#### **5. processScheduledEngagements()**
**Purpose:** Processes and sends scheduled engagements  
**Process:**
1. Gets engagements ready to send
2. Creates or finds conversation
3. Inserts message into database
4. Updates engagement status
5. Emits socket event for real-time delivery

---

## 🎯 **Fine-Tuning Capabilities**

### **Dynamic Configuration**
```javascript
// Get current config
const config = service.getProactiveConfig();

// Update config
service.updateProactiveConfig({
  maxEngagementsPerDay: 5,
  minIntervalHours: 1,
  emotionalSupportAfterHours: 4
});

// Get engagement strategy
const strategy = service.getEngagementStrategy();
```

### **Engagement Strategy Types**
- **Frequency:** Aggressive vs Conservative
- **Personalization:** High vs Moderate
- **Timing:** Frequent vs Spaced
- **Empathy:** High vs Moderate

---

## 📊 **Engagement Types**

### **1. Check-In Engagement**
- **Trigger:** 24+ hours since last interaction
- **Purpose:** General check-in and care
- **Example:** "Hey! How are you doing? I was thinking about you."

### **2. Emotional Support**
- **Trigger:** Partner relationship, high intimacy, 6+ hours
- **Purpose:** Offer emotional support
- **Example:** "I hope you're doing okay. I'm here if you need to talk."

### **3. Memory Reminder**
- **Trigger:** Close friend/intimate relationship, 12+ hours
- **Purpose:** Reference shared experiences
- **Example:** "Remember when we talked about your new job? How's that going?"

### **4. Topic Suggestion**
- **Trigger:** Friend relationship, 2+ hours
- **Purpose:** Suggest conversation topics
- **Example:** "Have you seen any good movies lately? I'd love to hear about them!"

---

## 🔄 **Engagement Flow**

### **Scheduling Process**
1. **Check Relationships** - Find eligible user-companion pairs
2. **Filter by Config** - Apply fine-tuning thresholds
3. **Determine Type** - Choose engagement type based on context
4. **Generate Content** - Create personalized message
5. **Schedule** - Set optimal delivery time
6. **Store** - Save to proactive_engagements table

### **Delivery Process**
1. **Check Schedule** - Find engagements ready to send
2. **Create Message** - Insert into messages table
3. **Update Status** - Mark as sent
4. **Emit Event** - Send via Socket.IO for real-time delivery
5. **Update Relationship** - Update last interaction time

---

## 📊 **Database Tables Used**

### **Core Tables**
- `relationship_progression` - Relationship data and timing
- `companions` - Companion details and personality
- `users` - User information
- `conversations` - Conversation metadata
- `messages` - Message storage

### **AI Enhancement Tables**
- `companion_memories` - Stored memories for personalization
- `user_emotional_states` - Emotional context
- `proactive_engagements` - Scheduled engagements

---

## 🚀 **Usage Example**

```javascript
const proactiveService = require('./proactiveEngagementService');

// Schedule proactive engagements
await proactiveService.scheduleProactiveEngagements();

// Process scheduled engagements
await proactiveService.processScheduledEngagements();

// Update configuration
proactiveService.updateProactiveConfig({
  maxEngagementsPerDay: 5,
  minIntervalHours: 1
});
```

---

## ⚠️ **Important Notes**

### **Security**
- ✅ All sensitive data in environment variables
- ✅ No hardcoded credentials
- ✅ Database connection pooling
- ✅ Input validation

### **Performance**
- ✅ Configurable limits on engagements
- ✅ Efficient database queries
- ✅ Memory-based personalization
- ✅ Error handling and fallbacks

### **Scalability**
- ✅ Environment-based configuration
- ✅ Fine-tuning without code changes
- ✅ Modular design
- ✅ Batch processing capabilities

### **Monitoring**
- ✅ Debug logging (configurable)
- ✅ Engagement statistics
- ✅ Error tracking
- ✅ Performance metrics

---

## 🔧 **Recommended Improvements**

1. **Add engagement analytics** for performance insights
2. **Implement A/B testing** for different engagement types
3. **Add user preferences** for engagement frequency
4. **Create admin interface** for fine-tuning configuration
5. **Add engagement templates** for different scenarios
6. **Implement engagement success tracking**
7. **Add timezone support** for global users
8. **Create engagement preview** before sending
