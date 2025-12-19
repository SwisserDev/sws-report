local MAX_SUBJECT_LENGTH = 128
local MAX_DESCRIPTION_LENGTH = 2000

function LoadReportsFromDatabase()
    local results = MySQL.query.await([[
        SELECT r.*,
               GROUP_CONCAT(
                   JSON_OBJECT(
                       'id', m.id,
                       'reportId', m.report_id,
                       'senderId', m.sender_id,
                       'senderName', m.sender_name,
                       'senderType', m.sender_type,
                       'message', m.message,
                       'createdAt', m.created_at
                   )
               ) as messages
        FROM reports r
        LEFT JOIN report_messages m ON r.id = m.report_id
        WHERE r.status != 'resolved'
        GROUP BY r.id
        ORDER BY r.created_at DESC
    ]])

    if not results then return end

    for _, row in ipairs(results) do
        local messages = {}

        if row.messages then
            local msgArray = json.decode("[" .. row.messages .. "]")
            if msgArray then
                for _, msg in ipairs(msgArray) do
                    if msg.id then
                        table.insert(messages, msg)
                    end
                end
            end
        end

        local reportData = {
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
            playerCoords = DeserializeCoords(row.player_coords),
            createdAt = row.created_at,
            updatedAt = row.updated_at,
            resolvedAt = row.resolved_at,
            messages = messages
        }

        Reports[row.id] = Report:new(reportData)
    end
end

---Get active report count
---@return integer
function GetActiveReportCount()
    local count = 0
    for _ in pairs(Reports) do
        count = count + 1
    end
    return count
end

---Get all active reports
---@return ReportData[]
function GetActiveReports()
    local reports = {}
    for _, report in pairs(Reports) do
        if not report:isResolved() then
            local reportData = report:serialize()
            reportData.isPlayerOnline = IsPlayerOnline(report:getPlayerId())
            table.insert(reports, reportData)
        end
    end

    table.sort(reports, function(a, b)
        return a.createdAt > b.createdAt
    end)

    return reports
end

---Get player's reports
---@param identifier string Player identifier
---@param includeResolved? boolean Include resolved reports from database
---@return ReportData[]
function GetPlayerReports(identifier, includeResolved)
    local reports = {}

    -- Get active reports from cache
    for _, report in pairs(Reports) do
        if report:getPlayerId() == identifier then
            local reportData = report:serialize()
            reportData.isPlayerOnline = IsPlayerOnline(report:getPlayerId())
            table.insert(reports, reportData)
        end
    end

    if includeResolved then
        local resolvedResults = MySQL.query.await([[
            SELECT * FROM reports
            WHERE player_id = ? AND status = 'resolved'
            ORDER BY resolved_at DESC
            LIMIT 50
        ]], { identifier })

        for _, row in ipairs(resolvedResults or {}) do
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
                playerCoords = DeserializeCoords(row.player_coords),
                createdAt = row.created_at,
                updatedAt = row.updated_at,
                resolvedAt = row.resolved_at,
                isPlayerOnline = true,
                messages = {}
            })
        end
    end

    table.sort(reports, function(a, b)
        return a.createdAt > b.createdAt
    end)

    return reports
end

---Get player's own reports (with optional resolved)
RegisterNetEvent("sws-report:getMyReports", function(includeResolved)
    local source = source
    local player = GetPlayerData(source)

    if not player then return end

    if includeResolved ~= nil and type(includeResolved) ~= "boolean" then
        return
    end

    local reports = GetPlayerReports(player.identifier, includeResolved)
    TriggerClientEvent("sws-report:setReports", source, reports)
end)

---Get player's active report count
---@param identifier string Player identifier
---@return integer
local function getPlayerActiveReportCount(identifier)
    local count = 0
    for _, report in pairs(Reports) do
        if report:getPlayerId() == identifier and not report:isResolved() then
            count = count + 1
        end
    end
    return count
end

---Check if player is on cooldown
---@param identifier string Player identifier
---@return boolean onCooldown
---@return integer remainingTime Remaining seconds
local function checkCooldown(identifier)
    local lastReport = Cooldowns[identifier]

    if not lastReport then
        return false, 0
    end

    local now = os.time()
    local elapsed = now - lastReport

    if elapsed < Config.Cooldown then
        return true, Config.Cooldown - elapsed
    end

    return false, 0
