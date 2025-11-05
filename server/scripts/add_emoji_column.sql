-- Add emoji_suggestions column to user_emotional_states table
ALTER TABLE user_emotional_states 
ADD COLUMN emoji_suggestions TEXT DEFAULT NULL 
COMMENT 'JSON array of suggested emojis for the emotional state';

-- Verify the column was added
DESCRIBE user_emotional_states;
