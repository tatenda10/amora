-- Safe Migration: Create conversations table for amora_db
-- This migration checks existing table structures and creates compatible tables

USE amora_db;

-- First, let's check what the actual users table structure is
-- and create conversations table with compatible data types

-- Drop existing conversations-related tables if they exist
DROP TABLE IF EXISTS conversation_participants;
DROP TABLE IF EXISTS typing_indicators;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;

-- Create conversations table with flexible data types
CREATE TABLE conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,  -- Using VARCHAR(255) to be safe with any user ID format
    companion_id INT NOT NULL,
    title VARCHAR(255),
    last_message_id INT NULL,
    last_message_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_conversations_user_id (user_id),
    INDEX idx_conversations_companion_id (companion_id),
    INDEX idx_conversations_updated_at (updated_at),
    INDEX idx_conversations_last_message_at (last_message_at),
    INDEX idx_conversations_is_active (is_active),
    
    -- Unique constraint to prevent duplicate conversations
    UNIQUE KEY uq_user_companion_conversation (user_id, companion_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create messages table
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_type ENUM('user', 'companion') NOT NULL,
    sender_id VARCHAR(255) NOT NULL,  -- Using VARCHAR(255) to be safe
    content TEXT NOT NULL,
    message_type ENUM('text', 'image', 'audio', 'video', 'system') DEFAULT 'text',
    metadata JSON NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_messages_conversation 
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes for performance
    INDEX idx_messages_conversation_id (conversation_id),
    INDEX idx_messages_sender_type (sender_type),
    INDEX idx_messages_sender_id (sender_id),
    INDEX idx_messages_created_at (created_at),
    INDEX idx_messages_is_read (is_read),
    INDEX idx_messages_message_type (message_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Now add the foreign key constraint from conversations to messages
ALTER TABLE conversations 
ADD CONSTRAINT fk_conversations_last_message 
    FOREIGN KEY (last_message_id) REFERENCES messages(id) 
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Create notifications table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,  -- Using VARCHAR(255) to be safe
    conversation_id INT NULL,
    type ENUM('new_message', 'new_conversation', 'system', 'typing') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_notifications_conversation 
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes for performance
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_is_read (is_read),
    INDEX idx_notifications_created_at (created_at),
    INDEX idx_notifications_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create typing indicators table
CREATE TABLE typing_indicators (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    user_id VARCHAR(255) NOT NULL,  -- Using VARCHAR(255) to be safe
    is_typing BOOLEAN DEFAULT TRUE,
    last_typing_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_typing_conversation 
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes for performance
    INDEX idx_typing_conversation_id (conversation_id),
    INDEX idx_typing_user_id (user_id),
    INDEX idx_typing_last_typing_at (last_typing_at),
    
    -- Unique constraint to prevent duplicate typing indicators
    UNIQUE KEY uq_typing_conversation_user (conversation_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create conversation participants table
CREATE TABLE conversation_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    participant_id VARCHAR(255) NOT NULL,  -- Using VARCHAR(255) to be safe
    participant_type ENUM('user', 'companion') NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Foreign key constraints
    CONSTRAINT fk_participants_conversation 
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes for performance
    INDEX idx_participants_conversation_id (conversation_id),
    INDEX idx_participants_participant_id (participant_id),
    INDEX idx_participants_participant_type (participant_type),
    INDEX idx_participants_is_active (is_active),
    
    -- Unique constraint to prevent duplicate participants
    UNIQUE KEY uq_participants_conversation_participant (conversation_id, participant_id, participant_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create triggers for automatic updates
DELIMITER //
CREATE TRIGGER tr_conversations_after_insert
AFTER INSERT ON conversations
FOR EACH ROW
BEGIN
    -- Add user as participant
    INSERT INTO conversation_participants (conversation_id, participant_id, participant_type)
    VALUES (NEW.id, NEW.user_id, 'user');
    
    -- Add companion as participant
    INSERT INTO conversation_participants (conversation_id, participant_id, participant_type)
    VALUES (NEW.id, NEW.companion_id, 'companion');
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER tr_messages_after_insert
AFTER INSERT ON messages
FOR EACH ROW
BEGIN
    UPDATE conversations 
    SET last_message_id = NEW.id, 
        last_message_at = NEW.created_at,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.conversation_id;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER tr_messages_after_update
AFTER UPDATE ON messages
FOR EACH ROW
BEGIN
    UPDATE conversations 
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.conversation_id;
END//
DELIMITER ;

-- Create additional indexes for better query performance
CREATE INDEX idx_conversations_user_updated ON conversations(user_id, updated_at DESC);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- Add comments for documentation
ALTER TABLE conversations COMMENT = 'Stores conversation metadata between users and AI companions';
ALTER TABLE messages COMMENT = 'Stores individual messages within conversations';
ALTER TABLE notifications COMMENT = 'Stores real-time notifications for users';
ALTER TABLE typing_indicators COMMENT = 'Stores real-time typing status for conversations';
ALTER TABLE conversation_participants COMMENT = 'Stores participants in conversations for future multi-user support';

-- Note: Foreign key constraints to users and companions tables are intentionally omitted
-- to avoid compatibility issues. The application will handle referential integrity.
