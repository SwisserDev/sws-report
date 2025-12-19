---@type boolean Whether screenshot-basic is available
local screenshotAvailable = GetResourceState("screenshot-basic") == "started"

---Upload screenshot to Discord
---@param base64Data string Base64 encoded image
---@param playerName string Player name
---@param reportId integer Report ID
---@param callback function Callback(success, url, error)
local function uploadToDiscord(base64Data, playerName, reportId, callback)
    if not Config.Discord.enabled or not Config.Discord.webhook or Config.Discord.webhook == "" then
        callback(false, nil, "Discord not configured")
        return
    end

    exports["sws-report"]:uploadScreenshotToDiscord({
        webhookUrl = Config.Discord.webhook,
        base64Image = base64Data,
        playerName = playerName,
        reportId = reportId,
        botName = Config.Discord.botName,
        botAvatar = Config.Discord.botAvatar
    }, function(success, url, errorMsg)
        callback(success, url, errorMsg)
    end)
end

---Take screenshot of player
---@param adminSource integer Admin server ID
---@param reportId integer Report ID
function ScreenshotPlayer(adminSource, reportId)
    if not screenshotAvailable then
        NotifyPlayer(adminSource, L("screenshot_unavailable"), "error")
        return
    end

    -- Check Discord config (screenshots require Discord webhook)
    if not Config.Discord.enabled or not Config.Discord.webhook or Config.Discord.webhook == "" then
        NotifyPlayer(adminSource, L("screenshot_requires_discord"), "error")
        return
    end

    local report = Reports[reportId]

    if not report then
        NotifyPlayer(adminSource, L("error_not_found"), "error")
        return
    end

    local playerData = GetPlayerByIdentifier(report:getPlayerId())

    if not playerData then
        NotifyPlayer(adminSource, L("player_offline"), "error")
        return
    end

    TriggerClientEvent("sws-report:screenshot", playerData.source, adminSource, reportId)
    NotifyPlayer(adminSource, L("screenshot_requested"), "info")

    TriggerEvent("sws-report:discord:adminAction", "screenshot_player", Players[adminSource], playerData, reportId)

    DebugPrint(("Admin %s requested screenshot from player %s (Report #%d)"):format(
        Players[adminSource].name,
        playerData.name,
        reportId
    ))
end

