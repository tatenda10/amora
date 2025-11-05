-- Notification system tables
-- Run this SQL to create the necessary tables

-- User push tokens table
CREATE TABLE IF NOT EXISTS user_push_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(36) NOT NULL,
  token VARCHAR(500) NOT NULL,
  platform ENUM('ios', 'android', 'web') NOT NULL,
  device_id VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_token (user_id, token)
);

-- User notification settings table
CREATE TABLE IF NOT EXISTS user_notification_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(36) NOT NULL,
  messages BOOLEAN DEFAULT TRUE,
  matches BOOLEAN DEFAULT TRUE,
  system BOOLEAN DEFAULT TRUE,
  marketing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_settings (user_id)
);

-- Notification history table (optional, for tracking)
CREATE TABLE IF NOT EXISTS notification_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(36) NOT NULL,
  notification_type ENUM('message', 'match', 'system', 'marketing') NOT NULL,
  title VARCHAR(255),
  body TEXT,
  data JSON,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_type (user_id, notification_type),
  INDEX idx_sent_at (sent_at)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON user_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON user_push_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user ON user_notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_user ON notification_history(user_id);
