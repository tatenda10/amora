/**
 * Input validation and sanitization middleware
 */

// Sanitize user input
function sanitizeInput(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Remove null bytes
  text = text.replace(/\0/g, '');
  
  // Trim whitespace
  text = text.trim();
  
  // Remove excessive whitespace
  text = text.replace(/\s+/g, ' ');
  
  return text;
}

// Validate message content
function validateMessage(content, maxLength = 1000) {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Message content is required' };
  }
  
  const sanitized = sanitizeInput(content);
  
  if (sanitized.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  
  if (sanitized.length > maxLength) {
    return { 
      valid: false, 
      error: `Message is too long. Maximum length is ${maxLength} characters.` 
    };
  }
  
  // Check for potential SQL injection patterns (basic check)
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /('|(\\')|(;)|(\\)|(\/\*)|(\*\/)|(--))/i
  ];
  
  // Only flag if multiple patterns match (to avoid false positives)
  const suspiciousPatterns = sqlPatterns.filter(pattern => pattern.test(sanitized));
  if (suspiciousPatterns.length > 1) {
    return { valid: false, error: 'Invalid characters detected in message' };
  }
  
  return { valid: true, content: sanitized };
}

// Validate conversation ID
function validateConversationId(conversationId) {
  if (!conversationId) {
    return { valid: false, error: 'Conversation ID is required' };
  }
  
  // UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(conversationId)) {
    return { valid: false, error: 'Invalid conversation ID format' };
  }
  
  return { valid: true, conversationId };
}

// Middleware to validate message input
const validateMessageInput = (req, res, next) => {
  const { content } = req.body;
  const maxLength = parseInt(process.env.AI_MAX_RESPONSE_LENGTH) || 1000;
  
  const validation = validateMessage(content, maxLength);
  
  if (!validation.valid) {
    return res.status(400).json({ 
      message: validation.error,
      field: 'content'
    });
  }
  
  // Replace with sanitized content
  req.body.content = validation.content;
  next();
};

// Middleware to validate conversation ID
const validateConversationIdParam = (req, res, next) => {
  const { conversation_id } = req.params;
  
  const validation = validateConversationId(conversation_id);
  
  if (!validation.valid) {
    return res.status(400).json({ 
      message: validation.error,
      field: 'conversation_id'
    });
  }
  
  next();
};

module.exports = {
  sanitizeInput,
  validateMessage,
  validateConversationId,
  validateMessageInput,
  validateConversationIdParam
};

