---@type table<integer, PlayerData> Online players cache
Players = {}

---@type table<integer, boolean> Admin cache
Admins = {}

---@type table<integer, Report> Active reports cache
Reports = {}

---@type table<string, integer> Player cooldowns (identifier -> timestamp)
Cooldowns = {}

---@type boolean Whether voice message database columns exist
VoiceMessagesAvailable = false

---@type table<integer, string|false> Player source -> group name or false (legacy) or "_legacy_admin"
PlayerGroups = {}

---@type table<string, table<string, boolean>> Group name -> {permission -> true}
ResolvedGroupPermissions = {}

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

---Parse and save player identifiers to database
---@param source integer Player server ID
---@param primaryIdentifier string Primary identifier for this player
local function savePlayerIdentifiers(source, primaryIdentifier)
    local identifiers = GetPlayerIdentifiers(source) or {}
    local parsed = {
        license = nil,
        steam = nil,
        discord = nil,
        fivem = nil
    }

    for _, id in ipairs(identifiers) do
        if string.find(id, "license:") then
            parsed.license = id
        elseif string.find(id, "steam:") then
            parsed.steam = id
        elseif string.find(id, "discord:") then
            parsed.discord = id
        elseif string.find(id, "fivem:") then
            parsed.fivem = id
        end
    end

    -- Upsert into database
    MySQL.insert([[
        INSERT INTO player_identifiers (player_id, license, steam, discord, fivem)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            license = VALUES(license),
            steam = VALUES(steam),
            discord = VALUES(discord),
            fivem = VALUES(fivem)
    ]], { primaryIdentifier, parsed.license, parsed.steam, parsed.discord, parsed.fivem })
end

