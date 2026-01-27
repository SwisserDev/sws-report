---Inventory Management Module
---Handles all inventory-related operations for the report system

-- Initialize inventory adapter on resource start
CreateThread(function()
    Wait(1000)
    CreateInventoryAdapter()
end)

---Log inventory change to database
---@param adminId string Admin identifier
---@param adminName string Admin display name
---@param playerId string Player identifier
---@param playerName string Player display name
---@param reportId integer Report ID
---@param action string Action type (add/remove/set/metadata_edit)
---@param itemName string Item internal name
---@param itemLabel string Item display label
---@param countBefore integer Count before action
---@param countAfter integer Count after action
---@param metadataBefore? table Metadata before action
---@param metadataAfter? table Metadata after action
local function logInventoryChange(adminId, adminName, playerId, playerName, reportId, action, itemName, itemLabel, countBefore, countAfter, metadataBefore, metadataAfter)
    MySQL.insert.await([[
        INSERT INTO inventory_changes
        (admin_id, admin_name, player_id, player_name, report_id, action, item_name, item_label, count_before, count_after, metadata_before, metadata_after)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ]], {
        adminId,
        adminName,
        playerId,
        playerName,
        reportId,
        action,
        itemName,
        itemLabel,
        countBefore,
        countAfter,
        metadataBefore and json.encode(metadataBefore) or nil,
        metadataAfter and json.encode(metadataAfter) or nil
    })
end

---Validate inventory action permissions
---@param source integer Admin server ID
---@param reportId integer Report ID
---@param action? string Specific action to check
---@return boolean valid Whether validation passed
---@return table|nil report The report if valid
---@return table|nil targetPlayer The target player data if valid
local function validateInventoryAction(source, reportId, action)
    if not Config.Inventory.enabled then
        NotifyPlayer(source, L("error_inventory_disabled"), "error")
        return false
    end

    if not IsInventoryAvailable() then
        NotifyPlayer(source, L("inventory_unavailable"), "error")
        return false
    end

    if not HasPermission(source, Permission.MANAGE_INVENTORY) then
        NotifyPlayer(source, L("error_no_permission"), "error")
        return false
    end

    if action and Config.Inventory.allowedActions[action] == false then
        NotifyPlayer(source, L("error_no_permission"), "error")
        return false
    end

    local report = Reports[reportId]
    if not report then
        NotifyPlayer(source, L("error_not_found"), "error")
        return false
    end

    local targetPlayer = GetPlayerByIdentifier(report.data.playerId)
    if not targetPlayer then
        NotifyPlayer(source, L("inventory_player_offline"), "error")
        return false
    end

    return true, report, targetPlayer
end

---Get player inventory for a report
RegisterNetEvent("sws-report:getPlayerInventory", function(reportId)
    local source = source

    if not IsValidReportId(reportId) then
        return
    end

    local valid, report, targetPlayer = validateInventoryAction(source, reportId)
    if not valid then
        return
    end

    local adapter = GetInventoryAdapter()
    if not adapter then
        NotifyPlayer(source, L("inventory_unavailable"), "error")
        return
    end

    local items = adapter.GetPlayerInventory(targetPlayer.source)
    local itemList = adapter.GetItemList()

    TriggerClientEvent("sws-report:setPlayerInventory", source, {
        reportId = reportId,
        items = items,
        itemList = itemList,
        systemName = GetInventorySystemName(),
        supportsMetadata = adapter.SupportsMetadata()
    })

    DebugPrint(("Admin %s fetched inventory for report #%d"):format(Players[source].name, reportId))
end)

