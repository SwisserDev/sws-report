---@class HistoryReport
---@field id number Report ID
---@field playerId string Player identifier
---@field playerName string Player name
---@field subject string Report subject
---@field category string Report category
---@field description string | nil Report description
---@field status string Report status
---@field claimedBy string | nil Admin identifier who claimed
---@field claimedByName string | nil Admin name who claimed
---@field priority number Priority level
---@field createdAt string Creation timestamp
---@field resolvedAt string | nil Resolution timestamp

---@class PlayerIdentifiers
---@field license string | nil License identifier
---@field steam string | nil Steam identifier
---@field discord string | nil Discord identifier
---@field fivem string | nil FiveM identifier

---@class PlayerHistory
---@field playerId string Player identifier
---@field playerName string Player name
---@field totalReports number Total number of reports
---@field openReports number Number of open reports
---@field resolvedReports number Number of resolved reports
---@field reports HistoryReport[] List of reports
---@field notes PlayerNote[] List of admin notes
---@field identifiers PlayerIdentifiers | nil Player identifiers (from database)

---Get player report history
---@param playerId string Player identifier
---@param limit? number Max reports to return (default 50)
---@return PlayerHistory
local function getPlayerHistory(playerId, limit)
    limit = limit or 50

    local results = MySQL.query.await([[
        SELECT id, player_id, player_name, subject, category, description,
               status, claimed_by, claimed_by_name, priority, created_at, resolved_at
        FROM reports
        WHERE player_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    ]], { playerId, limit })

    local reports = {}
    local playerName = nil
    local openCount = 0
    local resolvedCount = 0

    for _, row in ipairs(results or {}) do
        if not playerName then
            playerName = row.player_name
        end

        if row.status == "resolved" then
            resolvedCount = resolvedCount + 1
        else
            openCount = openCount + 1
        end

        table.insert(reports, {
            id = row.id,
            playerId = row.player_id,
            playerName = row.player_name,
            subject = row.subject,
            category = row.category,
            description = row.description,
            status = row.status,
            claimedBy = row.claimed_by,
            claimedByName = row.claimed_by_name,
            priority = row.priority,
            createdAt = row.created_at,
            resolvedAt = row.resolved_at
        })
    end

    local totalResults = MySQL.query.await([[
        SELECT COUNT(*) as total FROM reports WHERE player_id = ?
    ]], { playerId })

    local totalReports = totalResults and totalResults[1] and totalResults[1].total or #reports

    local notes = exports["sws-report"]:GetPlayerNotes(playerId) or {}

    -- Load player identifiers from database (works for offline players too)
    local identifiers = nil
    local dbIdentifiers = MySQL.query.await([[
        SELECT license, steam, discord, fivem
        FROM player_identifiers
        WHERE player_id = ?
    ]], { playerId })

    if dbIdentifiers and dbIdentifiers[1] then
        identifiers = dbIdentifiers[1]
    end

    return {
        playerId = playerId,
        playerName = playerName or "Unknown",
        totalReports = totalReports,
        openReports = openCount,
        resolvedReports = resolvedCount,
        reports = reports,
        notes = notes,
        identifiers = identifiers
    }
end

---Get player history event
RegisterNetEvent("sws-report:getPlayerHistory", function(playerId)
    local source = source

    if type(playerId) ~= "string" or #playerId == 0 or #playerId > 100 then
        return
    end

    if not IsPlayerAdmin(source) then
        NotifyPlayer(source, L("error_no_permission"), "error")
        return
    end

    local history = getPlayerHistory(playerId)
    TriggerClientEvent("sws-report:setPlayerHistory", source, history)

    DebugPrint(("Player history requested for %s by source %d"):format(playerId, source))
end)

-- Export function to get player history
exports("GetPlayerHistory", getPlayerHistory)
