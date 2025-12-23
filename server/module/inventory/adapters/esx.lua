---ESX default inventory adapter implementation
---@class ESXInventoryAdapter : IInventoryAdapter

local ESXAdapter = {}
local ESX = nil

---Initialize ESX object
local function initESX()
    if ESX then return true end

    if GetResourceState("es_extended") ~= "started" then
        return false
    end

    ESX = exports["es_extended"]:getSharedObject()
    return ESX ~= nil
end

---Check if ESX is available
---@return boolean
function ESXAdapter.IsAvailable()
    return initESX()
end

---Get adapter name
---@return string
function ESXAdapter.GetName()
    return "esx_default"
end

---Check if adapter supports metadata editing
---@return boolean
function ESXAdapter.SupportsMetadata()
    return false
end

---Get all items in player inventory
---@param playerId integer Player server ID
---@return InventoryItem[]
function ESXAdapter.GetPlayerInventory(playerId)
    if not initESX() then
        return {}
    end

    local xPlayer = ESX.GetPlayerFromId(playerId)
    if not xPlayer then
        return {}
    end

    local inventory = xPlayer.getInventory(false)
    if not inventory then
        return {}
    end

    local result = {}
    for _, item in pairs(inventory) do
        if item and item.name and item.count and item.count > 0 then
            table.insert(result, {
                name = item.name,
                label = item.label or item.name,
                count = item.count,
                slot = nil,
                weight = item.weight,
                metadata = nil
            })
        end
    end

    return result
end

---Get specific item from player inventory
---@param playerId integer Player server ID
---@param itemName string Item name to find
---@return InventoryItem|nil
function ESXAdapter.GetItem(playerId, itemName)
    if not initESX() then
        return nil
    end

    local xPlayer = ESX.GetPlayerFromId(playerId)
    if not xPlayer then
        return nil
    end

    local item = xPlayer.getInventoryItem(itemName)
    if not item then
        return nil
    end

    return {
        name = item.name,
        label = item.label or item.name,
        count = item.count or 0,
        slot = nil,
        weight = item.weight,
        metadata = nil
    }
end

---Add item to player inventory
---@param playerId integer Player server ID
---@param itemName string Item name
---@param count integer Amount to add
---@param metadata? table Optional metadata (ignored in ESX default)
---@return InventoryActionResult
function ESXAdapter.AddItem(playerId, itemName, count, metadata)
    if not initESX() then
        return { success = false, response = "ESX not available" }
    end

    local xPlayer = ESX.GetPlayerFromId(playerId)
    if not xPlayer then
        return { success = false, response = "Player not found" }
    end

    local success, errorMsg = pcall(function()
        xPlayer.addInventoryItem(itemName, count)
    end)

    if success then
        return { success = true, response = "Item added" }
    else
        return { success = false, response = errorMsg or "Failed to add item" }
    end
end

---Remove item from player inventory
---@param playerId integer Player server ID
---@param itemName string Item name
---@param count integer Amount to remove
---@param slot? integer Optional specific slot (ignored in ESX default)
---@param metadata? table Optional metadata filter (ignored in ESX default)
---@return InventoryActionResult
function ESXAdapter.RemoveItem(playerId, itemName, count, slot, metadata)
    if not initESX() then
        return { success = false, response = "ESX not available" }
    end

    local xPlayer = ESX.GetPlayerFromId(playerId)
    if not xPlayer then
        return { success = false, response = "Player not found" }
    end

    local currentItem = xPlayer.getInventoryItem(itemName)
    if not currentItem or currentItem.count < count then
        return { success = false, response = "Insufficient items" }
    end

    local success, errorMsg = pcall(function()
        xPlayer.removeInventoryItem(itemName, count)
    end)

    if success then
        return { success = true, response = "Item removed" }
    else
        return { success = false, response = errorMsg or "Failed to remove item" }
    end
end

---Set exact item count in player inventory
---@param playerId integer Player server ID
---@param itemName string Item name
---@param count integer Target count
---@return InventoryActionResult
function ESXAdapter.SetItemCount(playerId, itemName, count)
    if not initESX() then
        return { success = false, response = "ESX not available" }
    end

    local xPlayer = ESX.GetPlayerFromId(playerId)
    if not xPlayer then
        return { success = false, response = "Player not found" }
    end

    local success, errorMsg = pcall(function()
        xPlayer.setInventoryItem(itemName, count)
    end)

    if success then
        return { success = true, response = "Item count set" }
    else
        return { success = false, response = errorMsg or "Failed to set item count" }
    end
end

---Update item metadata in specific slot
---@param playerId integer Player server ID
---@param slot integer Slot number
---@param metadata table New metadata
---@return InventoryActionResult
function ESXAdapter.SetItemMetadata(playerId, slot, metadata)
    return { success = false, response = "Metadata editing not supported by ESX default inventory" }
end

---Check if player can carry item
---@param playerId integer Player server ID
---@param itemName string Item name
---@param count integer Amount to check
---@return boolean
function ESXAdapter.CanCarryItem(playerId, itemName, count)
    if not initESX() then
        return false
    end

    local xPlayer = ESX.GetPlayerFromId(playerId)
    if not xPlayer then
        return false
    end

    return xPlayer.canCarryItem(itemName, count)
end

---Get all registered items
---@return table<string, table>
function ESXAdapter.GetItemList()
    if not initESX() then
        return {}
    end

    local items = ESX.GetItems()
    local result = {}

    if items then
        for _, item in pairs(items) do
            result[item.name] = {
                name = item.name,
                label = item.label,
                weight = item.weight or 0
            }
        end
    end

    return result
end

return ESXAdapter
