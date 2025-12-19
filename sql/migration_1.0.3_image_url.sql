-- SWS Report System Migration: v1.0.3
-- Adds image_url support for screenshots in chat messages
-- Run this if you're upgrading from v1.0.2 or earlier

ALTER TABLE `report_messages`
ADD COLUMN `image_url` VARCHAR(512) DEFAULT NULL
AFTER `message`;
