-- STEP-BY-STEP DATABASE FIX FOR AI COMPANION
-- Run these commands ONE BY ONE in your MySQL client

USE amora;

-- Step 1: Check what indexes exist on the table
SHOW INDEX FROM user_emotional_states;

-- Step 2: Drop ALL indexes that reference emotional_state column
-- (The index name might be different, check the output from Step 1)
ALTER TABLE user_emotional_states DROP INDEX emotional_state;

-- If the above fails, try these alternative index names:
-- ALTER TABLE user_emotional_states DROP INDEX idx_emotional_state;
-- ALTER TABLE user_emotional_states DROP INDEX emotional_state_2;

-- Step 3: Now modify the column from ENUM to TEXT
ALTER TABLE user_emotional_states MODIFY COLUMN emotional_state TEXT;

-- Step 4: Add a new index with key length (required for TEXT columns)
ALTER TABLE user_emotional_states ADD INDEX idx_emotional_state (emotional_state(50));

-- Step 5: Create conversation_topics table if it doesn't exist
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

-- Step 6: Verify the changes
DESCRIBE user_emotional_states;
DESCRIBE conversation_topics;
