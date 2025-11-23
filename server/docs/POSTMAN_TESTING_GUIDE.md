# Postman Testing Guide - Complete API Flow

## 🎯 Complete Testing Flow: Login → Select Companion → Start Conversation

This guide walks you through testing the entire API flow in Postman.

## 📋 Prerequisites

1. **Server Running**: Make sure your server is running
   ```bash
   cd server
   npm start
   ```
   Default port: `3000` (check your `.env` for `PORT`)

2. **Base URL**: `http://localhost:5000` (or your server URL - check your `.env` for `PORT`)

3. **Postman Setup**: 
   - Create a new collection: "Amora API Tests"
   - Set up environment variables (see below)

---

## 🔧 Postman Environment Variables

Create a Postman environment with these variables:

| Variable | Initial Value | Description |
|----------|--------------|-------------|
| `base_url` | `http://localhost:5000` | Your server URL (default port 5000) |
| `token` | (empty) | JWT token (auto-filled after login) |
| `user_id` | (empty) | User ID (auto-filled after login) |
| `companion_id` | (empty) | Selected companion ID |
| `conversation_id` | (empty) | Active conversation ID |

---

## 📝 Step-by-Step Testing

### **Step 1: Register a New User** (Optional)

**Endpoint**: `POST /api/user/register`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "email": "test@example.com",
  "password": "Test123!@#",
  "name": "Test User"
}
```

**Expected Response** (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

**Postman Script** (Tests tab):
```javascript
// Save token for future requests
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
    pm.environment.set("user_id", jsonData.user.id);
}
```

---

### **Step 2: Login**

**Endpoint**: `POST /api/user/login`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "email": "test@example.com",
  "password": "Test123!@#"
}
```

**Expected Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

**Postman Script** (Tests tab):
```javascript
// Save token and user ID
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
    pm.environment.set("user_id", jsonData.user.id);
    console.log("Token saved:", jsonData.token);
}
```

---

### **Step 3: Get Current User (Verify Token)**

**Endpoint**: `GET /api/user/me`

**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Expected Response** (200):
```json
{
  "user": {
    "id": "123",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

---

### **Step 4: Get Available Companions**

**Endpoint**: `GET /api/companions`

**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Expected Response** (200):
```json
{
  "companions": [
    {
      "id": 1,
      "name": "Emma",
      "personality": "friendly",
      "age": 25,
      "country": "USA",
      "image_url": "/uploads/companions/emma.webp"
    },
    {
      "id": 2,
      "name": "Sophia",
      "personality": "intelligent",
      "age": 28,
      "country": "UK",
      "image_url": "/uploads/companions/sophia.webp"
    }
  ]
}
```

**Postman Script** (Tests tab):
```javascript
// Save first companion ID (optional)
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.companions && jsonData.companions.length > 0) {
        pm.environment.set("companion_id", jsonData.companions[0].id);
        console.log("Companion ID saved:", jsonData.companions[0].id);
    }
}
```

---

### **Step 5: Get Companion Matches (AI-Powered)**

**Endpoint**: `GET /api/matching/matches`

**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Expected Response** (200):
```json
{
  "matches": [
    {
      "companion_id": 1,
      "match_score": 0.95,
      "companion": {
        "id": 1,
        "name": "Emma",
        "personality": "friendly"
      }
    }
  ]
}
```

---

### **Step 6: Select a Companion**

**Option A: Using Matching Route**

**Endpoint**: `POST /api/matching/select`

**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "companion_id": 1,
  "selection_reason": "I like friendly personalities"
}
```

**Expected Response** (200):
```json
{
  "message": "Companion selected successfully",
  "companion": {
    "id": 1,
    "name": "Emma"
  }
}
```

**Postman Script** (Tests tab):
```javascript
// Save companion ID
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.companion) {
        pm.environment.set("companion_id", jsonData.companion.id);
    }
}
```

**Option B: Using Conversation Route (Creates Conversation Too)**

**Endpoint**: `POST /api/conversations/select-companion`

**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "companion_id": 1,
  "selection_reason": "I want to chat with Emma"
}
```

**Expected Response** (201):
```json
{
  "message": "Companion selected and conversation created",
  "conversation": {
    "id": 123,
    "companion_id": 1,
    "user_id": "123"
  },
  "companion": {
    "id": 1,
    "name": "Emma"
  }
}
```

**Postman Script** (Tests tab):
```javascript
// Save conversation ID
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    if (jsonData.conversation) {
        pm.environment.set("conversation_id", jsonData.conversation.id);
        pm.environment.set("companion_id", jsonData.companion.id);
    }
}
```

---

### **Step 7: Create a Conversation (If Not Created in Step 6)**

**Endpoint**: `POST /api/conversations`

**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "companion_id": 1
}
```

