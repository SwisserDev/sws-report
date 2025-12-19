local MAX_VOICE_DURATION = Config.VoiceMessages.maxDurationSeconds
local MAX_FILE_SIZE = Config.VoiceMessages.maxFileSizeKB * 1024

---Decode base64 string to binary
---@param data string Base64 encoded string
---@return string | nil Binary data
local function base64Decode(data)
    local b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    data = data:gsub("[^" .. b .. "=]", "")

    local result = data:gsub(".", function(x)
        if x == "=" then return "" end
        local r, f = "", (b:find(x) - 1)
        for i = 6, 1, -1 do
            r = r .. (f % 2 ^ i - f % 2 ^ (i - 1) > 0 and "1" or "0")
        end
        return r
    end):gsub("%d%d%d?%d?%d?%d?%d?%d?", function(x)
        if #x ~= 8 then return "" end
        local c = 0
        for i = 1, 8 do
            c = c + (x:sub(i, i) == "1" and 2 ^ (8 - i) or 0)
        end
        return string.char(c)
    end)

    return result
end

---Validate audio data
---@param audioData string Base64 encoded audio
---@param duration number Duration in seconds
---@return boolean isValid
---@return string | nil errorMessage
local function validateAudioData(audioData, duration)
    if type(audioData) ~= "string" or #audioData == 0 then
        return false, L("error_generic")
    end

    if type(duration) ~= "number" or duration <= 0 then
        return false, L("error_generic")
    end

    if duration > MAX_VOICE_DURATION then
        return false, L("error_voice_too_long")
    end

    local estimatedSize = #audioData * 3 / 4
    if estimatedSize > MAX_FILE_SIZE then
        return false, L("error_voice_too_large")
    end

    if not audioData:match("^[A-Za-z0-9+/=]+$") then
        return false, L("error_generic")
    end

    return true, nil
end

---Upload audio to Discord and get CDN URL (via JS module for proper binary handling)
---@param audioBase64 string Base64 encoded audio
---@param reportId integer Report ID
---@param senderName string Sender name
---@param callback fun(success: boolean, url: string | nil)
local function uploadToDiscord(audioBase64, reportId, senderName, callback)
    if not Config.Discord.enabled or not Config.Discord.webhook or Config.Discord.webhook == "" then
        callback(false, nil)
        return
    end

    DebugPrint(("Uploading voice message for report #%d (size: %d bytes)"):format(reportId, #audioBase64))

    exports["sws-report"]:uploadVoiceToDiscord({
        webhookUrl = Config.Discord.webhook,
        base64Audio = audioBase64,
        reportId = reportId,
        senderName = senderName,
        botName = Config.Discord.botName,
        botAvatar = Config.Discord.botAvatar ~= "" and Config.Discord.botAvatar or nil
    }, function(success, url, errorMsg)
        if success and url then
            DebugPrint(("Voice message uploaded: %s"):format(url))
            callback(true, url)
        else
            PrintError(("Discord upload failed: %s"):format(errorMsg or "Unknown error"))
            callback(false, nil)
        end
    end)
end

---Send voice message in report
---@param source integer Sender server ID
---@param reportId integer Report ID
---@param audioBase64 string Base64 encoded audio data
---@param duration number Audio duration in seconds
RegisterNetEvent("sws-report:sendVoiceMessage", function(reportId, audioBase64, duration)
    local source = source

    if not IsValidSource(source) then return end

    if not IsValidReportId(reportId) then
        return
    end

    if not VoiceMessagesAvailable then
        NotifyPlayer(source, L("error_voice_disabled"), "error")
        return
    end

    if not Config.VoiceMessages.enabled then
        NotifyPlayer(source, L("error_voice_disabled"), "error")
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

    local isValid, errorMsg = validateAudioData(audioBase64, duration)
    if not isValid then
        NotifyPlayer(source, errorMsg, "error")
        return
    end

    uploadToDiscord(audioBase64, reportId, player.name, function(success, cdnUrl)
        if not success or not cdnUrl then
            NotifyPlayer(source, L("error_voice_upload_failed"), "error")
            return
        end

        local senderType = isAdmin and SenderType.ADMIN or SenderType.PLAYER
        local messageText = "[Voice Message]"
        local audioDuration = math.floor(duration)

        local insertId = MySQL.insert.await([[
            INSERT INTO report_messages
            (report_id, sender_id, sender_name, sender_type, message, message_type, audio_url, audio_duration)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ]], {
            reportId,
            player.identifier,
            player.name,
            senderType,
            messageText,
            MessageType.VOICE,
            cdnUrl,
            audioDuration
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
            message = messageText,
            messageType = MessageType.VOICE,
            audioUrl = cdnUrl,
            audioDuration = audioDuration,
            createdAt = os.date("%Y-%m-%d %H:%M:%S")
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

        TriggerEvent("sws-report:discord:voiceMessage", report:serialize(), messageData)

        DebugPrint(("Voice message in Report #%d from %s (duration: %ds)"):format(
            reportId, player.name, audioDuration
        ))
    end)
end)

DebugPrint("Voice module loaded")
