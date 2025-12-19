-- SWS Report System Migration: v1.0.4
-- Adds player_identifiers table for storing all player identifiers
-- Run this if you're upgrading from v1.0.3 or earlier

CREATE TABLE IF NOT EXISTS `player_identifiers` (
    `player_id` VARCHAR(60) NOT NULL PRIMARY KEY,
    `license` VARCHAR(60) DEFAULT NULL,
    `steam` VARCHAR(60) DEFAULT NULL,
    `discord` VARCHAR(60) DEFAULT NULL,
    `fivem` VARCHAR(60) DEFAULT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
