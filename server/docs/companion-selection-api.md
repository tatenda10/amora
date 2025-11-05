# Companion Selection API

## Overview
This endpoint allows users to select a companion from their matching results and automatically creates a conversation with that companion.

## Endpoint

### POST `/api/conversations/select-companion`

**Description:** Select a companion and create a conversation

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "user_id": "string",
  "companion_id": "number",
  "selection_reason": "string (optional)"
}
```

**Parameters:**
- `user_id` (required): The ID of the user selecting the companion
- `companion_id` (required): The ID of the companion to select
- `selection_reason` (optional): Reason for selecting this companion (for analytics)

## Response

### Success Response (New Conversation Created)
```json
{
  "conversation_id": 123,
  "message": "Companion selected and conversation created successfully",
  "companion_name": "Sarah",
  "is_new_conversation": true
}
```

### Success Response (Existing Conversation)
```json
{
  "conversation_id": 123,
  "message": "Conversation already exists with this companion",
  "companion_name": "Sarah",
  "is_new_conversation": false
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "message": "user_id and companion_id are required"
}
```

#### 404 Not Found
```json
{
  "message": "Companion not found"
}
```

#### 500 Internal Server Error
```json
{
  "message": "Error selecting companion"
}
```

## Usage Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const selectCompanion = async (userId, companionId, reason) => {
  try {
    const response = await axios.post('http://localhost:5000/api/conversations/select-companion', {
      user_id: userId,
      companion_id: companionId,
      selection_reason: reason
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Companion selected:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error selecting companion:', error.response?.data);
    throw error;
  }
};

// Usage
selectCompanion('user123', 1, 'Great personality match!');
```

### cURL
```bash
curl -X POST http://localhost:5000/api/conversations/select-companion \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "user_id": "user123",
    "companion_id": 1,
    "selection_reason": "Liked the personality and interests match"
  }'
```

## Database Schema

### companion_selections Table
```sql
CREATE TABLE companion_selections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    companion_id INT NOT NULL,
    selection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (companion_id) REFERENCES companions(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_companion_id (companion_id),
    INDEX idx_created_at (created_at)
);
```

## Features

1. **Automatic Conversation Creation**: Creates a new conversation when a companion is selected
2. **Duplicate Prevention**: Returns existing conversation if user already has one with the selected companion
3. **Notification System**: Automatically creates a notification when a new conversation is started
4. **Analytics Tracking**: Logs companion selections for future analysis
5. **Error Handling**: Comprehensive error handling with meaningful messages

## Integration with Matching System

This endpoint is designed to work seamlessly with the matching system:

1. User gets 3 companion matches from `/api/matching`
2. User selects one companion using this endpoint
3. Conversation is automatically created
4. User can immediately start chatting

## Notes

- The endpoint automatically creates a notification when a new conversation is started
- Companion selections are logged for analytics purposes
- The endpoint validates that the companion exists before creating a conversation
- All operations are wrapped in proper error handling 