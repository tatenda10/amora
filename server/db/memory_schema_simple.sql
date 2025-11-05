-- Companion Memory and Emotional Intelligence Schema (Simplified)
-- This schema enables companions to remember important information and track emotional states

-- Companion memories table
CREATE TABLE IF NOT EXISTS companion_memories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  companion_id INT NOT NULL,
  user_id INT NOT NULL,
  memory_type ENUM('fact', 'preference', 'experience', 'emotion', 'goal', 'fear', 'dream') NOT NULL,
  content TEXT NOT NULL,
  importance_score INT DEFAULT 5 CHECK (importance_score BETWEEN 1 AND 10),
  emotional_context JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  access_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_companion_user (companion_id, user_id),
  INDEX idx_memory_type (memory_type),
  INDEX idx_importance (importance_score),
  INDEX idx_last_accessed (last_accessed)
);

-- User emotional states tracking
CREATE TABLE IF NOT EXISTS user_emotional_states (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  companion_id INT NOT NULL,
  conversation_id INT,
  emotional_state ENUM('happy', 'sad', 'excited', 'anxious', 'calm', 'frustrated', 'curious', 'lonely', 'confident', 'worried') NOT NULL,
  intensity_score INT DEFAULT 5 CHECK (intensity_score BETWEEN 1 AND 10),
  context TEXT,
  detected_from_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_companion (user_id, companion_id),
  INDEX idx_emotional_state (emotional_state),
  INDEX idx_created_at (created_at)
);

-- Relationship progression tracking
CREATE TABLE IF NOT EXISTS relationship_progression (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  companion_id INT NOT NULL,
  relationship_stage ENUM('stranger', 'acquaintance', 'friend', 'close_friend', 'intimate', 'partner') DEFAULT 'stranger',
  intimacy_level INT DEFAULT 1 CHECK (intimacy_level BETWEEN 1 AND 10),
  trust_level INT DEFAULT 1 CHECK (trust_level BETWEEN 1 AND 10),
  shared_experiences_count INT DEFAULT 0,
  last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_interaction_time INT DEFAULT 0,
  conversation_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_relationship (user_id, companion_id),
  INDEX idx_relationship_stage (relationship_stage),
  INDEX idx_intimacy_level (intimacy_level)
);

-- Conversation context tracking
CREATE TABLE IF NOT EXISTS conversation_contexts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  context_type ENUM('topic', 'mood', 'goal', 'memory_trigger', 'relationship_moment') NOT NULL,
  context_data JSON NOT NULL,
  importance_score INT DEFAULT 5 CHECK (importance_score BETWEEN 1 AND 10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_conversation_context (conversation_id, context_type),
  INDEX idx_importance (importance_score)
);

-- Companion personality evolution
CREATE TABLE IF NOT EXISTS companion_personality_evolution (
  id INT AUTO_INCREMENT PRIMARY KEY,
  companion_id INT NOT NULL,
  user_id INT NOT NULL,
  personality_trait VARCHAR(100) NOT NULL,
  trait_value TEXT NOT NULL,
  evolution_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_companion_user_trait (companion_id, user_id, personality_trait)
);

-- Proactive engagement tracking
CREATE TABLE IF NOT EXISTS proactive_engagements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  companion_id INT NOT NULL,
  user_id INT NOT NULL,
  engagement_type ENUM('check_in', 'memory_reminder', 'topic_suggestion', 'emotional_support', 'shared_interest') NOT NULL,
  engagement_content TEXT NOT NULL,
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP NULL,
  user_response TEXT NULL,
  engagement_status ENUM('scheduled', 'sent', 'responded', 'ignored') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_companion_user (companion_id, user_id),
  INDEX idx_engagement_type (engagement_type),
  INDEX idx_scheduled_for (scheduled_for),
  INDEX idx_status (engagement_status)
);

-- Daily interaction summaries
CREATE TABLE IF NOT EXISTS daily_interaction_summaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  companion_id INT NOT NULL,
  interaction_date DATE NOT NULL,
  message_count INT DEFAULT 0,
  conversation_topics JSON,
  emotional_journey JSON,
  relationship_moments JSON,
  summary_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_daily_summary (user_id, companion_id, interaction_date),
  INDEX idx_interaction_date (interaction_date)
);
