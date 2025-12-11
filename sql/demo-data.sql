-- SWS Report System - Demo Data for Preview Video
-- Run this SQL to populate the database with realistic test data

-- Clear existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM report_messages;
-- DELETE FROM report_notes;
-- DELETE FROM player_notes;
-- DELETE FROM reports;

-- ============================================
-- DEMO REPORTS
-- ============================================

-- Open Reports (waiting for admin)
INSERT INTO `reports` (`player_id`, `player_name`, `subject`, `category`, `description`, `status`, `priority`, `player_coords`, `created_at`) VALUES
('steam:110000112345678', 'Max_Mueller', 'Vehicle stuck in ground', 'bug', 'My car fell through the map near the airport. I was driving and suddenly it just dropped. Can someone help me get it back?', 'open', 1, '{"x":-1037.2,"y":-2964.5,"z":13.9}', NOW() - INTERVAL 5 MINUTE),
('steam:110000187654321', 'Julia_Schmidt', 'Question about job system', 'question', 'How do I become a police officer? I talked to the NPC but nothing happened. Do I need to apply somewhere?', 'open', 0, '{"x":428.5,"y":-981.2,"z":30.7}', NOW() - INTERVAL 12 MINUTE),
('steam:110000198765432', 'Tom_Weber', 'Player RDM at Legion Square', 'player', 'Player "xXDarkKillerXx" shot me without any RP reason at Legion Square. I was just standing there talking to my friend. This is the third time today!', 'open', 3, '{"x":195.3,"y":-934.1,"z":30.7}', NOW() - INTERVAL 3 MINUTE),
('steam:110000111222333', 'Sarah_Fischer', 'Money disappeared', 'bug', 'I had 50,000$ and after relogging only 12,000$ are left. I didnt buy anything or transfer money. Please check the logs!', 'open', 2, '{"x":-269.4,"y":-955.3,"z":31.2}', NOW() - INTERVAL 8 MINUTE),
('steam:110000144455566', 'Kevin_Braun', 'General feedback', 'general', 'Just wanted to say the server is amazing! Love the new update. Keep up the great work team!', 'open', 0, '{"x":126.9,"y":-1023.4,"z":29.3}', NOW() - INTERVAL 25 MINUTE);

-- Claimed Reports (admin working on them)
INSERT INTO `reports` (`player_id`, `player_name`, `subject`, `category`, `description`, `status`, `claimed_by`, `claimed_by_name`, `priority`, `player_coords`, `created_at`) VALUES
('steam:110000155566677', 'Lisa_Hoffmann', 'Cant access my apartment', 'bug', 'The door to my apartment doesnt work anymore. It says "locked" but its my apartment. I checked the keys and everything looks fine.', 'claimed', 'steam:110000100000001', 'Admin_Mike', 2, '{"x":-774.3,"y":312.1,"z":85.7}', NOW() - INTERVAL 18 MINUTE),
('steam:110000166677788', 'Felix_Schneider', 'VDM Report - ID 156', 'player', 'Player with ID 156 ran me over intentionally multiple times at the car dealership. I have video evidence if needed. His name was something like "FastDriver99".', 'claimed', 'steam:110000100000002', 'Admin_Sarah', 3, '{"x":-56.8,"y":-1097.2,"z":26.4}', NOW() - INTERVAL 15 MINUTE),
('steam:110000177788899', 'Anna_Koch', 'Job payout issue', 'bug', 'I completed 5 garbage truck routes but only got paid for 2. The other 3 routes showed "completed" but no money came through.', 'claimed', 'steam:110000100000001', 'Admin_Mike', 1, '{"x":-619.5,"y":-1640.3,"z":26.0}', NOW() - INTERVAL 22 MINUTE);

