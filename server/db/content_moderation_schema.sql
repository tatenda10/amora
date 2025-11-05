-- Content Moderation Logs Table
CREATE TABLE IF NOT EXISTS content_moderation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    conversation_id INT NOT NULL,
    original_message TEXT NOT NULL,
    content_category ENUM('normal', 'romantic', 'profanity', 'hate_speech', 'self_harm', 'inappropriate') NOT NULL,
    severity_level ENUM('green', 'yellow', 'red', 'black') NOT NULL,
    response_strategy ENUM('normal', 'romantic_acceptance', 'romantic_openness', 'cautious_openness', 'polite_decline', 'gentle_boundary', 'friend_support', 'boundary_setting', 'emergency_support') NOT NULL,
    flags JSON,
    ai_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_content_category (content_category),
    INDEX idx_severity_level (severity_level),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
