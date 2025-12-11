local MAX_NOTE_LENGTH = 1000

---@class ReportNote
---@field id number Note ID
---@field reportId number Report ID
---@field adminId string Admin identifier
---@field adminName string Admin name
---@field note string Note content
---@field createdAt string Timestamp

---@class PlayerNote
---@field id number Note ID
---@field playerId string Player identifier
---@field adminId string Admin identifier
---@field adminName string Admin name
---@field note string Note content
---@field createdAt string Timestamp

---Get all notes for a report
---@param reportId number Report ID
---@return ReportNote[]
local function getReportNotes(reportId)
    local results = MySQL.query.await([[
        SELECT id, report_id, admin_id, admin_name, note, created_at
        FROM report_notes
        WHERE report_id = ?
        ORDER BY created_at DESC
    ]], { reportId })

    local notes = {}
    for _, row in ipairs(results or {}) do
        table.insert(notes, {
            id = row.id,
            reportId = row.report_id,
            adminId = row.admin_id,
            adminName = row.admin_name,
            note = row.note,
            createdAt = row.created_at
        })
    end

    return notes
end

---Get all notes for a player
---@param playerId string Player identifier
---@return PlayerNote[]
local function getPlayerNotes(playerId)
    local results = MySQL.query.await([[
        SELECT id, player_id, admin_id, admin_name, note, created_at
        FROM player_notes
        WHERE player_id = ?
        ORDER BY created_at DESC
    ]], { playerId })

    local notes = {}
    for _, row in ipairs(results or {}) do
        table.insert(notes, {
            id = row.id,
            playerId = row.player_id,
            adminId = row.admin_id,
            adminName = row.admin_name,
            note = row.note,
            createdAt = row.created_at
        })
    end

    return notes
end

---Add note to report
RegisterNetEvent("sws-report:addReportNote", function(reportId, note)
    local source = source

    if not IsValidReportId(reportId) then
        return
    end

    if not IsPlayerAdmin(source) then
        NotifyPlayer(source, L("error_no_permission"), "error")
        return
    end

    if type(note) ~= "string" or #note == 0 then
        NotifyPlayer(source, L("error_note_empty"), "error")
        return
    end

    local sanitizedNote = SanitizeString(note, MAX_NOTE_LENGTH)
    if #sanitizedNote > MAX_NOTE_LENGTH then
        NotifyPlayer(source, L("error_note_too_long", MAX_NOTE_LENGTH), "error")
        return
    end

    local report = Reports[reportId]
    if not report then
        NotifyPlayer(source, L("error_not_found"), "error")
        return
    end

    local admin = GetPlayerData(source)

    local insertId = MySQL.insert.await([[
        INSERT INTO report_notes (report_id, admin_id, admin_name, note)
        VALUES (?, ?, ?, ?)
    ]], { reportId, admin.identifier, admin.name, sanitizedNote })

    if not insertId then
        NotifyPlayer(source, L("error_generic"), "error")
        return
    end

    local newNote = {
        id = insertId,
        reportId = reportId,
        adminId = admin.identifier,
        adminName = admin.name,
        note = sanitizedNote,
        createdAt = os.date("%Y-%m-%d %H:%M:%S")
    }

    for adminSource, isAdmin in pairs(Admins) do
        if isAdmin then
            TriggerClientEvent("sws-report:reportNoteAdded", adminSource, newNote)
        end
    end

    NotifyPlayer(source, L("note_added"), "success")
    DebugPrint(("Report note added to #%d by %s"):format(reportId, admin.name))
end)

---Delete report note
RegisterNetEvent("sws-report:deleteReportNote", function(noteId)
    local source = source

    if type(noteId) ~= "number" or noteId <= 0 then
        return
    end

    if not IsPlayerAdmin(source) then
        NotifyPlayer(source, L("error_no_permission"), "error")
        return
    end

    local result = MySQL.query.await("SELECT report_id FROM report_notes WHERE id = ?", { noteId })
    if not result or #result == 0 then
        NotifyPlayer(source, L("error_not_found"), "error")
        return
    end

    local reportId = result[1].report_id

    MySQL.query.await("DELETE FROM report_notes WHERE id = ?", { noteId })

    for adminSource, isAdmin in pairs(Admins) do
        if isAdmin then
            TriggerClientEvent("sws-report:reportNoteDeleted", adminSource, { noteId = noteId, reportId = reportId })
        end
    end

    NotifyPlayer(source, L("note_deleted"), "success")
end)

