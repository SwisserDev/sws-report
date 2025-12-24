<div align="center">

# SWS Report

[![Build](https://github.com/SwisserDev/sws-report/actions/workflows/build.yml/badge.svg)](https://github.com/SwisserDev/sws-report/actions/workflows/build.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.7-green.svg)](https://github.com/SwisserDev/sws-report/releases)
[![Lua](https://img.shields.io/badge/Lua-5.4-2C2D72?logo=lua&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](#)
[![FiveM](https://img.shields.io/badge/FiveM-Ready-F40552)](#)

Standalone report system for FiveM with live chat, admin tools, and Discord integration.

</div>

---

## Preview

<table>
  <tr>
    <td align="center"><b>Admin View</b></td>
    <td align="center"><b>Player View</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/admin_view.png" alt="Admin View" width="400"/></td>
    <td><img src="screenshots/player_view.png" alt="Player View" width="400"/></td>
  </tr>
</table>

<details>
<summary><b>More Screenshots</b></summary>
<br>

<img src="screenshots/admin-statistics.png" alt="Statistics Dashboard" width="600"/>

<table>
  <tr>
    <td align="center"><b>Admin Notes</b></td>
    <td align="center"><b>Player Notes</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/report-admin-notes.png" alt="Admin Notes" width="300"/></td>
    <td><img src="screenshots/report-player-notes.png" alt="Player Notes" width="300"/></td>
  </tr>
</table>
</details>

---

## Features

- **Player Reports** - Create tickets with live chat support
- **Voice Messages** - Record and send audio messages in chat (optional)
- **Admin Panel** - Claim, resolve, and manage reports
- **Moderation Tools** - Teleport, heal, freeze, spectate, kick
- **Discord Integration** - Webhook logging for all events
- **Statistics Dashboard** - Track team performance
- **Inventory Management** - View/modify player items (ox_inventory, ESX)
- **Multi-Language** - English & German included
- **Dark/Light Theme** - User preference saved

---

## Requirements

- FiveM Server
- [oxmysql](https://github.com/overextended/oxmysql)
- Node.js 20+

---

## Quick Start

```bash
# 1. Clone to resources
git clone https://github.com/SwisserDev/sws-report.git resources/sws-report

# 2. Import database
mysql -u root -p your_database < resources/sws-report/sql/install.sql

# 3. Build UI
cd resources/sws-report/web && npm install && npm run build

# 4. Add to server.cfg
ensure oxmysql
ensure sws-report

# 5. (Optional) Enable voice messages
mysql -u root -p your_database < resources/sws-report/sql/migrate_voice_messages.sql

# 6. (Optional) Enable inventory management
mysql -u root -p your_database < resources/sws-report/sql/migration_1.0.6_inventory_changes.sql

# 7. (Optional) Enable sound notifications
# Place notification.ogg and message.ogg in web/public/sounds/
# Then rebuild: cd web && npm run build
```

> **Upgrading from an older version?** See [UPGRADING.md](UPGRADING.md)

---

## Configuration

Edit `config/main.lua`:

```lua
Config.Locale = "en"              -- Language (en/de)
Config.Command = "report"         -- Command to open UI
Config.Cooldown = 60              -- Seconds between reports
Config.MaxActiveReports = 3       -- Max open reports per player

-- Admin access (choose one or both)
Config.AdminAcePermission = "report.admin"
Config.AdminIdentifiers = {
    "license:abc123...",
    "steam:123456..."
}

-- Discord webhook
Config.Discord = {
    enabled = true,
    webhook = "https://discord.com/api/webhooks/..."
}

-- Voice Messages (optional, requires migration)
Config.VoiceMessages = {
    enabled = true,
    maxDurationSeconds = 60,
    maxFileSizeKB = 7500
}

-- Inventory Management (optional, requires migration)
Config.Inventory = {
    enabled = true,
    allowedActions = { add = true, remove = true, set = true, metadata_edit = true },
    maxItemCount = 1000
}

-- Sound Notifications (optional)
Config.Sounds = {
    enabled = true,
    newReport = "notification.ogg",
    newMessage = "message.ogg",
    volume = 0.5
}
```

---

## Commands & Exports

### Commands
| Command | Description |
|---------|-------------|
| `/report` | Open report interface |

### Server Exports
```lua
exports["sws-report"]:IsAdmin(source)
exports["sws-report"]:GetReports(filter)
exports["sws-report"]:CloseReport(reportId)
exports["sws-report"]:IsInventoryAvailable()
exports["sws-report"]:GetInventorySystemName()
```

### Client Exports
```lua
exports["sws-report"]:OpenUI()
exports["sws-report"]:CloseUI()
exports["sws-report"]:IsUIOpen()
```

### Events
```lua
AddEventHandler("sws-report:onCreated", function(report) end)
AddEventHandler("sws-report:onClaimed", function(report, adminId) end)
AddEventHandler("sws-report:onResolved", function(report, adminId) end)
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [INVENTORY.md](INVENTORY.md) | Inventory management setup, usage & custom adapters |
| [UPGRADING.md](UPGRADING.md) | Migration guide for version upgrades |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/thing`)
3. Commit changes (`git commit -m "Add thing"`)
4. Push to branch (`git push origin feature/thing`)
5. Open a Pull Request

---

## License

[MIT](LICENSE)

---

<div align="center">
  <sub>Built by <a href="https://swisser.dev">SwisserDev</a></sub>
  <br><br>
  <a href="https://metrics.swisser.dev">Metrics</a> &bull;
  <a href="https://win.swisser.dev">Win</a> &bull;
  <a href="https://swisser.cloud">Cloud</a>
</div>
