# Upgrading SWS Report

## Before You Start

1. **Stop your server**
2. **Backup your database** (just in case)

---

## Which Migration Do I Need?

| Your Current Version | Run This |
|---------------------|----------|
| v1.0.2 or older | `migration_1.0.3_image_url.sql` + `migration_1.0.4_player_identifiers.sql` |
| v1.0.3 | `migration_1.0.4_player_identifiers.sql` |
| v1.0.4+ | Nothing - you're up to date! |

---

## How to Run Migrations

### Option 1: Command Line

```bash
mysql -u root -p your_database < sql/migration_1.0.3_image_url.sql
mysql -u root -p your_database < sql/migration_1.0.4_player_identifiers.sql
```

### Option 2: HeidiSQL / phpMyAdmin

1. Open the `.sql` file in the `sql/` folder
2. Copy the contents
3. Paste into query window
4. Execute

---

## After Migration

1. Replace your old files with the new release
2. Start your server
3. Done!

> **Note:** The release already includes the pre-built UI. No `npm run build` required.

---

## Troubleshooting

**"Column already exists"**
You already ran this migration. Skip it.

**"Table already exists"**
You already ran this migration. Skip it.

**Something else broke?**
Restore your backup and try again, or open an issue on GitHub.