end

---Broadcast report update to relevant clients
---@param report Report Report instance
---@param eventType string Event type
local function broadcastReportUpdate(report, eventType)
    local reportData = report:serialize()
    reportData.isPlayerOnline = IsPlayerOnline(report:getPlayerId())

    local playerData = GetPlayerByIdentifier(report:getPlayerId())
    if playerData then
        TriggerClientEvent("sws-report:" .. eventType, playerData.source, reportData)
    end

    for source, isAdmin in pairs(Admins) do
        if isAdmin then
            TriggerClientEvent("sws-report:" .. eventType, source, reportData)
        end
    end
end

---Create report event
---@param data table Report data from client
RegisterNetEvent("sws-report:createReport", function(data)
    local source = source

    if type(data) ~= "table" then
        return
    end

    local player = GetPlayerData(source)

    if not player then
        NotifyPlayer(source, L("error_generic"), "error")
        return
    end

    local onCooldown, remaining = checkCooldown(player.identifier)
    if onCooldown then
        NotifyPlayer(source, L("error_cooldown", remaining), "error")
        return
    end

    local activeCount = getPlayerActiveReportCount(player.identifier)
    if activeCount >= Config.MaxActiveReports then
        NotifyPlayer(source, L("error_max_reports", Config.MaxActiveReports), "error")
        return
    end

    if type(data.subject) ~= "string" or data.subject == "" then
        NotifyPlayer(source, L("error_subject_required"), "error")
        return
    end

    if type(data.category) ~= "string" then
        NotifyPlayer(source, L("error_invalid_category"), "error")
        return
    end

    local subject = SanitizeString(data.subject, MAX_SUBJECT_LENGTH)
    if #subject > MAX_SUBJECT_LENGTH then
        NotifyPlayer(source, L("error_subject_too_long", MAX_SUBJECT_LENGTH), "error")
        return
    end

    if not IsValidCategory(data.category) then
        NotifyPlayer(source, L("error_invalid_category"), "error")
        return
    end

    local description = nil
    if data.description ~= nil then
        if type(data.description) ~= "string" then
            return
        end
        if data.description ~= "" then
            description = SanitizeString(data.description, MAX_DESCRIPTION_LENGTH)
        end
    end

    local coords = nil
    if data.coords ~= nil then
        if not IsValidCoords(data.coords) then
            return
        end
        coords = SerializeCoords(data.coords)
    end

    local insertId = MySQL.insert.await([[
        INSERT INTO reports (player_id, player_name, subject, category, description, player_coords)
        VALUES (?, ?, ?, ?, ?, ?)
    ]], {
        player.identifier,
        player.name,
        subject,
        data.category,
        description,
        coords
    })

    if not insertId then
        NotifyPlayer(source, L("report_creation_failed"), "error")
        return
    end

    Cooldowns[player.identifier] = os.time()

    local reportData = {
        id = insertId,
        playerId = player.identifier,
        playerName = player.name,
        subject = subject,
        category = data.category,
        description = description,
        status = ReportStatus.OPEN,
        priority = 0,
        playerCoords = data.coords,
        createdAt = os.date("!%Y-%m-%dT%H:%M:%SZ"),
        updatedAt = os.date("!%Y-%m-%dT%H:%M:%SZ"),
        messages = {}
    }

    local report = Report:new(reportData)
    Reports[insertId] = report

    local serializedReport = report:serialize()
    serializedReport.isPlayerOnline = true

    TriggerClientEvent("sws-report:reportCreated", source, serializedReport)
    NotifyPlayer(source, L("report_created"), "success")

    NotifyAdmins(L("new_report_from", player.name), "info", source)

    for adminSource, isAdmin in pairs(Admins) do
        if isAdmin then
            TriggerClientEvent("sws-report:newReport", adminSource, serializedReport)
        end
    end

    TriggerEvent("sws-report:discord:newReport", serializedReport)

    DebugPrint(("Report #%d created by %s: %s"):format(insertId, player.name, subject))
end)

