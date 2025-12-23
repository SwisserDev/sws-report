---@class InventoryItem Unified inventory item structure
---@field name string Item internal name/ID
---@field label string Item display label
---@field count number Item count/quantity
---@field slot? number Slot number (ox_inventory)
---@field weight? number Item weight
---@field metadata? table Item metadata (serial, durability, custom data)

---@class InventoryActionResult Result from inventory operations
---@field success boolean Whether the action succeeded
---@field response? string Error or success message

---@class IInventoryAdapter Interface for inventory adapters
---@field GetPlayerInventory fun(playerId: integer): InventoryItem[] Get all items in player inventory
---@field GetItem fun(playerId: integer, itemName: string): InventoryItem|nil Get specific item from player inventory
---@field AddItem fun(playerId: integer, itemName: string, count: integer, metadata?: table): InventoryActionResult Add item to player inventory
---@field RemoveItem fun(playerId: integer, itemName: string, count: integer, slot?: integer, metadata?: table): InventoryActionResult Remove item from player inventory
---@field SetItemCount fun(playerId: integer, itemName: string, count: integer): InventoryActionResult Set exact item count
---@field SetItemMetadata fun(playerId: integer, slot: integer, metadata: table): InventoryActionResult Update item metadata (ox_inventory only)
---@field CanCarryItem fun(playerId: integer, itemName: string, count: integer): boolean Check if player can carry item
---@field GetItemList fun(): table<string, table> Get all registered items
---@field GetName fun(): string Get adapter name
---@field IsAvailable fun(): boolean Check if adapter is available
---@field SupportsMetadata fun(): boolean Check if adapter supports metadata editing

---@enum InventorySystem Supported inventory systems
InventorySystem = {
    OX_INVENTORY = "ox_inventory",
    ESX_DEFAULT = "esx_default",
    NONE = "none"
}

---Global inventory adapter instance
---@type IInventoryAdapter|nil
InventoryAdapter = nil

---Detected inventory system name
---@type string
InventorySystemName = InventorySystem.NONE

---Detect which inventory system is currently running
---@return InventorySystem system The detected inventory system
local function detectInventorySystem()
    if GetResourceState("ox_inventory") == "started" then
        return InventorySystem.OX_INVENTORY
    elseif GetResourceState("es_extended") == "started" then
        return InventorySystem.ESX_DEFAULT
    end
    return InventorySystem.NONE
end

---Initialize and create the appropriate inventory adapter
---@return IInventoryAdapter|nil adapter The initialized adapter or nil if no system found
function CreateInventoryAdapter()
    local system = detectInventorySystem()
    InventorySystemName = system

    if system == InventorySystem.OX_INVENTORY then
        DebugPrint("Initializing ox_inventory adapter")
        local oxAdapter = require("server/module/inventory/adapters/ox")
        if oxAdapter and oxAdapter.IsAvailable() then
            InventoryAdapter = oxAdapter
            PrintInfo(("Inventory adapter initialized: %s"):format(oxAdapter.GetName()))
            return oxAdapter
        end
    elseif system == InventorySystem.ESX_DEFAULT then
        DebugPrint("Initializing ESX default inventory adapter")
        local esxAdapter = require("server/module/inventory/adapters/esx")
        if esxAdapter and esxAdapter.IsAvailable() then
            InventoryAdapter = esxAdapter
            PrintInfo(("Inventory adapter initialized: %s"):format(esxAdapter.GetName()))
            return esxAdapter
        end
    end

    PrintWarn("No compatible inventory system detected. Inventory management will be disabled.")
    return nil
end

---Get the current inventory adapter
---@return IInventoryAdapter|nil adapter Current adapter or nil
function GetInventoryAdapter()
    return InventoryAdapter
end

---Check if inventory management is available
---@return boolean available Whether inventory management is available
function IsInventoryAvailable()
    return InventoryAdapter ~= nil and Config.Inventory.enabled
end

---Get the name of the detected inventory system
---@return string systemName The inventory system name
function GetInventorySystemName()
    return InventorySystemName
end
