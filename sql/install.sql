-- SWS Report System Database Schema
-- Run this SQL to set up the required tables

CREATE TABLE IF NOT EXISTS `reports` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `player_id` VARCHAR(60) NOT NULL,
    `player_name` VARCHAR(64) NOT NULL,
    `subject` VARCHAR(128) NOT NULL,
    `category` VARCHAR(32) NOT NULL,
    `description` TEXT,
    `status` ENUM('open', 'claimed', 'resolved') DEFAULT 'open',
    `claimed_by` VARCHAR(60) DEFAULT NULL,
    `claimed_by_name` VARCHAR(64) DEFAULT NULL,
    `priority` TINYINT DEFAULT 0,
    `player_coords` VARCHAR(128),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `resolved_at` TIMESTAMP NULL,
    INDEX `idx_player_id` (`player_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `report_messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `report_id` INT NOT NULL,
    `sender_id` VARCHAR(60) NOT NULL,
    `sender_name` VARCHAR(64) NOT NULL,
    `sender_type` ENUM('player', 'admin', 'system') NOT NULL,
    `message` TEXT NOT NULL,
    `image_url` VARCHAR(512) DEFAULT NULL,
    `message_type` ENUM('text', 'voice') DEFAULT 'text',
    `audio_url` VARCHAR(512) DEFAULT NULL,
    `audio_duration` INT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE CASCADE,
    INDEX `idx_report_id` (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin notes for specific reports (internal, player cannot see)
CREATE TABLE IF NOT EXISTS `report_notes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `report_id` INT NOT NULL,
    `admin_id` VARCHAR(60) NOT NULL,
    `admin_name` VARCHAR(64) NOT NULL,
    `note` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE CASCADE,
    INDEX `idx_report_id` (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin notes for players (persistent across all reports)
CREATE TABLE IF NOT EXISTS `player_notes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `player_id` VARCHAR(60) NOT NULL,
    `admin_id` VARCHAR(60) NOT NULL,
    `admin_name` VARCHAR(64) NOT NULL,
    `note` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_player_id` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Player identifiers cache (for admin lookup even when player is offline)
CREATE TABLE IF NOT EXISTS `player_identifiers` (
    `player_id` VARCHAR(60) NOT NULL PRIMARY KEY,
    `license` VARCHAR(60) DEFAULT NULL,
    `steam` VARCHAR(60) DEFAULT NULL,
    `discord` VARCHAR(60) DEFAULT NULL,
    `fivem` VARCHAR(60) DEFAULT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inventory changes made by staff from a report (inventory management)
CREATE TABLE IF NOT EXISTS `inventory_changes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `admin_id` VARCHAR(60) NOT NULL COMMENT 'Admin identifier who performed the action',
    `admin_name` VARCHAR(64) NOT NULL COMMENT 'Admin display name',
    `player_id` VARCHAR(60) NOT NULL COMMENT 'Target player identifier',
    `player_name` VARCHAR(64) NOT NULL COMMENT 'Target player display name',
    `report_id` INT NOT NULL COMMENT 'Associated report ID',
    `action` ENUM('add', 'remove', 'set', 'metadata_edit') NOT NULL COMMENT 'Type of inventory action',
    `item_name` VARCHAR(64) NOT NULL COMMENT 'Item internal name/ID',
    `item_label` VARCHAR(128) NOT NULL COMMENT 'Item display label',
    `count_before` INT NOT NULL DEFAULT 0 COMMENT 'Item count before action',
    `count_after` INT NOT NULL DEFAULT 0 COMMENT 'Item count after action',
    `metadata_before` JSON DEFAULT NULL COMMENT 'Item metadata before action (JSON)',
    `metadata_after` JSON DEFAULT NULL COMMENT 'Item metadata after action (JSON)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Action timestamp',

    INDEX `idx_inventory_changes_admin_id` (`admin_id`),
    INDEX `idx_inventory_changes_player_id` (`player_id`),
    INDEX `idx_inventory_changes_report_id` (`report_id`),
    INDEX `idx_inventory_changes_created_at` (`created_at`),
    INDEX `idx_inventory_changes_action` (`action`),

    CONSTRAINT `fk_inventory_changes_report`
        FOREIGN KEY (`report_id`)
        REFERENCES `reports`(`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