---Claim report event
RegisterNetEvent("sws-report:claimReport", function(reportId)
    local source = source

    if not IsValidReportId(reportId) then
        return
    end

    if not IsPlayerAdmin(source) then
        NotifyPlayer(source, L("error_no_permission"), "error")
        return
    end

    local report = Reports[reportId]
    if not report then
        NotifyPlayer(source, L("error_not_found"), "error")
        return
    end

    if report:isClaimed() then
        NotifyPlayer(source, L("error_already_claimed"), "error")
        return
    end

    local admin = GetPlayerData(source)
    report:claim(admin.identifier, admin.name)

    MySQL.update.await([[
        UPDATE reports SET status = ?, claimed_by = ?, claimed_by_name = ?, updated_at = NOW()
        WHERE id = ?
    ]], { ReportStatus.CLAIMED, admin.identifier, admin.name, reportId })

    broadcastReportUpdate(report, "reportUpdated")
    NotifyPlayer(source, L("report_claimed"), "success")

    TriggerEvent("sws-report:discord:claimed", report:serialize(), admin)

    DebugPrint(("Report #%d claimed by %s"):format(reportId, admin.name))
end)

---Unclaim report event
RegisterNetEvent("sws-report:unclaimReport", function(reportId)
    local source = source

    if not IsValidReportId(reportId) then
        return
    end

    if not IsPlayerAdmin(source) then
        NotifyPlayer(source, L("error_no_permission"), "error")
        return
    end

    local report = Reports[reportId]
    if not report then
        NotifyPlayer(source, L("error_not_found"), "error")
        return
    end

    if not report:isClaimed() then
        NotifyPlayer(source, L("error_not_claimed"), "error")
        return
    end

    report:unclaim()

    MySQL.update.await([[
        UPDATE reports SET status = ?, claimed_by = NULL, claimed_by_name = NULL, updated_at = NOW()
        WHERE id = ?
    ]], { ReportStatus.OPEN, reportId })

    broadcastReportUpdate(report, "reportUpdated")
    NotifyPlayer(source, L("report_unclaimed"), "success")

    local admin = GetPlayerData(source)
    TriggerEvent("sws-report:discord:unclaimed", report:serialize(), admin)

    DebugPrint(("Report #%d unclaimed"):format(reportId))
end)

---Resolve report event
RegisterNetEvent("sws-report:resolveReport", function(reportId)
    local source = source

    if not IsValidReportId(reportId) then
        return
    end

    if not IsPlayerAdmin(source) then
        NotifyPlayer(source, L("error_no_permission"), "error")
        return
    end

    local report = Reports[reportId]
    if not report then
        NotifyPlayer(source, L("error_not_found"), "error")
        return
    end

    report:resolve()

    MySQL.update.await([[
        UPDATE reports SET status = ?, resolved_at = NOW(), updated_at = NOW()
        WHERE id = ?
    ]], { ReportStatus.RESOLVED, reportId })

    broadcastReportUpdate(report, "reportUpdated")

    Reports[reportId] = nil

    NotifyPlayer(source, L("report_resolved"), "success")

    local admin = GetPlayerData(source)
    TriggerEvent("sws-report:discord:resolved", report:serialize(), admin)

    DebugPrint(("Report #%d resolved by %s"):format(reportId, admin.name))
end)

---Delete report event
RegisterNetEvent("sws-report:deleteReport", function(reportId)
    local source = source

    if not IsValidReportId(reportId) then
        return
    end

    local player = GetPlayerData(source)

    if not player then return end

    local report = Reports[reportId]
    if not report then
        NotifyPlayer(source, L("error_not_found"), "error")
        return
    end

    local isAdmin = IsPlayerAdmin(source)
    local isOwner = report:getPlayerId() == player.identifier

    if not isAdmin and not isOwner then
        NotifyPlayer(source, L("error_cannot_delete"), "error")
        return
    end

    if not isAdmin and report:isClaimed() then
        NotifyPlayer(source, L("error_cannot_delete"), "error")
        return
    end

    MySQL.query.await("DELETE FROM reports WHERE id = ?", { reportId })

    local reportData = report:serialize()
    Reports[reportId] = nil

    local ownerData = GetPlayerByIdentifier(reportData.playerId)
    if ownerData then
        TriggerClientEvent("sws-report:reportDeleted", ownerData.source, reportId)
    end

    for adminSource, adminStatus in pairs(Admins) do
        if adminStatus then
            TriggerClientEvent("sws-report:reportDeleted", adminSource, reportId)
        end
    end

    NotifyPlayer(source, L("report_deleted"), "success")

    TriggerEvent("sws-report:discord:deleted", reportData, player)

    DebugPrint(("Report #%d deleted by %s"):format(reportId, player.name))
end)

