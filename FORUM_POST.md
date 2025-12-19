# [FREE] SWS Report - Standalone Report System

![Preview](https://github.com/SwisserDev/sws-report/raw/main/screenshots/admin_view.png)

A standalone report system for FiveM. No framework dependencies - works out of the box with any server setup.

Players submit tickets, admins handle them through a clean interface with live chat, moderation tools, and statistics tracking.

---

## Features

**Reports & Chat**
- Ticket creation with categories and priority levels
- Live chat between players and admins
- Voice messages (optional, max 60 seconds)
- Report history and status tracking

**Admin Tools**
- Claim system to prevent duplicate work
- Teleport to player / Bring player
- Heal, freeze, spectate, kick
- Internal notes (only visible to staff)
- Discord webhook logging

**Statistics**
- Track response times
- Reports per admin
- Resolution rates

**Other**
- ACE permission support
- Multi-language (EN/DE included, easily extendable)
- Dark/Light theme
- Auto update notifications

---

## Screenshots

**Admin Panel**
![Admin](https://github.com/SwisserDev/sws-report/raw/main/screenshots/admin_view.png)

**Player View**
![Player](https://github.com/SwisserDev/sws-report/raw/main/screenshots/player_view.png)

**Statistics**
![Stats](https://github.com/SwisserDev/sws-report/raw/main/screenshots/admin-statistics.png)

**Internal Notes**
![Notes](https://github.com/SwisserDev/sws-report/raw/main/screenshots/report-admin-notes.png)

---

## Installation

1. Download from [Releases](https://github.com/SwisserDev/sws-report/releases)
2. Extract to `resources/sws-report`
3. Import `sql/install.sql`
4. Add to server.cfg:
```
ensure oxmysql
ensure sws-report
```
5. (Optional) For voice messages: Import `sql/migrate_voice_messages.sql`

---

## Configuration

```lua
Config.Locale = "en"
Config.Command = "report"
Config.Cooldown = 60
Config.MaxActiveReports = 3

Config.AdminAcePermission = "report.admin"
Config.AdminIdentifiers = {
    "license:xxx",
    "steam:xxx"
}

Config.Discord = {
    enabled = true,
    webhook = "https://discord.com/api/webhooks/..."
}
```

---

## Exports

**Server**
```lua
exports["sws-report"]:IsAdmin(source)
exports["sws-report"]:GetReports(filter)
exports["sws-report"]:CloseReport(reportId)
```

**Client**
```lua
exports["sws-report"]:OpenUI()
exports["sws-report"]:CloseUI()
```

---

## Download

https://github.com/SwisserDev/sws-report/releases

---

## Support

GitHub Issues: https://github.com/SwisserDev/sws-report/issues

---

|                       |                              |
|-----------------------|------------------------------|
| Code is accessible    | Yes                          |
| Subscription-based    | No                           |
| Lines (approximately) | ~7500                        |
| Requirements          | oxmysql                      |
| Support               | Yes                          |
