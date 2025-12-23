-- Migration: Inventory Changes Tracking
-- Version: 1.0.6
-- Description: Adds inventory_changes table for tracking admin inventory modifications

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
