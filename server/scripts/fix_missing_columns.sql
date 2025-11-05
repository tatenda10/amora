-- Fix missing columns in existing tables

-- Add emoji_suggestions column to user_emotional_states table
ALTER TABLE user_emotional_states 
ADD COLUMN emoji_suggestions TEXT DEFAULT NULL 
COMMENT 'JSON array of suggested emojis for the emotional state';

-- Fix emotional_state column (ENUM to TEXT with index handling)
-- Step 1: Drop the existing index on emotional_state
ALTER TABLE user_emotional_states DROP INDEX emotional_state;

-- Step 2: Modify the column from ENUM to TEXT
ALTER TABLE user_emotional_states 
MODIFY COLUMN emotional_state TEXT;

-- Step 3: Add a new index on emotional_state (with key length for TEXT)
ALTER TABLE user_emotional_states 
ADD INDEX idx_emotional_state (emotional_state(50));

-- Create conversation_topics table
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

-- Add missing columns to user_communication_styles table
ALTER TABLE user_communication_styles 
ADD COLUMN average_response_time INT DEFAULT 0 
COMMENT 'Average response time in seconds';

ALTER TABLE user_communication_styles 
ADD COLUMN sample_count INT DEFAULT 0 
COMMENT 'Number of messages analyzed for this style';

ALTER TABLE user_communication_styles 
ADD COLUMN learning_confidence DECIMAL(3,2) DEFAULT 0.5 
COMMENT 'Confidence level in learned style (0.0-1.0)';

ALTER TABLE user_communication_styles 
ADD COLUMN last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
COMMENT 'When the style was last updated';

-- Verify the columns were updated
DESCRIBE user_emotional_states;
DESCRIBE conversation_topics;
SHOW INDEX FROM user_emotional_states;
