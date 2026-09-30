# [FREE] SWS Report 2.0 - Standalone Report System

![Staff view](https://github.com/SwisserDev/sws-report/raw/main/screenshots/admin-panel.png)

Players type `/report`, describe the problem and chat with staff. Staff work through a queue, talk to the player and teleport, heal, spectate or kick without leaving the menu. Standalone, no framework needed.

2.0 is a full rework of the interface and the statistics plus 28 bug fixes, three of them security related. Free and open source, as before.

---

## What's new in 2.0

**A queue that tells you what to do next**
- Reports grouped into unclaimed, claimed by me and claimed by others, most urgent and oldest on top
- Waiting time turns amber, orange and red while nobody has picked a report up
- A dot marks reports where the player is waiting for an answer

**Less clicking**
- Claim and resolve sit next to the report title, player actions are one labelled toolbar
- Kick asks for a reason, the player sees it and it lands in the report and on Discord
- Delete and kick confirm, everything else is one click

**Statistics that answer real questions**
- How long do players wait for the first answer? Median and 90th percentile, compared with the last period
- When do reports come in, and how fast are you at those hours?
- Does "urgent" actually get handled faster than "low"?
- Created vs. resolved over time, backlog, a table per staff member (no leaderboard, no medals)
- Today, 7, 30, 90 days or all time

**Looks and feel**
- New dark and light theme, IBM Plex typeface, scales cleanly from 720p to 4K
- Staff notes in amber so nobody mixes them up with the player chat
- Tested in Chromium 103, the browser FiveM actually uses

---

## Everything else

**Reports & chat:** categories, priorities, live chat, screenshots, voice messages (optional), report history

**Staff tools:** teleport, bring, spectate, heal, revive, freeze, ragdoll, screenshot, kick, staff notes per report and per player, player history with identifiers, inventory editing (ox_inventory, ESX)

**Server side:** ACE permissions or permission groups with inheritance, Discord logging per event, EN/DE/FR/JA, exports and events for your own scripts, update check

---

## Screenshots

**Player view**
![Player view](https://github.com/SwisserDev/sws-report/raw/main/screenshots/player-view.png)

**Statistics**
![Statistics](https://github.com/SwisserDev/sws-report/raw/main/screenshots/statistics.png)
![Statistics details](https://github.com/SwisserDev/sws-report/raw/main/screenshots/statistics-details.png)

**Staff notes**
![Staff notes](https://github.com/SwisserDev/sws-report/raw/main/screenshots/staff-notes.png)

**Player info**
![Player info](https://github.com/SwisserDev/sws-report/raw/main/screenshots/player-info.png)

**Light theme**
![Light theme](https://github.com/SwisserDev/sws-report/raw/main/screenshots/light-theme.png)

---

## Fixed in 2.0 (selection)

- The default config gave admin rights to a real license identifier. **If you run 1.2.0 or older, remove `license:815c4d6cf569fc8361f3c94bfec50f0a16643e52` from `Config.AdminIdentifiers`.**
- Clients could post fake inventory logs to your staff Discord
- Staff whose framework assigns the ACE group after character selection never saw the admin panel
- Reports went missing after a restart once they had a few messages
- Resolved reports couldn't be deleted, the resolved filter forgot old reports
- Spectate could leave admins invisible under the map

Full list: [CHANGELOG.md](https://github.com/SwisserDev/sws-report/blob/main/CHANGELOG.md)

---

## Installation

1. Download the zip from [Releases](https://github.com/SwisserDev/sws-report/releases) (not the "Download ZIP" button, that one has no built UI)
2. Extract to `resources/sws-report`
3. Import `sql/install.sql`
4. `server.cfg`:
```
ensure oxmysql
ensure sws-report
```
5. Give staff access:
```
add_ace group.admin report.admin allow
add_principal identifier.license:xxx group.admin
```

Updating from 1.x: no database changes needed if you are on 1.0.6 or newer. See [UPGRADING.md](https://github.com/SwisserDev/sws-report/blob/main/UPGRADING.md).

---

## Configuration

```lua
Config.Locale = "en"
Config.Command = "report"
Config.Cooldown = 60
Config.MaxActiveReports = 3

Config.AdminAcePermission = "report.admin"

Config.Discord = {
    enabled = true,
    webhook = "https://discord.com/api/webhooks/..."
}
```

Everything else (categories, priorities, permission groups, screenshots, voice, inventory, UI scale) is commented in `config/main.lua`.

---

## Exports & events

```lua
-- server
exports["sws-report"]:IsAdmin(source)
exports["sws-report"]:HasPermission(source, "kick_player")
exports["sws-report"]:GetReports(filter)
exports["sws-report"]:CloseReport(reportId)

AddEventHandler("sws-report:onCreated", function(report) end)
AddEventHandler("sws-report:onResolved", function(report, adminIdentifier) end)

-- client
exports["sws-report"]:OpenUI()
exports["sws-report"]:CloseUI()
```

Full list in the [README](https://github.com/SwisserDev/sws-report#commands-exports-and-events).

---

## Download

https://github.com/SwisserDev/sws-report/releases

## Support

GitHub Issues: https://github.com/SwisserDev/sws-report/issues
Discord: swisser dev

---

|                       |                              |
|-----------------------|------------------------------|
| Code is accessible    | Yes                          |
| Subscription-based    | No                           |
| Lines (approximately) | ~14000                       |
| Requirements          | oxmysql                      |
| Support               | Yes                          |