---Get report notes
RegisterNetEvent("sws-report:getReportNotes", function(reportId)
    local source = source

    if not IsValidReportId(reportId) then
        return
    end

    if not IsPlayerAdmin(source) then
        return
    end

    local notes = getReportNotes(reportId)
    TriggerClientEvent("sws-report:setReportNotes", source, reportId, notes)
end)

---Add note to player
RegisterNetEvent("sws-report:addPlayerNote", function(playerId, note)
    local source = source

    if type(playerId) ~= "string" or #playerId == 0 or #playerId > 100 then
        return
    end

    if not IsPlayerAdmin(source) then
        NotifyPlayer(source, L("error_no_permission"), "error")
        return
    end

    if type(note) ~= "string" or #note == 0 then
        NotifyPlayer(source, L("error_note_empty"), "error")
        return
    end

    local sanitizedNote = SanitizeString(note, MAX_NOTE_LENGTH)
    if #sanitizedNote > MAX_NOTE_LENGTH then
        NotifyPlayer(source, L("error_note_too_long", MAX_NOTE_LENGTH), "error")
        return
    end

    local admin = GetPlayerData(source)

    local insertId = MySQL.insert.await([[
        INSERT INTO player_notes (player_id, admin_id, admin_name, note)
        VALUES (?, ?, ?, ?)
    ]], { playerId, admin.identifier, admin.name, sanitizedNote })

    if not insertId then
        NotifyPlayer(source, L("error_generic"), "error")
        return
    end

    local newNote = {
        id = insertId,
        playerId = playerId,
        adminId = admin.identifier,
        adminName = admin.name,
        note = sanitizedNote,
        createdAt = os.date("%Y-%m-%d %H:%M:%S")
    }

    for adminSource, isAdmin in pairs(Admins) do
        if isAdmin then
            TriggerClientEvent("sws-report:playerNoteAdded", adminSource, newNote)
        end
    end

    NotifyPlayer(source, L("note_added"), "success")
    DebugPrint(("Player note added for %s by %s"):format(playerId, admin.name))
end)

---Delete player note
RegisterNetEvent("sws-report:deletePlayerNote", function(noteId)
    local source = source

    if type(noteId) ~= "number" or noteId <= 0 then
        return
    end

    if not IsPlayerAdmin(source) then
        NotifyPlayer(source, L("error_no_permission"), "error")
        return
    end

    local result = MySQL.query.await("SELECT player_id FROM player_notes WHERE id = ?", { noteId })
    if not result or #result == 0 then
        NotifyPlayer(source, L("error_not_found"), "error")
        return
    end

    local playerId = result[1].player_id

    MySQL.query.await("DELETE FROM player_notes WHERE id = ?", { noteId })

    for adminSource, isAdmin in pairs(Admins) do
        if isAdmin then
            TriggerClientEvent("sws-report:playerNoteDeleted", adminSource, { noteId = noteId, playerId = playerId })
        end
    end

    NotifyPlayer(source, L("note_deleted"), "success")
end)

---Get player notes
RegisterNetEvent("sws-report:getPlayerNotes", function(playerId)
    local source = source

    if type(playerId) ~= "string" or #playerId == 0 or #playerId > 100 then
        return
    end

    if not IsPlayerAdmin(source) then
        return
    end

    local notes = getPlayerNotes(playerId)
    TriggerClientEvent("sws-report:setPlayerNotes", source, playerId, notes)
end)

-- Exports
exports("GetReportNotes", getReportNotes)
exports("GetPlayerNotes", getPlayerNotes)
