-- Enhanced Features Schema for AI Companion
-- This adds advanced context awareness and natural language patterns

-- Topic threading table to track what topics were discussed and when
CREATE TABLE IF NOT EXISTS conversation_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    topic_name VARCHAR(255) NOT NULL,
    topic_category ENUM('entertainment', 'personal', 'work', 'hobbies', 'food', 'travel', 'relationships', 'other') NOT NULL,
    first_mentioned TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_mentioned TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    mention_count INT DEFAULT 1,
    sentiment ENUM('positive', 'negative', 'neutral') DEFAULT 'neutral',
    context_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_topic_name (topic_name),
    INDEX idx_last_mentioned (last_mentioned),
    INDEX idx_topic_category (topic_category),
    UNIQUE KEY unique_conversation_topic (conversation_id, topic_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User communication style learning table
CREATE TABLE IF NOT EXISTS user_communication_styles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    companion_id INT NOT NULL,
    formality_level ENUM('very_formal', 'formal', 'casual', 'very_casual') DEFAULT 'casual',
    humor_preference ENUM('none', 'light', 'moderate', 'heavy', 'sarcastic') DEFAULT 'light',
    response_length_preference ENUM('short', 'medium', 'long') DEFAULT 'medium',
    question_frequency ENUM('low', 'medium', 'high') DEFAULT 'medium',
    emoji_usage ENUM('none', 'light', 'heavy') DEFAULT 'light',
    punctuation_style ENUM('minimal', 'standard', 'heavy') DEFAULT 'standard',
    topic_change_style ENUM('abrupt', 'gradual', 'smooth') DEFAULT 'gradual',
    emotional_expression ENUM('reserved', 'moderate', 'expressive') DEFAULT 'moderate',
    learning_confidence DECIMAL(3,2) DEFAULT 0.50, -- 0.00 to 1.00
    sample_count INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (companion_id) REFERENCES companions(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_companion_id (companion_id),
    INDEX idx_last_updated (last_updated),
    UNIQUE KEY unique_user_companion_style (user_id, companion_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cultural context adaptation table
CREATE TABLE IF NOT EXISTS user_cultural_context (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    language VARCHAR(10) DEFAULT 'en',
    cultural_norms JSON, -- {communication_style, humor_style, formality_preferences, etc}
    timezone VARCHAR(50),
    cultural_adaptation_level ENUM('minimal', 'moderate', 'high') DEFAULT 'moderate',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_country (country),
    INDEX idx_language (language),
    UNIQUE KEY unique_user_cultural (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enhanced conversation flow tracking
CREATE TABLE IF NOT EXISTS conversation_flow_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    companion_id INT NOT NULL,
    flow_score DECIMAL(3,2) DEFAULT 0.50, -- 0.00 to 1.00
    topic_transitions_count INT DEFAULT 0,
    interruption_count INT DEFAULT 0,
    natural_transition_count INT DEFAULT 0,
    conversation_death_points INT DEFAULT 0,
    recovery_success_count INT DEFAULT 0,
    last_flow_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (companion_id) REFERENCES companions(id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_user_id (user_id),
    INDEX idx_companion_id (companion_id),
    INDEX idx_flow_score (flow_score),
    UNIQUE KEY unique_conversation_flow (conversation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Topic transition patterns for natural handling
CREATE TABLE IF NOT EXISTS topic_transitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    from_topic VARCHAR(255),
    to_topic VARCHAR(255) NOT NULL,
    transition_type ENUM('natural', 'interruption', 'gradual', 'abrupt') NOT NULL,
    transition_quality ENUM('poor', 'fair', 'good', 'excellent') DEFAULT 'fair',
    transition_context TEXT,
    user_response_sentiment ENUM('positive', 'negative', 'neutral') DEFAULT 'neutral',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_transition_type (transition_type),
    INDEX idx_transition_quality (transition_quality),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enhanced user preferences learning
CREATE TABLE IF NOT EXISTS user_preference_learning (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    companion_id INT NOT NULL,
    preference_type ENUM('topic', 'style', 'humor', 'response_length', 'engagement_level') NOT NULL,
    preference_value VARCHAR(255) NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.50,
    evidence_count INT DEFAULT 1,
    last_evidence TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (companion_id) REFERENCES companions(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_companion_id (companion_id),
    INDEX idx_preference_type (preference_type),
    INDEX idx_confidence_score (confidence_score),
    INDEX idx_last_evidence (last_evidence),
    UNIQUE KEY unique_user_preference (user_id, companion_id, preference_type, preference_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
