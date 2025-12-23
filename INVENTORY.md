# Inventory Management

Admin tool for viewing and modifying player inventories directly from the report panel.

---

## Overview

When handling a report, admins can access the player's inventory to:
- View all items with metadata
- Add items (with optional metadata)
- Remove items (by count or specific slot)
- Set exact item counts
- Edit item metadata (ox_inventory only)

All actions are logged to the database and optionally to Discord.

---

## Supported Inventory Systems

| System | Add/Remove | Set Count | Metadata Edit |
|--------|------------|-----------|---------------|
| ox_inventory | Yes | Yes | Yes |
| ESX Default | Yes | Yes | No |

The system auto-detects which inventory is running. No configuration needed.

---

## Setup

### 1. Run the Migration

```bash
mysql -u root -p your_database < sql/migration_inventory_changes.sql
```

Or paste the contents into HeidiSQL/phpMyAdmin.

### 2. Configure (Optional)

Edit `config/main.lua`:

```lua
Config.Inventory = {
    enabled = true,              -- Enable/disable feature
    allowedActions = {
        add = true,              -- Allow adding items
        remove = true,           -- Allow removing items
        set = true,              -- Allow setting exact counts
        metadata_edit = true     -- Allow metadata editing (ox_inventory)
    },
    logToDiscord = true,         -- Send actions to Discord webhook
    maxItemCount = 1000          -- Maximum items per action
}
```

### 3. Discord Webhook (Optional)

If `Config.Discord.enabled` is true, inventory actions will be logged with the color defined in:

```lua
Config.Discord.colors.inventory = 0x9B59B6  -- Purple
```

---

## Usage

1. Open a report in the admin panel
2. Ensure the player is **online** (inventory tab only appears for online players)
3. Click the **Inventory** tab
4. Use the interface to view/modify items

### Quick Actions (Per Item)

| Button | Action |
|--------|--------|
| `+` | Add more of this item |
| `-` | Remove some of this item |
| `=` | Set exact count |
| `{...}` | Edit metadata (ox_inventory only) |

### Adding New Items

Click **Add** in the header to add an item the player doesn't have yet.

---

## Adding Custom Inventory Adapters

The system uses a factory pattern. To add support for another inventory system:

### 1. Create Adapter File

Create `server/module/inventory/adapters/your_inventory.lua`:

```lua
---@type IInventoryAdapter
YourInventoryAdapter = {}

function YourInventoryAdapter.IsAvailable()
    return GetResourceState("your_inventory") == "started"
end

function YourInventoryAdapter.GetName()
    return "your_inventory"
end

function YourInventoryAdapter.SupportsMetadata()
    return true  -- or false
end

function YourInventoryAdapter.GetPlayerInventory(playerId)
    -- Return array of InventoryItem
    return {}
end

function YourInventoryAdapter.GetItem(playerId, itemName)
    -- Return single InventoryItem or nil
    return nil
end

function YourInventoryAdapter.AddItem(playerId, itemName, count, metadata)
    -- Return { success = bool, response = string }
    return { success = true, response = "Item added" }
end

function YourInventoryAdapter.RemoveItem(playerId, itemName, count, slot, metadata)
    return { success = true, response = "Item removed" }
end

function YourInventoryAdapter.SetItemCount(playerId, itemName, count)
    return { success = true, response = "Count updated" }
end

function YourInventoryAdapter.SetItemMetadata(playerId, slot, metadata)
    return { success = false, response = "Not supported" }
end

function YourInventoryAdapter.CanCarryItem(playerId, itemName, count)
    return true
end

function YourInventoryAdapter.GetItemList()
    -- Return table<string, { name, label, weight? }>
    return {}
end
```

### 2. Register in Factory

Edit `server/module/inventory/adapter.lua`:

```lua
function CreateInventoryAdapter()
    local system = detectInventorySystem()

    -- Add your check here
    if GetResourceState("your_inventory") == "started" then
        if YourInventoryAdapter and YourInventoryAdapter.IsAvailable() then
            InventoryAdapter = YourInventoryAdapter
            return YourInventoryAdapter
        end
    end

    -- ... rest of function
end
```

### 3. Update fxmanifest.lua

Add your adapter file to the server_scripts before `adapter.lua`:

```lua
"server/module/inventory/adapters/your_inventory.lua",
```

---

## Database Schema

```sql
CREATE TABLE inventory_changes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id VARCHAR(60),
    admin_name VARCHAR(64),
    player_id VARCHAR(60),
    player_name VARCHAR(64),
    report_id INT,
    action ENUM('add', 'remove', 'set', 'metadata_edit'),
    item_name VARCHAR(64),
    item_label VARCHAR(128),
    count_before INT,
    count_after INT,
    metadata_before JSON,
    metadata_after JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Exports

### Server

```lua
-- Check if inventory management is available
exports["sws-report"]:IsInventoryAvailable()

-- Get detected inventory system name
exports["sws-report"]:GetInventorySystemName()
-- Returns: "ox_inventory", "esx_default", or "none"
```

---

## Localization

Add these keys to your locale file (`locales/xx.lua`):

```lua
-- Core
["inventory"] = "Inventory",
["inventory_management"] = "Inventory Management",
["inventory_loading"] = "Loading inventory...",
["inventory_empty"] = "Player inventory is empty",
["inventory_player_offline"] = "Cannot view inventory - player is offline",

-- Actions
["item_add"] = "Add Item",
["item_remove"] = "Remove Item",
["item_set_count"] = "Set Count",
["item_edit_metadata"] = "Edit Metadata",
["item_select"] = "Select Item",
["item_search"] = "Search items...",
["item_count"] = "Count",
["item_metadata"] = "Metadata",

-- Feedback
["inventory_item_added"] = "Added %dx %s to player inventory",
["inventory_item_removed"] = "Removed %dx %s from player inventory",
["inventory_item_set"] = "Set %s count to %d",
["inventory_metadata_updated"] = "Updated metadata for %s",
["inventory_action_failed"] = "Inventory action failed: %s",

-- Errors
["error_inventory_disabled"] = "Inventory management is disabled",
["error_inventory_unavailable"] = "No compatible inventory system detected",
["error_invalid_item"] = "Invalid item specified",
["error_invalid_count"] = "Invalid count specified",
```

---

## Troubleshooting

**"No compatible inventory system detected"**
Neither ox_inventory nor ESX is running. Make sure your inventory resource starts before sws-report.

**Inventory tab not showing**
The tab only appears when viewing a report where the player is online. Check `isPlayerOnline` in the report data.

**Metadata editing disabled**
ESX default inventory doesn't support metadata. Use ox_inventory for full functionality.

**Actions not logging to Discord**
Check that `Config.Discord.enabled` and `Config.Inventory.logToDiscord` are both `true`.

---

## Security

All inventory actions:
- Require admin permission
- Validate the player exists and is online
- Validate item names against the inventory system's item list
- Are logged with before/after values
- Can be disabled individually via `Config.Inventory.allowedActions`

Never expose inventory modification to non-admin players.