**Expected Response** (201):
```json
{
  "conversation": {
    "id": 123,
    "companion_id": 1,
    "user_id": "123",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Postman Script** (Tests tab):
```javascript
// Save conversation ID
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("conversation_id", jsonData.conversation.id);
}
```

---

### **Step 8: Get All Conversations**

**Endpoint**: `GET /api/conversations`

**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Expected Response** (200):
```json
{
  "conversations": [
    {
      "id": 123,
      "companion_id": 1,
      "companion_name": "Emma",
      "last_message": "Hello!",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### **Step 9: Get Specific Conversation**

**Endpoint**: `GET /api/conversations/{{conversation_id}}`

**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Expected Response** (200):
```json
{
  "conversation": {
    "id": 123,
    "companion_id": 1,
    "companion_name": "Emma",
    "messages": [
      {
        "id": 1,
        "sender_type": "user",
        "content": "Hello!",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### **Step 10: Send a Message** ⭐ (Test AI Response)

**Endpoint**: `POST /api/conversations/{{conversation_id}}/messages`

**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "content": "Hello! How are you today?",
  "message_type": "text"
}
```

**Expected Response** (201):
```json
{
  "user_message_id": 1,
  "user_message": {
    "id": 1,
    "content": "Hello! How are you today?",
    "sender_type": "user"
  },
  "ai_response": {
    "id": 2,
    "content": "Hi! I'm doing great, thanks for asking! How about you?",
    "sender_type": "companion"
  },
  "message": "Message sent successfully"
}
```

**This is where you test:**
- ✅ Claude 3.5 Sonnet responses
- ✅ Chroma semantic memory search
- ✅ Enhanced conversation context
- ✅ Memory storage and retrieval

---

### **Step 11: Send More Messages (Test Memory & Context)**

**Endpoint**: `POST /api/conversations/{{conversation_id}}/messages`

**Body Examples**:

**Message 1**:
```json
{
  "content": "My favorite food is pizza",
  "message_type": "text"
}
```

**Message 2** (Test Memory):
```json
{
  "content": "What's my favorite food?",
  "message_type": "text"
}
```

**Message 3** (Test Semantic Search):
```json
{
  "content": "I love Italian cuisine",
  "message_type": "text"
}
```

The AI should remember and reference previous messages!

---

## 🔍 Additional Endpoints

### **Get Selected Companion**

**Endpoint**: `GET /api/user/selected-companion`

**Headers**:
```
Authorization: Bearer {{token}}
```

---

### **Get Memory Insights** (LangChain)

**Endpoint**: `GET /api/conversations/{{conversation_id}}/memories`

**Headers**:
```
Authorization: Bearer {{token}}
```

---

### **Search Memories**

**Endpoint**: `GET /api/conversations/{{conversation_id}}/memories/search?query=pizza`

**Headers**:
```
Authorization: Bearer {{token}}
```

---

## 🐛 Troubleshooting

### **401 Unauthorized**
- Check that `{{token}}` is set correctly
- Token might have expired (login again)
- Verify `Authorization: Bearer {{token}}` header

### **404 Not Found**
- Check `{{conversation_id}}` is set
- Verify the conversation exists
- Check base URL is correct

### **500 Server Error**
- Check server logs
- Verify database connection
- Check environment variables (CLAUDE_API_KEY, OPENAI_API_KEY)

### **No AI Response**
- Check `CLAUDE_API_KEY` is set in `.env`
- Check `OPENAI_API_KEY` is set (for embeddings)
- Check server logs for errors
- Verify conversation was created successfully

---

## 📊 Quick Test Checklist

- [ ] Server is running
- [ ] User registered/logged in
- [ ] Token saved in environment
- [ ] Companion selected
- [ ] Conversation created
- [ ] Message sent successfully
- [ ] AI response received
- [ ] Memory working (AI remembers previous messages)
- [ ] Semantic search working (AI finds relevant memories)

---

## 🚀 Postman Collection Export

You can export this as a Postman collection:

1. Create all requests in Postman
2. Set up environment variables
3. Add the test scripts to save tokens/IDs
4. Export collection: Collection → Export
5. Share with your team!

---

## 💡 Pro Tips

1. **Use Pre-request Scripts**: Auto-set headers
   ```javascript
   pm.request.headers.add({
       key: 'Authorization',
       value: 'Bearer ' + pm.environment.get('token')
   });
   ```

2. **Chain Requests**: Use collection runner to test full flow

3. **Save Responses**: Use "Save Response" to compare AI responses

4. **Test Memory**: Send multiple messages and verify AI remembers context

5. **Monitor Logs**: Watch server console for Chroma/Claude activity

---

## 📝 Example Full Flow Script

```javascript
// Pre-request script for all authenticated requests
const token = pm.environment.get("token");
if (token) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + token
    });
}
```

Happy Testing! 🎉

