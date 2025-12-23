---ox_inventory adapter implementation
---@class OxInventoryAdapter : IInventoryAdapter

---@type IInventoryAdapter
OxInventoryAdapter = {}

---Check if ox_inventory is available
---@return boolean
function OxInventoryAdapter.IsAvailable()
    return GetResourceState("ox_inventory") == "started"
end

---Get adapter name
---@return string
function OxInventoryAdapter.GetName()
    return "ox_inventory"
end

---Check if adapter supports metadata editing
---@return boolean
function OxInventoryAdapter.SupportsMetadata()
    return true
end

---Get all items in player inventory
---@param playerId integer Player server ID
---@return InventoryItem[]
function OxInventoryAdapter.GetPlayerInventory(playerId)
    if not OxInventoryAdapter.IsAvailable() then
        return {}
    end

    local items = exports.ox_inventory:GetInventoryItems(playerId)
    if not items then
        return {}
    end

    local result = {}
    for slot, item in pairs(items) do
        if item and item.name then
            table.insert(result, {
                name = item.name,
                label = item.label or item.name,
                count = item.count or 1,
                slot = slot,
                weight = item.weight,
                metadata = item.metadata
            })
        end
    end

    return result
end

---Get specific item from player inventory
---@param playerId integer Player server ID
---@param itemName string Item name to find
---@return InventoryItem|nil
function OxInventoryAdapter.GetItem(playerId, itemName)
    if not OxInventoryAdapter.IsAvailable() then
        return nil
    end

    local item = exports.ox_inventory:GetItem(playerId, itemName, nil, false)
    if not item then
        return nil
    end

    return {
        name = item.name,
        label = item.label or item.name,
        count = item.count or 0,
        slot = item.slot,
        weight = item.weight,
        metadata = item.metadata
    }
end

---Add item to player inventory
---@param playerId integer Player server ID
---@param itemName string Item name
---@param count integer Amount to add
---@param metadata? table Optional metadata
---@return InventoryActionResult
function OxInventoryAdapter.AddItem(playerId, itemName, count, metadata)
    if not OxInventoryAdapter.IsAvailable() then
        return { success = false, response = "ox_inventory not available" }
    end

    local success, response = exports.ox_inventory:AddItem(playerId, itemName, count, metadata)

    if success then
        return { success = true, response = response }
    else
        return { success = false, response = response or "Failed to add item" }
    end
end

---Remove item from player inventory
---@param playerId integer Player server ID
---@param itemName string Item name
---@param count integer Amount to remove
---@param slot? integer Optional specific slot
---@param metadata? table Optional metadata filter
---@return InventoryActionResult
function OxInventoryAdapter.RemoveItem(playerId, itemName, count, slot, metadata)
    if not OxInventoryAdapter.IsAvailable() then
        return { success = false, response = "ox_inventory not available" }
    end

    local success, response = exports.ox_inventory:RemoveItem(playerId, itemName, count, metadata, slot)

    if success then
        return { success = true, response = response }
    else
        return { success = false, response = response or "Failed to remove item" }
    end
end

---Set exact item count in player inventory
---@param playerId integer Player server ID
---@param itemName string Item name
---@param count integer Target count
---@return InventoryActionResult
function OxInventoryAdapter.SetItemCount(playerId, itemName, count)
    if not OxInventoryAdapter.IsAvailable() then
        return { success = false, response = "ox_inventory not available" }
    end

    local currentItem = OxInventoryAdapter.GetItem(playerId, itemName)
    local currentCount = currentItem and currentItem.count or 0

    if count > currentCount then
        local diff = count - currentCount
        return OxInventoryAdapter.AddItem(playerId, itemName, diff)
    elseif count < currentCount then
        local diff = currentCount - count
        return OxInventoryAdapter.RemoveItem(playerId, itemName, diff)
    end

    return { success = true, response = "Count unchanged" }
end

---Update item metadata in specific slot
---@param playerId integer Player server ID
---@param slot integer Slot number
---@param metadata table New metadata
---@return InventoryActionResult
function OxInventoryAdapter.SetItemMetadata(playerId, slot, metadata)
    if not OxInventoryAdapter.IsAvailable() then
        return { success = false, response = "ox_inventory not available" }
    end

    local success = exports.ox_inventory:SetMetadata(playerId, slot, metadata)

    if success then
        return { success = true, response = "Metadata updated" }
    else
        return { success = false, response = "Failed to update metadata" }
    end
end

---Check if player can carry item
---@param playerId integer Player server ID
---@param itemName string Item name
---@param count integer Amount to check
---@return boolean
function OxInventoryAdapter.CanCarryItem(playerId, itemName, count)
    if not OxInventoryAdapter.IsAvailable() then
        return false
    end

    return exports.ox_inventory:CanCarryItem(playerId, itemName, count)
end

---Get all registered items
---@return table<string, table>
function OxInventoryAdapter.GetItemList()
    if not OxInventoryAdapter.IsAvailable() then
        return {}
    end

    local items = exports.ox_inventory:Items()
    return items or {}
end

-- Global adapter registered as OxInventoryAdapter