---Add item to player inventory
RegisterNetEvent("sws-report:addInventoryItem", function(reportId, itemName, count, metadata)
    local source = source

    if not IsValidReportId(reportId) then
        return
    end

    if type(itemName) ~= "string" or itemName == "" then
        NotifyPlayer(source, L("error_invalid_item"), "error")
        return
    end

    if type(count) ~= "number" or count <= 0 then
        NotifyPlayer(source, L("error_invalid_count"), "error")
        return
    end

    if count > Config.Inventory.maxItemCount then
        NotifyPlayer(source, L("error_max_item_count", Config.Inventory.maxItemCount), "error")
        return
    end

    local valid, report, targetPlayer = validateInventoryAction(source, reportId, "add")
    if not valid then
        return
    end

    local adapter = GetInventoryAdapter()
    if not adapter then
        return
    end

    local currentItem = adapter.GetItem(targetPlayer.source, itemName)
    local countBefore = currentItem and currentItem.count or 0

    local result = adapter.AddItem(targetPlayer.source, itemName, count, metadata)

    if result.success then
        local admin = Players[source]
        local itemLabel = currentItem and currentItem.label or itemName

        local playerId = report.data.playerId
        local playerName = report.data.playerName

        logInventoryChange(
            admin.identifier,
            admin.name,
            playerId,
            playerName,
            reportId,
            InventoryAction.ADD,
            itemName,
            itemLabel,
            countBefore,
            countBefore + count,
            nil,
            metadata
        )

        SendSystemMessage(reportId, L("action_add_item", admin.name, count, itemLabel))

        TriggerEvent("sws-report:discord:inventoryAction", {
            action = InventoryAction.ADD,
            admin = admin,
            player = { identifier = playerId, name = playerName },
            item = { name = itemName, label = itemLabel, count = count },
            reportId = reportId,
            countBefore = countBefore,
            countAfter = countBefore + count
        })

        NotifyPlayer(source, L("inventory_item_added", count, itemLabel), "success")

        local updatedItems = adapter.GetPlayerInventory(targetPlayer.source)
        TriggerClientEvent("sws-report:inventoryUpdated", source, {
            reportId = reportId,
            items = updatedItems
        })

        DebugPrint(("Admin %s added %dx %s to player %s"):format(admin.name, count, itemName, playerName))
    else
        NotifyPlayer(source, L("inventory_action_failed", result.response or "Unknown error"), "error")
    end
end)

---Remove item from player inventory
RegisterNetEvent("sws-report:removeInventoryItem", function(reportId, itemName, count, slot)
    local source = source

    if not IsValidReportId(reportId) then
        return
    end

    if type(itemName) ~= "string" or itemName == "" then
        NotifyPlayer(source, L("error_invalid_item"), "error")
        return
    end

    if type(count) ~= "number" or count <= 0 then
        NotifyPlayer(source, L("error_invalid_count"), "error")
        return
    end

    local valid, report, targetPlayer = validateInventoryAction(source, reportId, "remove")
    if not valid then
        return
    end

    local adapter = GetInventoryAdapter()
    if not adapter then
        return
    end

    local currentItem = adapter.GetItem(targetPlayer.source, itemName)
    if not currentItem or currentItem.count < count then
        NotifyPlayer(source, L("error_insufficient_items"), "error")
        return
    end

    local countBefore = currentItem.count
    local result = adapter.RemoveItem(targetPlayer.source, itemName, count, slot)

    if result.success then
        local admin = Players[source]
        local itemLabel = currentItem.label or itemName

        local playerId = report.data.playerId
        local playerName = report.data.playerName

        logInventoryChange(
            admin.identifier,
            admin.name,
            playerId,
            playerName,
            reportId,
            InventoryAction.REMOVE,
            itemName,
            itemLabel,
            countBefore,
            countBefore - count,
            nil,
            nil
        )

        SendSystemMessage(reportId, L("action_remove_item", admin.name, count, itemLabel))

        TriggerEvent("sws-report:discord:inventoryAction", {
            action = InventoryAction.REMOVE,
            admin = admin,
            player = { identifier = playerId, name = playerName },
            item = { name = itemName, label = itemLabel, count = count },
            reportId = reportId,
            countBefore = countBefore,
            countAfter = countBefore - count
        })

        NotifyPlayer(source, L("inventory_item_removed", count, itemLabel), "success")

        local updatedItems = adapter.GetPlayerInventory(targetPlayer.source)
        TriggerClientEvent("sws-report:inventoryUpdated", source, {
            reportId = reportId,
            items = updatedItems
        })

        DebugPrint(("Admin %s removed %dx %s from player %s"):format(admin.name, count, itemName, playerName))
    else
        NotifyPlayer(source, L("inventory_action_failed", result.response or "Unknown error"), "error")
    end
end)

