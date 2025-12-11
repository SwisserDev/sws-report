---@type table<integer, PlayerData> Online players cache
Players = {}

---@type table<integer, boolean> Admin cache
Admins = {}

---@type table<integer, Report> Active reports cache
Reports = {}

---@type table<string, integer> Player cooldowns (identifier -> timestamp)
Cooldowns = {}

---@class PlayerData
---@field source integer Server ID
---@field identifier string Player identifier
---@field name string Player name
---@field isAdmin boolean Admin status

---Get player primary identifier
---@param source integer Player server ID
---@return string | nil
local function getPlayerIdentifier(source)
    local identifiers = GetPlayerIdentifiers(source)

    for _, identifier in ipairs(identifiers) do
        if string.find(identifier, "license:") then
            return identifier
        end
    end

    for _, identifier in ipairs(identifiers) do
        if string.find(identifier, "steam:") then
            return identifier
        end
    end

    return identifiers[1]
end

---Get all player identifiers
---@param source integer Player server ID
---@return string[]
local function getAllIdentifiers(source)
    return GetPlayerIdentifiers(source) or {}
end

---Check if player is admin
---@param source integer Player server ID
---@return boolean
function IsPlayerAdmin(source)
    if Admins[source] ~= nil then
        return Admins[source]
    end

    if IsPlayerAceAllowed(source, Config.AdminAcePermission) then
        Admins[source] = true
        return true
    end

    local identifiers = getAllIdentifiers(source)
    for _, identifier in ipairs(identifiers) do
        for _, adminId in ipairs(Config.AdminIdentifiers) do
            if identifier == adminId then
                Admins[source] = true
                return true
            end
        end
    end

    Admins[source] = false
    return false
end

---Get player data
---@param source integer Player server ID
---@return PlayerData | nil
function GetPlayerData(source)
    return Players[source]
end

---Get player by identifier
---@param identifier string Player identifier
---@return PlayerData | nil
function GetPlayerByIdentifier(identifier)
    for _, player in pairs(Players) do
        if player.identifier == identifier then
            return player
        end
    end
    return nil
end

---Check if player is online by identifier
---@param identifier string Player identifier
---@return boolean
function IsPlayerOnline(identifier)
    return GetPlayerByIdentifier(identifier) ~= nil
end

---Get all online admins
---@return PlayerData[]
function GetOnlineAdmins()
    local admins = {}
    for source, isAdmin in pairs(Admins) do
        if isAdmin and Players[source] then
            table.insert(admins, Players[source])
        end
    end
    return admins
end

---Notify player
---@param source integer Player server ID
---@param message string Notification message
---@param notifyType? string Notification type ("success" | "error" | "info")
function NotifyPlayer(source, message, notifyType)
    notifyType = notifyType or "info"
    TriggerClientEvent("sws-report:notify", source, message, notifyType)
end

---Notify all admins
---@param message string Notification message
---@param notifyType? string Notification type
---@param excludeSource? integer Source to exclude
function NotifyAdmins(message, notifyType, excludeSource)
    for source, isAdmin in pairs(Admins) do
        if isAdmin and source ~= excludeSource then
            NotifyPlayer(source, message, notifyType)
        end
    end
end

---Broadcast player online status to all admins
---@param identifier string Player identifier
---@param isOnline boolean Online status
local function broadcastPlayerOnlineStatus(identifier, isOnline)
    for adminSource, adminStatus in pairs(Admins) do
        if adminStatus then
            TriggerClientEvent("sws-report:playerOnlineStatus", adminSource, identifier, isOnline)
        end
    end
end

---Player connecting handler
AddEventHandler("playerConnecting", function(name, setKickReason, deferrals)
    local source = source
    DebugPrint(("Player connecting: %s (ID: %d)"):format(name, source))
end)

---Player joined handler
RegisterNetEvent("sws-report:playerJoined", function()
    local source = source
    local identifier = getPlayerIdentifier(source)

    local rawName = GetPlayerName(source)
    local name = SanitizeString(rawName or "Unknown", 50)

    if not identifier then
        PrintError(("Could not get identifier for player %d"):format(source))
        return
    end

    Players[source] = {
        source = source,
        identifier = identifier,
        name = name,
        isAdmin = IsPlayerAdmin(source)
    }

    DebugPrint(("Player joined: %s (%s) - Admin: %s"):format(name, identifier, tostring(Players[source].isAdmin)))

    TriggerClientEvent("sws-report:setPlayerData", source, {
        identifier = identifier,
        name = name,
        isAdmin = Players[source].isAdmin
    })

    local playerReports = GetPlayerReports(identifier)
    if #playerReports > 0 then
        TriggerClientEvent("sws-report:setReports", source, playerReports)
    end

    if Players[source].isAdmin then
        local allActiveReports = GetActiveReports()
        TriggerClientEvent("sws-report:setAllReports", source, allActiveReports)
    end

    broadcastPlayerOnlineStatus(identifier, true)
end)

---Player dropped handler
AddEventHandler("playerDropped", function(reason)
    local source = source

    if Players[source] then
        DebugPrint(("Player dropped: %s - Reason: %s"):format(Players[source].name, reason))
        broadcastPlayerOnlineStatus(Players[source].identifier, false)
    end

    Players[source] = nil
    Admins[source] = nil
end)

---Resource start handler
AddEventHandler("onResourceStart", function(resourceName)
    if resourceName ~= RESOURCE_NAME then return end

    PrintInfo("Resource started - Loading reports from database...")

    LoadReportsFromDatabase()

    PrintInfo(("Loaded %d active reports"):format(GetActiveReportCount()))
end)

---Resource stop handler
AddEventHandler("onResourceStop", function(resourceName)
    if resourceName ~= RESOURCE_NAME then return end

    PrintInfo("Resource stopping...")
end)

-- Exports
exports("IsAdmin", function(source)
    return IsPlayerAdmin(source)
end)

exports("GetOnlineAdmins", function()
    return GetOnlineAdmins()
end)

exports("GetPlayerData", function(source)
    return GetPlayerData(source)
end)

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(300000) -- 5 minutes
        local now = os.time()
        local cleaned = 0
        for identifier, lastReport in pairs(Cooldowns) do
            if now - lastReport > Config.Cooldown then
                Cooldowns[identifier] = nil
                cleaned = cleaned + 1
            end
        end
        if cleaned > 0 then
            DebugPrint(("Cleaned up %d expired cooldown entries"):format(cleaned))
        end
    end
end)