-- Resolved Reports (completed)
INSERT INTO `reports` (`player_id`, `player_name`, `subject`, `category`, `description`, `status`, `claimed_by`, `claimed_by_name`, `priority`, `player_coords`, `created_at`, `resolved_at`) VALUES
('steam:110000188899900', 'Paul_Becker', 'Teleported by hacker?', 'player', 'I was suddenly teleported to the top of Maze Bank. I think someone is using hacks. Very suspicious!', 'resolved', 'steam:110000100000002', 'Admin_Sarah', 2, '{"x":-75.2,"y":-818.9,"z":326.2}', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR),
('steam:110000199900011', 'Emma_Wagner', 'How to sell cars?', 'question', 'Where can I sell my personal vehicle? I bought the wrong one and want to get rid of it.', 'resolved', 'steam:110000100000001', 'Admin_Mike', 0, '{"x":-213.9,"y":-1323.5,"z":30.9}', NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 2 HOUR),
('steam:110000100011122', 'Lukas_Richter', 'Inventory bug after death', 'bug', 'Lost all my items after being revived by EMS. Had weapons, food, and other stuff worth about 30k.', 'resolved', 'steam:110000100000001', 'Admin_Mike', 2, '{"x":298.1,"y":-584.3,"z":43.3}', NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 4 HOUR),
('steam:110000111122233', 'Mia_Klein', 'Racist player in voice chat', 'player', 'Player "ToxicGamer" was being very racist and offensive in voice chat near the pier. Multiple people heard it. Please ban this person.', 'resolved', 'steam:110000100000002', 'Admin_Sarah', 3, '{"x":-1850.5,"y":-1231.2,"z":13.0}', NOW() - INTERVAL 6 HOUR, NOW() - INTERVAL 5 HOUR),
('steam:110000122233344', 'Noah_Wolf', 'Cant find my boat', 'question', 'I bought a boat yesterday but I dont know where to pick it up. The marina guy doesnt have it.', 'resolved', 'steam:110000100000001', 'Admin_Mike', 0, '{"x":-849.3,"y":-1368.7,"z":1.6}', NOW() - INTERVAL 8 HOUR, NOW() - INTERVAL 7 HOUR),
('steam:110000133344455', 'Lea_Schulz', 'Server crash compensation', 'other', 'I was in the middle of a big heist when the server crashed. Lost all my prep work and equipment. Is there any compensation?', 'resolved', 'steam:110000100000002', 'Admin_Sarah', 1, '{"x":2747.8,"y":3472.9,"z":55.7}', NOW() - INTERVAL 12 HOUR, NOW() - INTERVAL 10 HOUR);

-- ============================================
-- DEMO MESSAGES (Chat in reports)
-- ============================================

-- Get the report IDs (assuming they start from a certain number, adjust as needed)
SET @report1 = (SELECT id FROM reports WHERE player_name = 'Max_Mueller' ORDER BY id DESC LIMIT 1);
SET @report2 = (SELECT id FROM reports WHERE player_name = 'Tom_Weber' ORDER BY id DESC LIMIT 1);
SET @report3 = (SELECT id FROM reports WHERE player_name = 'Lisa_Hoffmann' ORDER BY id DESC LIMIT 1);
SET @report4 = (SELECT id FROM reports WHERE player_name = 'Felix_Schneider' ORDER BY id DESC LIMIT 1);
SET @report5 = (SELECT id FROM reports WHERE player_name = 'Paul_Becker' ORDER BY id DESC LIMIT 1);
SET @report6 = (SELECT id FROM reports WHERE player_name = 'Emma_Wagner' ORDER BY id DESC LIMIT 1);
SET @report7 = (SELECT id FROM reports WHERE player_name = 'Mia_Klein' ORDER BY id DESC LIMIT 1);

