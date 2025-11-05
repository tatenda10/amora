-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS amora_db;
USE amora_db;

-- Create companions table
CREATE TABLE IF NOT EXISTS companions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INT,
    gender ENUM('Male', 'Female', 'Non-binary', 'Other') NOT NULL,
    country VARCHAR(100),
    ethnicity VARCHAR(100),
    personality TEXT NOT NULL,
    traits JSON NOT NULL,
    interests JSON NOT NULL,
    backstory TEXT,
    conversation_style TEXT,
    profile_image_url VARCHAR(255),
    gallery_images JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create users table for mobile app authentication
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    profile_image_url VARCHAR(255),
    role ENUM('user', 'premium') NOT NULL DEFAULT 'user',
    auth_provider ENUM('email', 'google', 'apple') DEFAULT 'email',
    profile_completed BOOLEAN NOT NULL DEFAULT false,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_auth_provider (auth_provider)
);

-- User profiles (extended attributes captured during onboarding)
CREATE TABLE IF NOT EXISTS user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    country VARCHAR(100) NULL,
    sex ENUM('male','female','non_binary','prefer_not_to_say') NULL,
    age TINYINT UNSIGNED NULL,
    interests JSON NULL,                   -- array of interest strings
    looking_for JSON NULL,                 -- { partner_gender, partner_age_min, partner_age_max, partner_country }
    preferences JSON NULL,                 -- { ethnicity, hair_color, eye_color, personality_traits, etc }
    attributes JSON NULL,                  -- extra arbitrary metrics
    selections JSON NULL,                  -- selected options (e.g., preferred companion traits)
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_profiles_user (user_id),
    CONSTRAINT fk_user_profiles_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE ON UPDATE CASCADE
);

-- Mapping table for users and selected companions (history of selections)
CREATE TABLE IF NOT EXISTS user_companion_selections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    companion_id INT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_companion_once (user_id, companion_id),
    CONSTRAINT fk_ucs_user FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ucs_companion FOREIGN KEY (companion_id) REFERENCES companions(id)
      ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create system_users table for admin authentication
CREATE TABLE IF NOT EXISTS system_users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'moderator') NOT NULL DEFAULT 'moderator',
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
); 