RegisterNetEvent("sws-report:getReports", function(filter)
    local source = source

    if not IsPlayerAdmin(source) then
        NotifyPlayer(source, L("error_no_permission"), "error")
        return
    end

    local query = "SELECT * FROM reports WHERE 1=1"
    local params = {}

    if filter then

        if type(filter) ~= "table" then
            return
        end


        if filter.status then
            if type(filter.status) ~= "string" then
                return
            end
            if filter.status ~= "all" then
                if not IsValidReportStatus(filter.status) then
                    return
                end
                query = query .. " AND status = ?"
                table.insert(params, filter.status)
            end
        end

        if filter.category then
            if type(filter.category) ~= "string" then
                return
            end
            if filter.category ~= "all" then
                if not IsValidCategory(filter.category) then
                    return
                end
                query = query .. " AND category = ?"
                table.insert(params, filter.category)
            end
        end

        if filter.playerId then
            if type(filter.playerId) ~= "string" or #filter.playerId > 100 then
                return
            end
            query = query .. " AND player_id = ?"
            table.insert(params, filter.playerId)
        end

        if not filter.includeResolved then
            query = query .. " AND status != 'resolved'"
        end
    else
        query = query .. " AND status != 'resolved'"
    end

    query = query .. " ORDER BY created_at DESC LIMIT 100"

    local results = MySQL.query.await(query, params)

    local reports = {}
    for _, row in ipairs(results or {}) do
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
            playerCoords = DeserializeCoords(row.player_coords),
            createdAt = row.created_at,
            updatedAt = row.updated_at,
            resolvedAt = row.resolved_at,
            isPlayerOnline = IsPlayerOnline(row.player_id)
        })
    end

    TriggerClientEvent("sws-report:setAllReports", source, reports)
end)


exports("GetReports", function(filter)
    if filter then
        local filtered = {}
        for _, report in pairs(Reports) do
            local include = true

            if filter.status and report:getStatus() ~= filter.status then
                include = false
            end

            if filter.playerId and report:getPlayerId() ~= filter.playerId then
                include = false
            end

            if include then
                table.insert(filtered, report:serialize())
            end
        end
        return filtered
    end

    return GetActiveReports()
end)

exports("GetReport", function(reportId)
    local report = Reports[reportId]
    if report then
        return report:serialize()
    end
    return nil
end)

exports("CloseReport", function(reportId)
    local report = Reports[reportId]
    if not report then return false end

    report:resolve()

    MySQL.update.await([[
        UPDATE reports SET status = ?, resolved_at = NOW(), updated_at = NOW()
        WHERE id = ?
    ]], { ReportStatus.RESOLVED, reportId })

    Reports[reportId] = nil
    return true
end)

---Validate priority value
---@param priority number Priority value
---@return boolean isValid
local function isValidPriority(priority)
    return type(priority) == "number" and priority >= 0 and priority <= 3
end

---Set report priority
RegisterNetEvent("sws-report:setPriority", function(reportId, priority)
    local source = source

    if not IsValidReportId(reportId) then
        return
    end

    if not isValidPriority(priority) then
        return
    end

    if not IsPlayerAdmin(source) then
        NotifyPlayer(source, L("error_no_permission"), "error")
        return
    end

    local report = Reports[reportId]
    if not report then
        NotifyPlayer(source, L("error_not_found"), "error")
        return
    end

    report:setPriority(priority)

    MySQL.update.await([[
        UPDATE reports SET priority = ?, updated_at = NOW()
        WHERE id = ?
    ]], { priority, reportId })

    broadcastReportUpdate(report, "reportUpdated")
    NotifyPlayer(source, L("priority_updated"), "success")

    local admin = GetPlayerData(source)
    DebugPrint(("Report #%d priority set to %d by %s"):format(reportId, priority, admin.name))
end)