-- Messages for Lisa's apartment issue (claimed, active conversation)
INSERT INTO `report_messages` (`report_id`, `sender_id`, `sender_name`, `sender_type`, `message`, `created_at`) VALUES
(@report3, 'steam:110000155566677', 'Lisa_Hoffmann', 'player', 'Hello? Can someone help me please? Im stuck outside my apartment for 20 minutes now.', NOW() - INTERVAL 17 MINUTE),
(@report3, 'steam:110000100000001', 'Admin_Mike', 'admin', 'Hi Lisa, I just claimed your report. Let me check your apartment permissions in the database.', NOW() - INTERVAL 15 MINUTE),
(@report3, 'steam:110000155566677', 'Lisa_Hoffmann', 'player', 'Thank you! Its the apartment at Alta Street, number 4.', NOW() - INTERVAL 14 MINUTE),
(@report3, 'steam:110000100000001', 'Admin_Mike', 'admin', 'Found the issue - your apartment key seems to have reset after the last update. Im fixing it now.', NOW() - INTERVAL 10 MINUTE),
(@report3, 'system', 'System', 'system', 'Admin_Mike teleported to player', NOW() - INTERVAL 8 MINUTE),
(@report3, 'steam:110000100000001', 'Admin_Mike', 'admin', 'Try opening the door now.', NOW() - INTERVAL 7 MINUTE);

-- Messages for Felix VDM report (claimed, with evidence discussion)
INSERT INTO `report_messages` (`report_id`, `sender_id`, `sender_name`, `sender_type`, `message`, `created_at`) VALUES
(@report4, 'steam:110000166677788', 'Felix_Schneider', 'player', 'This guy keeps targeting me! Check the logs please.', NOW() - INTERVAL 14 MINUTE),
(@report4, 'steam:110000100000002', 'Admin_Sarah', 'admin', 'Hi Felix, Im reviewing the server logs now. Do you have any video evidence you could share?', NOW() - INTERVAL 12 MINUTE),
(@report4, 'steam:110000166677788', 'Felix_Schneider', 'player', 'Yes, I clipped it! Discord link: discord.gg/xxxxx - check the evidence channel', NOW() - INTERVAL 11 MINUTE),
(@report4, 'steam:110000100000002', 'Admin_Sarah', 'admin', 'Perfect, Ill review that. In the meantime, stay away from that area if possible.', NOW() - INTERVAL 9 MINUTE),
(@report4, 'system', 'System', 'system', 'Admin_Sarah started spectating player', NOW() - INTERVAL 5 MINUTE);

-- Messages for Paul's hacker report (resolved)
INSERT INTO `report_messages` (`report_id`, `sender_id`, `sender_name`, `sender_type`, `message`, `created_at`) VALUES
(@report5, 'steam:110000188899900', 'Paul_Becker', 'player', 'HELP! Im on top of maze bank and I didnt teleport myself here!', NOW() - INTERVAL 115 MINUTE),
(@report5, 'steam:110000100000002', 'Admin_Sarah', 'admin', 'Stay calm Paul. Im checking the logs to see what happened.', NOW() - INTERVAL 110 MINUTE),
(@report5, 'system', 'System', 'system', 'Admin_Sarah teleported to player', NOW() - INTERVAL 108 MINUTE),
(@report5, 'steam:110000100000002', 'Admin_Sarah', 'admin', 'I found the issue - it was actually a server-side bug with the elevator, not a hacker. Teleporting you down now.', NOW() - INTERVAL 105 MINUTE),
(@report5, 'system', 'System', 'system', 'Admin_Sarah brought player', NOW() - INTERVAL 104 MINUTE),
(@report5, 'steam:110000188899900', 'Paul_Becker', 'player', 'Oh thank god! I thought someone was messing with me. Thanks for the quick help!', NOW() - INTERVAL 100 MINUTE),
(@report5, 'steam:110000100000002', 'Admin_Sarah', 'admin', 'No problem! The devs are aware of the elevator bug. Closing this report now.', NOW() - INTERVAL 95 MINUTE);

-- Messages for Emma's car selling question (resolved, quick)
INSERT INTO `report_messages` (`report_id`, `sender_id`, `sender_name`, `sender_type`, `message`, `created_at`) VALUES
(@report6, 'steam:110000199900011', 'Emma_Wagner', 'player', 'Nvm I found it! Its at the car dealership where I bought it. Sorry!', NOW() - INTERVAL 170 MINUTE),
(@report6, 'steam:110000100000001', 'Admin_Mike', 'admin', 'No worries! Yes, you can sell vehicles at the same dealership. The sell option is in the menu. Let me know if you need anything else!', NOW() - INTERVAL 165 MINUTE);