---Receive screenshot from player (base64)
---@param base64Data string Base64 encoded screenshot
---@param adminSource integer Admin who requested the screenshot
---@param reportId integer Report ID
RegisterNetEvent("sws-report:screenshotTaken", function(base64Data, adminSource, reportId)
    local source = source

    DebugPrint(("Screenshot received from source %s for admin %s, report %s"):format(
        tostring(source), tostring(adminSource), tostring(reportId)
    ))

    if not IsValidSource(adminSource) then
        DebugPrint("Invalid admin source, aborting")
        return
    end

    -- Validate base64 data (max ~5MB base64 = ~3.7MB image)
    if type(base64Data) ~= "string" or #base64Data > 5000000 then
        DebugPrint(("Invalid base64 data: type=%s, length=%s"):format(
            type(base64Data), base64Data and #base64Data or "nil"
        ))
        NotifyPlayer(adminSource, L("screenshot_failed"), "error")
        return
    end

    DebugPrint(("Base64 data valid, length: %d"):format(#base64Data))

    if not Players[adminSource] then
        DebugPrint("Admin not in Players table")
        return
    end

    local playerData = Players[source]

    if not playerData then
        DebugPrint(("Player source %s not in Players table"):format(tostring(source)))
        return
    end

    DebugPrint(("Player data found: %s (%s)"):format(playerData.name, playerData.identifier))
    DebugPrint("Calling uploadToDiscord...")

    -- Upload to Discord
    uploadToDiscord(base64Data, playerData.name, reportId or 0, function(success, url, errorMsg)
        DebugPrint(("Upload callback: success=%s, url=%s, error=%s"):format(
            tostring(success), tostring(url), tostring(errorMsg)
        ))

        if success and url then
            TriggerClientEvent("sws-report:receiveScreenshot", adminSource, url, playerData.name)
            NotifyPlayer(adminSource, L("screenshot_received", playerData.name), "success")

            -- Save screenshot as system message in chat
            if reportId and reportId > 0 then
                SendSystemMessageWithImage(
                    reportId,
                    L("action_screenshot_player", Players[adminSource].name),
                    url
                )
            end
        else
            NotifyPlayer(adminSource, L("screenshot_upload_failed"), "error")
            PrintError(("Screenshot upload failed: %s"):format(errorMsg or "Unknown error"))
        end
    end)
end)

---User requests to take their own screenshot
---@param reportId integer Report ID
RegisterNetEvent("sws-report:requestUserScreenshot", function(reportId)
    local source = source

    -- Validate report ID
    if not IsValidReportId(reportId) then
        return
    end

    local player = GetPlayerData(source)
    if not player then
        return
    end

    local report = Reports[reportId]
    if not report then
        NotifyPlayer(source, L("error_not_found"), "error")
        return
    end

    -- Check if user owns the report or is admin
    local isAdmin = IsPlayerAdmin(source)
    local isOwner = report:getPlayerId() == player.identifier

    if not isAdmin and not isOwner then
        NotifyPlayer(source, L("error_no_permission"), "error")
        return
    end

    -- Check Discord config
    if not Config.Discord.enabled or not Config.Discord.webhook or Config.Discord.webhook == "" then
        NotifyPlayer(source, L("screenshot_requires_discord"), "error")
        return
    end

    -- Trigger client to take screenshot (in RegisterNetEvent context for reliable large payload transfer)
    TriggerClientEvent("sws-report:takeUserScreenshot", source, reportId)
end)

---User uploads their own screenshot
---@param reportId integer Report ID
---@param base64Data string Base64 encoded screenshot
RegisterNetEvent("sws-report:userScreenshot", function(reportId, base64Data)
    local source = source

    DebugPrint(("User screenshot from source %s for report %s"):format(
        tostring(source), tostring(reportId)
    ))

    -- Validate report ID
    if not IsValidReportId(reportId) then
        DebugPrint("Invalid report ID")
        return
    end

    -- Validate base64 data (max ~5MB base64 = ~3.7MB image)
    if type(base64Data) ~= "string" or #base64Data > 5000000 then
        DebugPrint(("Invalid base64 data: type=%s, length=%s"):format(
            type(base64Data), base64Data and #base64Data or "nil"
        ))
        NotifyPlayer(source, L("screenshot_failed"), "error")
        return
    end

    local player = GetPlayerData(source)
    if not player then
        DebugPrint("Player not found")
        return
    end

    local report = Reports[reportId]
    if not report then
        NotifyPlayer(source, L("error_not_found"), "error")
        return
    end

    -- Check if user owns the report or is admin
    local isAdmin = IsPlayerAdmin(source)
    local isOwner = report:getPlayerId() == player.identifier

    if not isAdmin and not isOwner then
        NotifyPlayer(source, L("error_no_permission"), "error")
        return
    end

    -- Check Discord config
    if not Config.Discord.enabled or not Config.Discord.webhook or Config.Discord.webhook == "" then
        NotifyPlayer(source, L("screenshot_requires_discord"), "error")
        return
    end

    DebugPrint(("Uploading user screenshot for %s"):format(player.name))

    -- Upload to Discord
    uploadToDiscord(base64Data, player.name, reportId, function(success, url, errorMsg)
        DebugPrint(("User screenshot upload callback: success=%s, url=%s, error=%s"):format(
            tostring(success), tostring(url), tostring(errorMsg)
        ))

        if success and url then
            NotifyPlayer(source, L("screenshot_uploaded"), "success")

            -- Create message with image (as player message, not system)
            SendMessageWithImage(reportId, player, url)
        else
            NotifyPlayer(source, L("screenshot_upload_failed"), "error")
            PrintError(("User screenshot upload failed: %s"):format(errorMsg or "Unknown error"))
        end
    end)
end)
