-- =====================================================
-- COMPREHENSIVE DATABASE SCHEMA FOR AI COMPANION SYSTEM
-- =====================================================

-- Fix missing columns in existing tables
ALTER TABLE user_emotional_states 
ADD COLUMN emoji_suggestions TEXT DEFAULT NULL 
COMMENT 'JSON array of suggested emojis for the emotional state';

-- =====================================================
-- CREATE MISSING TABLES
-- =====================================================

-- User Language Preferences
CREATE TABLE IF NOT EXISTS user_language_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_language (user_id),
    INDEX idx_user_id (user_id)
);

-- Conversation Topics
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

-- User Communication Styles
CREATE TABLE IF NOT EXISTS user_communication_styles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    companion_id INT NOT NULL,
    formality_level VARCHAR(20) DEFAULT 'casual',
    humor_preference VARCHAR(20) DEFAULT 'friendly',
    emoji_usage VARCHAR(20) DEFAULT 'light',
    emotional_expression VARCHAR(20) DEFAULT 'moderate',
    response_length VARCHAR(20) DEFAULT 'medium',
    communication_patterns JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_companion (user_id, companion_id),
    INDEX idx_user_id (user_id),
    INDEX idx_companion_id (companion_id)
);

-- User Cultural Context
CREATE TABLE IF NOT EXISTS user_cultural_context (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    country VARCHAR(50) DEFAULT 'US',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    cultural_norms JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_cultural (user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_country (country)
);

-- Topic Transitions
CREATE TABLE IF NOT EXISTS topic_transitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    from_topic VARCHAR(100),
    to_topic VARCHAR(100) NOT NULL,
    transition_type VARCHAR(50) DEFAULT 'natural',
    user_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_created_at (created_at)
);

-- Content Moderation Logs
CREATE TABLE IF NOT EXISTS moderation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    conversation_id INT,
    original_message TEXT NOT NULL,
    analysis_category VARCHAR(50) NOT NULL,
    severity_level INT DEFAULT 1,
    response_strategy VARCHAR(50),
    suggested_response TEXT,
    flags JSON,
    detected_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_category (analysis_category),
    INDEX idx_created_at (created_at)
);

-- Conversation Patterns (RAG)
CREATE TABLE IF NOT EXISTS conversation_patterns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    context VARCHAR(100),
    emotion VARCHAR(50),
    dataset_source VARCHAR(50),
    confidence_score DECIMAL(3,2) DEFAULT 0.50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_context (context),
    INDEX idx_emotion (emotion),
    INDEX idx_dataset_source (dataset_source),
    INDEX idx_confidence_score (confidence_score)
);

-- Companion Memories
CREATE TABLE IF NOT EXISTS companion_memories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    companion_id INT NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    memory_type VARCHAR(50) DEFAULT 'conversation',
    content TEXT NOT NULL,
    emotional_context VARCHAR(50),
    importance_score DECIMAL(3,2) DEFAULT 0.50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_companion_id (companion_id),
    INDEX idx_user_id (user_id),
    INDEX idx_memory_type (memory_type),
    INDEX idx_created_at (created_at)
);

-- Conversation Contexts
CREATE TABLE IF NOT EXISTS conversation_contexts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    user_message TEXT,
    ai_response TEXT,
    emotional_state VARCHAR(50),
    context_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_created_at (created_at)
);

-- Proactive Engagements
CREATE TABLE IF NOT EXISTS proactive_engagements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    companion_id INT NOT NULL,
    engagement_type VARCHAR(50) NOT NULL,
    message_content TEXT NOT NULL,
    trigger_reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_companion_id (companion_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_for (scheduled_for)
);

-- =====================================================
-- VERIFY TABLES EXIST
-- =====================================================

-- Show all tables
SHOW TABLES;

-- Verify key tables have correct structure
DESCRIBE user_emotional_states;
DESCRIBE user_language_preferences;
DESCRIBE conversation_topics;
DESCRIBE user_communication_styles;
DESCRIBE user_cultural_context;
DESCRIBE topic_transitions;
DESCRIBE moderation_logs;
DESCRIBE conversation_patterns;
DESCRIBE companion_memories;
DESCRIBE conversation_contexts;
DESCRIBE proactive_engagements;