-- Messages for Mia's racism report (resolved, serious)
INSERT INTO `report_messages` (`report_id`, `sender_id`, `sender_name`, `sender_type`, `message`, `created_at`) VALUES
(@report7, 'steam:110000111122233', 'Mia_Klein', 'player', 'This is completely unacceptable behavior. There were new players around too.', NOW() - INTERVAL 355 MINUTE),
(@report7, 'steam:110000100000002', 'Admin_Sarah', 'admin', 'I completely agree. This violates our server rules. Let me check the voice chat logs and player info.', NOW() - INTERVAL 350 MINUTE),
(@report7, 'steam:110000100000002', 'Admin_Sarah', 'admin', 'Found the player. They have previous warnings. Taking action now.', NOW() - INTERVAL 340 MINUTE),
(@report7, 'system', 'System', 'system', 'Admin_Sarah kicked player', NOW() - INTERVAL 338 MINUTE),
(@report7, 'steam:110000100000002', 'Admin_Sarah', 'admin', 'The player has been permanently banned. Thank you for reporting this - we have zero tolerance for racism. Sorry you had to experience that.', NOW() - INTERVAL 335 MINUTE),
(@report7, 'steam:110000111122233', 'Mia_Klein', 'player', 'Thank you for taking this seriously! Really appreciate the fast response.', NOW() - INTERVAL 330 MINUTE);

-- ============================================
-- DEMO ADMIN NOTES (Internal)
-- ============================================

INSERT INTO `report_notes` (`report_id`, `admin_id`, `admin_name`, `note`, `created_at`) VALUES
(@report3, 'steam:110000100000001', 'Admin_Mike', 'Apartment key reset confirmed in DB. Applied fix. Monitoring for similar issues.', NOW() - INTERVAL 9 MINUTE),
(@report4, 'steam:110000100000002', 'Admin_Sarah', 'Video evidence confirmed VDM. Player ID 156 = steam:110000199999999 "FastDriver99". Previous warning for similar behavior on 2024-11-15.', NOW() - INTERVAL 8 MINUTE),
(@report4, 'steam:110000100000002', 'Admin_Sarah', 'Issued 3-day temp ban. Next offense = permanent.', NOW() - INTERVAL 3 MINUTE),
(@report5, 'steam:110000100000002', 'Admin_Sarah', 'Elevator bug at Maze Bank confirmed. Forwarded to dev team. Ticket #DEV-2847', NOW() - INTERVAL 100 MINUTE),
(@report7, 'steam:110000100000002', 'Admin_Sarah', 'Permanent ban issued. Voice logs saved as evidence. Player had 2 previous warnings.', NOW() - INTERVAL 335 MINUTE);

-- ============================================
-- DEMO PLAYER NOTES (Persistent across reports)
-- ============================================

INSERT INTO `player_notes` (`player_id`, `admin_id`, `admin_name`, `note`, `created_at`) VALUES
('steam:110000198765432', 'steam:110000100000002', 'Admin_Sarah', 'Frequent reporter - always provides good evidence. Trustworthy player.', NOW() - INTERVAL 2 DAY),
('steam:110000166677788', 'steam:110000100000001', 'Admin_Mike', 'New player, joined last week. Has been targeted by griefers multiple times.', NOW() - INTERVAL 3 DAY),
('steam:110000155566677', 'steam:110000100000001', 'Admin_Mike', 'VIP donor - prioritize support requests.', NOW() - INTERVAL 1 WEEK),
('steam:110000111122233', 'steam:110000100000002', 'Admin_Sarah', 'Active community member. Helps new players regularly.', NOW() - INTERVAL 5 DAY);

-- ============================================
-- Done! Your demo data is ready.
-- ============================================
SELECT 'Demo data inserted successfully!' AS Status;
SELECT COUNT(*) AS 'Total Reports' FROM reports;
SELECT COUNT(*) AS 'Total Messages' FROM report_messages;
SELECT COUNT(*) AS 'Total Notes' FROM report_notes;
