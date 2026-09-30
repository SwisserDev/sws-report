# Changelog

## 2.0.0

No database migration needed when you are on 1.0.6 or newer. See [UPGRADING.md](UPGRADING.md).

### New interface

- Rebuilt UI with the same layout: tabs at the top, report list on the left, report on the right
- Report list as rows grouped into unclaimed / claimed by me / claimed by others, most urgent and oldest first
- Status and priority as small glyphs instead of colored pills
- Waiting time of unclaimed reports turns amber, orange and red; a dot marks reports where the other side is waiting for an answer
- Claim, resolve, priority and delete next to the report title; player actions as a labelled toolbar, no more hidden tabs
- Kick asks for a reason, shown to the player and written to the report and Discord
- Delete and kick need a confirmation, routine actions don't
- Staff notes tinted amber everywhere so they can't be mistaken for the player chat
- Chat with grouped messages, day dividers and system events as timeline rows
- Category picker instead of a dropdown when creating a report
- Players don't see priorities anymore
- IBM Plex typeface, new dark and light theme, scales with the game resolution (`Config.UI.scale` adjusts on top)
- Tested in Chromium 103, the browser FiveM uses

### New statistics

- Time ranges: today, 7, 30, 90 days, all time, remembered per player
- Waiting now, created, resolved, median first response and median resolution time, each compared with the previous period and with a sparkline
- Created vs. resolved over time with hover details
- Reports per hour of day together with the response time in that hour
- Categories, priorities with their resolution time, one dot per resolved report
- Team table with handled, resolved, messages and response times, sorted by name, with a team median instead of a ranking

### Fixes

- **Security:** the default config granted admin to a real license identifier
- **Security:** any client could post forged inventory logs to the staff Discord webhook
- Report position, priorities, item counts and slots are validated on the server
- Resolved reports could not be deleted (#21)
- The admin "resolved" filter showed only reports resolved in the current session (#20)
- Staff whose ACE group is assigned after joining (ESX/QBCore character selection, txAdmin) never got the admin panel; permissions are now re-checked whenever the menu opens
- Active reports went missing after a restart once a report had a few messages (MySQL `GROUP_CONCAT` limit)
- Exports failed when the resource folder had another name than `sws-report`
- Spectate could leave the admin invisible under the map and attached to the wrong ped
- An admin's own report vanished from the admin panel after reopening (side effect of the #17 fix)
- Escape in a dialog closed the whole menu
- Cancelled voice recordings were sent anyway; the recorder ignored `Config.VoiceMessages.maxDurationSeconds`
- Long report descriptions made Discord reject the log message
- Line breaks in descriptions and notes were lost, umlauts and emoji at the length limit could break the insert
- Resolving an unclaimed report didn't count for the resolving admin in the statistics
- Chat and voice messages are rate limited
- The new-report sound never played, chat messages triggered a broken second sound
- Voice message times were off on servers outside UTC
- `CloseReport` left the report open in every open menu
- Notes could not be added to resolved reports
- Search in the admin panel only matched raw license identifiers, now names, subjects and report ids
- Missing translations fall back to English instead of hardcoded strings
- Fresh installs lacked the `inventory_changes` table
- The README documented events and exports that didn't exist; they do now
- A clear console error when the UI build is missing (the "menu opens but is invisible" reports)
