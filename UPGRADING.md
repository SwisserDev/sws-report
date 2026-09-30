# Upgrading SWS Report

## Before you start

1. Stop your server
2. Back up your database

---

## Which migration do I need?

| Your current version | Run this |
|----------------------|----------|
| 1.0.2 or older | `migration_1.0.3_image_url.sql`, `migration_1.0.4_player_identifiers.sql`, `migration_1.0.6_inventory_changes.sql` |
| 1.0.3 | `migration_1.0.4_player_identifiers.sql`, `migration_1.0.6_inventory_changes.sql` |
| 1.0.4 / 1.0.5 | `migration_1.0.6_inventory_changes.sql` |
| 1.0.6 – 1.2.x | Nothing |
| Installed before voice messages existed | `migrate_voice_messages.sql` (the console tells you on start) |

Fresh installs only need `sql/install.sql`, it contains every table.

### Running a migration

```bash
mysql -u root -p your_database < sql/migration_1.0.6_inventory_changes.sql
```

Or open the file in HeidiSQL / phpMyAdmin and run it. "Column already exists" or "Table already exists" means you already ran it, skip it.

---

## 1.x → 2.0

1. Download the 2.0 release zip and replace the resource folder.
2. Copy your settings over into the new `config/main.lua` instead of keeping the old file. New option: `Config.UI.scale`.
   If you keep your old config, add `scale = 1.0` to `Config.UI` or leave it out, it defaults to 1.0.
3. Start the server.

> **Check your `Config.AdminIdentifiers`.** Configs from 1.2.0 and older shipped with the identifier
> `license:815c4d6cf569fc8361f3c94bfec50f0a16643e52` in that list, which gives that player full admin
> rights on your server. Remove it if it is still there.

Things to know:

- **Permissions** are now checked every time the menu opens. If staff got access before only after reconnecting, that is no longer needed.
- **Translations:** 2.0 adds new keys to `locales/*.lua`. If you maintain your own translation, missing keys fall back to English. Compare with `locales/en.lua` to see what's new.
- **Custom UI changes** in `web/src` are replaced by the new interface. If you built your own UI on the NUI callbacks: `getStatistics` takes a `range` and returns a new shape, `getReports` answers with `SET_REPORT_ARCHIVE`, and the UI receives `SET_PLAYER_DATA` when permissions change.
- **Kick** messages can carry a reason. Your `kicked_reason` translation still works when no reason is given.

---

## Troubleshooting

**The menu opens but nothing is visible.**
You copied the source code instead of the release. The console says `UI build missing`. Use the release zip.

**Something else broke?**
Restore your backup and open an issue on GitHub with the server console output (`Config.Debug = true`).
