-- SWS Report System - Voice Message Migration
-- Run this SQL to add voice message support to existing installations

ALTER TABLE `report_messages`
    ADD COLUMN `message_type` ENUM('text', 'voice') DEFAULT 'text' AFTER `message`,
    ADD COLUMN `audio_url` VARCHAR(512) DEFAULT NULL AFTER `message_type`,
    ADD COLUMN `audio_duration` INT DEFAULT NULL AFTER `audio_url`;
