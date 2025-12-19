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

    -- Use custom notification if configured
    if Config.CustomNotify then
        local success = pcall(Config.CustomNotify, source, message, notifyType)
        if success then return end
        -- Fall through to default if custom fails
    end

    -- Default built-in notification
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

---Compare semantic versions
---@param current string Current version (e.g. "1.0.0")
---@param latest string Latest version (e.g. "1.0.1")
---@return boolean isOutdated True if current < latest
local function isVersionOutdated(current, latest)
    local function parseVersion(v)
        local major, minor, patch = v:match("^(%d+)%.(%d+)%.(%d+)")
        return tonumber(major) or 0, tonumber(minor) or 0, tonumber(patch) or 0
    end

    local curMajor, curMinor, curPatch = parseVersion(current)
    local latMajor, latMinor, latPatch = parseVersion(latest)

    if latMajor > curMajor then return true end
    if latMajor == curMajor and latMinor > curMinor then return true end
    if latMajor == curMajor and latMinor == curMinor and latPatch > curPatch then return true end

    return false
end

---Check for updates from GitHub
local function checkForUpdates()
    local currentVersion = GetResourceMetadata(RESOURCE_NAME, "version", 0) or "0.0.0"
    local repoUrl = "https://raw.githubusercontent.com/SwisserDev/sws-report/main/fxmanifest.lua"

    PerformHttpRequest(repoUrl, function(statusCode, response)
        if statusCode ~= 200 or not response then
            PrintError("Failed to check for updates")
            return
        end

        local latestVersion = response:match('\nversion%s*"([^"]+)"')
        if not latestVersion then
            PrintError("Could not parse version from GitHub")
            return
        end

        if isVersionOutdated(currentVersion, latestVersion) then
            local boxWidth = 56
            local versionText = ("  Current: v%s  →  Latest: v%s"):format(currentVersion, latestVersion)
            local versionVisualLen = 26 + #currentVersion + #latestVersion 
            local versionPadding = string.rep(" ", boxWidth - versionVisualLen)

            print("^3╔════════════════════════════════════════════════════════╗^0")
            print("^3║^0             ^1UPDATE AVAILABLE^0 - ^5sws-report^0              ^3║^0")
            print("^3╠════════════════════════════════════════════════════════╣^0")
            print("^3║^0" .. versionText .. versionPadding .. "^3║^0")
            print("^3║^0  Download: ^4github.com/SwisserDev/sws-report/releases^0   ^3║^0")
            print("^3╚════════════════════════════════════════════════════════╝^0")
        else
            PrintInfo(("Running latest version v%s"):format(currentVersion))
        end
    end, "GET")
end

---Resource start handler
AddEventHandler("onResourceStart", function(resourceName)
    if resourceName ~= RESOURCE_NAME then return end

    PrintInfo("Resource started - Loading reports from database...")

    LoadReportsFromDatabase()

    PrintInfo(("Loaded %d active reports"):format(GetActiveReportCount()))

    checkForUpdates()
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
