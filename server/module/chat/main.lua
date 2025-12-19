local MAX_MESSAGE_LENGTH = 1000

---Send message in report
---@param source integer Sender server ID
---@param reportId integer Report ID
---@param message string Message content
RegisterNetEvent("sws-report:sendMessage", function(reportId, message)
    local source = source

    if not IsValidReportId(reportId) then
        return
    end

    if type(message) ~= "string" then
        return
    end

    local player = GetPlayerData(source)

    if not player then
        NotifyPlayer(source, L("error_generic"), "error")
        return
    end

    local report = Reports[reportId]
    if not report then
        NotifyPlayer(source, L("error_not_found"), "error")
        return
    end

    local isAdmin = IsPlayerAdmin(source)
    local isOwner = report:getPlayerId() == player.identifier

    if not isAdmin and not isOwner then
        NotifyPlayer(source, L("error_no_permission"), "error")
        return
    end

    if not message or message == "" then
        NotifyPlayer(source, L("error_message_empty"), "error")
        return
    end

    message = SanitizeString(message, MAX_MESSAGE_LENGTH)

    local senderType = isAdmin and SenderType.ADMIN or SenderType.PLAYER

    local insertId = MySQL.insert.await([[
        INSERT INTO report_messages (report_id, sender_id, sender_name, sender_type, message)
        VALUES (?, ?, ?, ?, ?)
    ]], {
        reportId,
        player.identifier,
        player.name,
        senderType,
        message
    })

    if not insertId then
        NotifyPlayer(source, L("error_generic"), "error")
        return
    end

    local messageData = {
        id = insertId,
        reportId = reportId,
        senderId = player.identifier,
        senderName = player.name,
        senderType = senderType,
        message = message,
        createdAt = os.date("!%Y-%m-%dT%H:%M:%SZ")
    }

    report:addMessage(messageData)

    MySQL.update.await("UPDATE reports SET updated_at = NOW() WHERE id = ?", { reportId })

    local ownerData = GetPlayerByIdentifier(report:getPlayerId())
    if ownerData and ownerData.source ~= source then
        TriggerClientEvent("sws-report:newMessage", ownerData.source, messageData)
        TriggerClientEvent("sws-report:playSound", ownerData.source, "message")
    end

    for adminSource, adminStatus in pairs(Admins) do
        if adminStatus and adminSource ~= source then
            TriggerClientEvent("sws-report:newMessage", adminSource, messageData)
            TriggerClientEvent("sws-report:playSound", adminSource, "message")
        end
    end

    TriggerClientEvent("sws-report:messageSent", source, messageData)

    TriggerEvent("sws-report:discord:chatMessage", report:serialize(), messageData)

    DebugPrint(("Message in Report #%d from %s: %s"):format(reportId, player.name, message:sub(1, 50)))
end)

---Get report messages
---@param reportId integer Report ID
RegisterNetEvent("sws-report:getMessages", function(reportId)
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
        NotifyPlayer(source, L("error_no_permission"), "error")
        return
    end

    local messages = MySQL.query.await([[
        SELECT * FROM report_messages
        WHERE report_id = ?
        ORDER BY created_at ASC
    ]], { reportId })

    local formattedMessages = {}
    for _, row in ipairs(messages or {}) do
        table.insert(formattedMessages, {
            id = row.id,
            reportId = row.report_id,
            senderId = row.sender_id,
            senderName = row.sender_name,
            senderType = row.sender_type,
            message = row.message,
            createdAt = row.created_at
        })
    end

    TriggerClientEvent("sws-report:setMessages", source, reportId, formattedMessages)
end)

---Send system message in report (for admin action logging)
---@param reportId integer Report ID
---@param message string System message
function SendSystemMessage(reportId, message)
    local report = Reports[reportId]
    if not report then return end

    local insertId = MySQL.insert.await([[
        INSERT INTO report_messages (report_id, sender_id, sender_name, sender_type, message)
        VALUES (?, ?, ?, ?, ?)
    ]], {
        reportId,
        "system",
        "System",
        SenderType.SYSTEM,
        message
    })

    if not insertId then return end

    local messageData = {
        id = insertId,
        reportId = reportId,
        senderId = "system",
        senderName = "System",
        senderType = SenderType.SYSTEM,
        message = message,
        createdAt = os.date("!%Y-%m-%dT%H:%M:%SZ")
    }

    report:addMessage(messageData)

    -- Notify report owner
    local ownerData = GetPlayerByIdentifier(report:getPlayerId())
    if ownerData then
        TriggerClientEvent("sws-report:newMessage", ownerData.source, messageData)
    end

    -- Notify all admins
    for adminSource, adminStatus in pairs(Admins) do
        if adminStatus then
            TriggerClientEvent("sws-report:newMessage", adminSource, messageData)
        end
    end
end