---Set item count directly
RegisterNetEvent("sws-report:setInventoryItemCount", function(reportId, itemName, count)
    local source = source

    if not IsValidReportId(reportId) then
        return
    end

    if type(itemName) ~= "string" or itemName == "" then
        NotifyPlayer(source, L("error_invalid_item"), "error")
        return
    end

    if type(count) ~= "number" or count < 0 then
        NotifyPlayer(source, L("error_invalid_count"), "error")
        return
    end

    if count > Config.Inventory.maxItemCount then
        NotifyPlayer(source, L("error_max_item_count", Config.Inventory.maxItemCount), "error")
        return
    end

    local valid, report, targetPlayer = validateInventoryAction(source, reportId, "set")
    if not valid then
        return
    end

    local adapter = GetInventoryAdapter()
    if not adapter then
        return
    end

    local currentItem = adapter.GetItem(targetPlayer.source, itemName)
    local countBefore = currentItem and currentItem.count or 0

    local result = adapter.SetItemCount(targetPlayer.source, itemName, count)

    if result.success then
        local admin = Players[source]
        local itemLabel = currentItem and currentItem.label or itemName

        local playerId = report.data.playerId
        local playerName = report.data.playerName

        logInventoryChange(
            admin.identifier,
            admin.name,
            playerId,
            playerName,
            reportId,
            InventoryAction.SET,
            itemName,
            itemLabel,
            countBefore,
            count,
            nil,
            nil
        )

        SendSystemMessage(reportId, L("action_set_item", admin.name, itemLabel, count))

        TriggerEvent("sws-report:discord:inventoryAction", {
            action = InventoryAction.SET,
            admin = admin,
            player = { identifier = playerId, name = playerName },
            item = { name = itemName, label = itemLabel, count = count },
            reportId = reportId,
            countBefore = countBefore,
            countAfter = count
        })

        NotifyPlayer(source, L("inventory_item_set", itemLabel, count), "success")

        local updatedItems = adapter.GetPlayerInventory(targetPlayer.source)
        TriggerClientEvent("sws-report:inventoryUpdated", source, {
            reportId = reportId,
            items = updatedItems
        })

        DebugPrint(("Admin %s set %s count to %d for player %s"):format(admin.name, itemName, count, playerName))
    else
        NotifyPlayer(source, L("inventory_action_failed", result.response or "Unknown error"), "error")
    end
end)

---Edit item metadata
RegisterNetEvent("sws-report:setInventoryItemMetadata", function(reportId, slot, metadata)
    local source = source

    if not IsValidReportId(reportId) then
        return
    end

    if type(slot) ~= "number" or slot < 1 then
        NotifyPlayer(source, L("error_invalid_slot"), "error")
        return
    end

    if type(metadata) ~= "table" then
        NotifyPlayer(source, L("error_generic"), "error")
        return
    end

    local valid, report, targetPlayer = validateInventoryAction(source, reportId, "metadata_edit")
    if not valid then
        return
    end

    local adapter = GetInventoryAdapter()
    if not adapter then
        return
    end

    if not adapter.SupportsMetadata() then
        NotifyPlayer(source, L("error_metadata_not_supported"), "error")
        return
    end

    local inventory = adapter.GetPlayerInventory(targetPlayer.source)
    local targetItem = nil
    local metadataBefore = nil

    for _, item in pairs(inventory) do
        if item.slot == slot then
            targetItem = item
            metadataBefore = item.metadata
            break
        end
    end

    if not targetItem then
        NotifyPlayer(source, L("error_item_not_found"), "error")
        return
    end

    local result = adapter.SetItemMetadata(targetPlayer.source, slot, metadata)

    if result.success then
        local admin = Players[source]

        local playerId = report.data.playerId
        local playerName = report.data.playerName

        logInventoryChange(
            admin.identifier,
            admin.name,
            playerId,
            playerName,
            reportId,
            InventoryAction.METADATA_EDIT,
            targetItem.name,
            targetItem.label,
            targetItem.count,
            targetItem.count,
            metadataBefore,
            metadata
        )

        SendSystemMessage(reportId, L("action_edit_metadata", admin.name, targetItem.label))

        TriggerEvent("sws-report:discord:inventoryAction", {
            action = InventoryAction.METADATA_EDIT,
            admin = admin,
            player = { identifier = playerId, name = playerName },
            item = { name = targetItem.name, label = targetItem.label, slot = slot },
            reportId = reportId,
            metadataBefore = metadataBefore,
            metadataAfter = metadata
        })

        NotifyPlayer(source, L("inventory_metadata_updated", targetItem.label), "success")

        local updatedItems = adapter.GetPlayerInventory(targetPlayer.source)
        TriggerClientEvent("sws-report:inventoryUpdated", source, {
            reportId = reportId,
            items = updatedItems
        })

        DebugPrint(("Admin %s edited metadata for %s (slot %d) for player %s"):format(admin.name, targetItem.name, slot, playerName))
    else
        NotifyPlayer(source, L("inventory_action_failed", result.response or "Unknown error"), "error")
    end
end)

---Get inventory action log for a report
RegisterNetEvent("sws-report:getInventoryActionLog", function(reportId, limit)
    local source = source

    if not IsValidReportId(reportId) then
        return
    end

    if not HasPermission(source, Permission.MANAGE_INVENTORY) then
        return
    end

    limit = type(limit) == "number" and limit or 20

    local logs = MySQL.query.await([[
        SELECT * FROM inventory_changes
        WHERE report_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    ]], { reportId, limit })

    TriggerClientEvent("sws-report:setInventoryActionLog", source, {
        reportId = reportId,
        logs = logs or {}
    })
end)
