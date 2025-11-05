-- Quick database fixes for AI Companion System
-- Run these commands in your MySQL client

USE amora;

-- Fix emotional_state column
ALTER TABLE user_emotional_states DROP INDEX emotional_state;
ALTER TABLE user_emotional_states MODIFY COLUMN emotional_state TEXT;
ALTER TABLE user_emotional_states ADD INDEX idx_emotional_state (emotional_state(50));

-- Create conversation_topics table if it doesn't exist
CREATE TABLE IF NOT EXISTS conversation_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    topic_name VARCHAR(100) NOT NULL,
    topic_category VARCHAR(50) DEFAULT 'other',
    sentiment VARCHAR(20) DEFAULT 'neutral',
    context_summary TEXT,
    mention_count INT DEFAULT 1,
    last_mentioned TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_topic_name (topic_name),
    INDEX idx_last_mentioned (last_mentioned)
);

-- Verify the changes
DESCRIBE user_emotional_states;
DESCRIBE conversation_topics;