---Resolve all group permissions with inheritance (called once at resource start)
local function resolveAllGroupPermissions()
    ResolvedGroupPermissions = {}

    if not Config.Permissions or not Config.Permissions.groups then
        return
    end

    local function resolveGroup(groupName, visited)
        if ResolvedGroupPermissions[groupName] then
            return ResolvedGroupPermissions[groupName]
        end

        visited = visited or {}
        if visited[groupName] then
            PrintError(("Circular inheritance detected for group '%s'"):format(groupName))
            return {}
        end
        visited[groupName] = true

        local group = Config.Permissions.groups[groupName]
        if not group then
            PrintError(("Group '%s' not found in Config.Permissions.groups"):format(groupName))
            return {}
        end

        local perms = {}

        -- Inherit from parent first
        if group.inherits then
            local parentPerms = resolveGroup(group.inherits, visited)
            for perm, val in pairs(parentPerms) do
                perms[perm] = val
            end
        end

        -- Add own permissions
        for _, perm in ipairs(group.permissions or {}) do
            perms[perm] = true
        end

        ResolvedGroupPermissions[groupName] = perms
        return perms
    end

    for groupName in pairs(Config.Permissions.groups) do
        resolveGroup(groupName)
    end

    DebugPrint(("Resolved permissions for %d groups"):format(#(function() local n = 0; for _ in pairs(ResolvedGroupPermissions) do n = n + 1 end; return n end and {ResolvedGroupPermissions} or {})))
end

---Determine which RBAC group a player belongs to
---@param source integer Player server ID
---@return string|nil groupName The group name or nil if no RBAC group matches
local function resolvePlayerGroup(source)
    if not Config.Permissions then
        return nil
    end

    local identifiers = getAllIdentifiers(source)

    -- Check identifier-based groups first (highest priority)
    if Config.Permissions.identifierGroups then
        for _, identifier in ipairs(identifiers) do
            local group = Config.Permissions.identifierGroups[identifier]
            if group and Config.Permissions.groups[group] then
                return group
            end
        end
    end

    -- Check ACE-based groups, pick the one with most permissions (deepest inheritance)
    if Config.Permissions.aceGroups then
        local bestGroup = nil
        local bestPermCount = -1

        for ace, groupName in pairs(Config.Permissions.aceGroups) do
            if IsPlayerAceAllowed(source, ace) then
                local perms = ResolvedGroupPermissions[groupName]
                local count = 0
                if perms then
                    for _ in pairs(perms) do count = count + 1 end
                end
                if count > bestPermCount then
                    bestPermCount = count
                    bestGroup = groupName
                end
            end
        end

        if bestGroup then
            return bestGroup
        end
    end

    return nil
end

---Check if player is admin
---@param source integer Player server ID
---@return boolean
function IsPlayerAdmin(source)
    if Admins[source] ~= nil then
        return Admins[source]
    end

    -- RBAC path: check if player belongs to any group
    if Config.Permissions then
        local group = resolvePlayerGroup(source)
        if group then
            Admins[source] = true
            PlayerGroups[source] = group
            return true
        end
    end

    -- Legacy path
    if IsPlayerAceAllowed(source, Config.AdminAcePermission) then
        Admins[source] = true
        PlayerGroups[source] = "_legacy_admin"
        return true
    end

    local identifiers = getAllIdentifiers(source)
    for _, identifier in ipairs(identifiers) do
        for _, adminId in ipairs(Config.AdminIdentifiers) do
            if identifier == adminId then
                Admins[source] = true
                PlayerGroups[source] = "_legacy_admin"
                return true
            end
        end
    end

    Admins[source] = false
    PlayerGroups[source] = false
    return false
end

---Check if player has a specific permission
---@param source integer Player server ID
---@param permission string Permission string from Permission enum
---@return boolean
function HasPermission(source, permission)
    if not IsPlayerAdmin(source) then
        return false
    end

    -- Legacy admins have all permissions
    if PlayerGroups[source] == "_legacy_admin" then
        return true
    end

    -- No RBAC configured = all permissions
    if not Config.Permissions then
        return true
    end

    local group = PlayerGroups[source]
    if not group or group == false then
        return false
    end

    local perms = ResolvedGroupPermissions[group]
    if not perms then
        return false
    end

    return perms[permission] == true
end

---Get all permissions for a player as a table
---@param source integer Player server ID
---@return table<string, boolean>
function GetPlayerPermissions(source)
    if not IsPlayerAdmin(source) then
        return {}
    end

    -- Legacy admins or no RBAC: all permissions
    if PlayerGroups[source] == "_legacy_admin" or not Config.Permissions then
        local allPerms = {}
        for _, perm in pairs(Permission) do
            allPerms[perm] = true
        end
        return allPerms
    end

    local group = PlayerGroups[source]
    if not group or group == false then
        return {}
    end

    return ResolvedGroupPermissions[group] or {}
end

---Get player's group name
---@param source integer Player server ID
---@return string|nil
function GetPlayerGroup(source)
    local group = PlayerGroups[source]
    if group and group ~= false and group ~= "_legacy_admin" then
        return group
    end
    if group == "_legacy_admin" then
        return "admin"
    end
    return nil
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

    -- Wait for ACE permissions to be fully loaded
    -- This fixes the race condition where IsPlayerAceAllowed returns false
    -- because the player's permissions haven't synced yet
    Citizen.Wait(1000)

    -- Verify player is still connected after delay
    if not GetPlayerName(source) then
        return
    end

    Players[source] = {
        source = source,
        identifier = identifier,
        name = name,
        isAdmin = IsPlayerAdmin(source)
    }

    -- Save all player identifiers to database for offline lookup
    savePlayerIdentifiers(source, identifier)

    DebugPrint(("Player joined: %s (%s) - Admin: %s"):format(name, identifier, tostring(Players[source].isAdmin)))

    local permissions = Players[source].isAdmin and GetPlayerPermissions(source) or {}
    local group = Players[source].isAdmin and GetPlayerGroup(source) or nil

    TriggerClientEvent("sws-report:setPlayerData", source, {
        identifier = identifier,
        name = name,
        isAdmin = Players[source].isAdmin,
        permissions = permissions,
        group = group,
        voiceMessagesEnabled = VoiceMessagesAvailable and Config.VoiceMessages.enabled
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
    PlayerGroups[source] = nil
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

---Check if voice message database columns exist
---@return boolean
local function checkVoiceMigration()
    local result = MySQL.query.await([[
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'report_messages'
        AND COLUMN_NAME = 'message_type'
    ]])
    return result and #result > 0
end

---Print voice migration warning box
local function printVoiceMigrationWarning()
    print("^3╔══════════════════════════════════════════════════════════════╗^0")
    print("^3║^0              ^1VOICE MESSAGE MIGRATION REQUIRED^0               ^3║^0")
    print("^3╠══════════════════════════════════════════════════════════════╣^0")
    print("^3║^0  Voice message feature is ^1DISABLED^0 - database not migrated  ^3║^0")
    print("^3║^0                                                              ^3║^0")
    print("^3║^0  Run this SQL to enable voice messages:                      ^3║^0")
    print("^3║^0  ^5source sql/migrate_voice_messages.sql^0                       ^3║^0")
    print("^3║^0                                                              ^3║^0")
    print("^3║^0  Text messages continue to work normally.                    ^3║^0")
    print("^3╚══════════════════════════════════════════════════════════════╝^0")
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

    resolveAllGroupPermissions()
    LoadReportsFromDatabase()

    PrintInfo(("Loaded %d active reports"):format(GetActiveReportCount()))

    VoiceMessagesAvailable = checkVoiceMigration()
    if VoiceMessagesAvailable then
        if not Config.Discord.enabled or not Config.Discord.webhook or Config.Discord.webhook == "" then
            VoiceMessagesAvailable = false
            PrintWarn("Voice messages: disabled - Discord webhook required for audio storage")
            PrintWarn("Configure Config.Discord.enabled and Config.Discord.webhook to enable voice messages")
        else
            PrintInfo("Voice messages: enabled")
        end
    else
        printVoiceMigrationWarning()
    end

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

exports("HasPermission", function(source, permission)
    return HasPermission(source, permission)
end)

exports("GetPlayerGroup", function(source)
    return GetPlayerGroup(source)
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
