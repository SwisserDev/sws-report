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

---Take screenshot of player using server-side capture
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

    NotifyPlayer(adminSource, L("screenshot_requested"), "info")

    DebugPrint(("Admin %s requested screenshot from player %s (Report #%d)"):format(
        Players[adminSource].name,
        playerData.name,
        reportId
    ))

    -- Use server-side screenshot capture (bypasses FiveM event size limits for 4K+)
    exports["screenshot-basic"]:requestClientScreenshot(playerData.source, {
        encoding = Config.Screenshot and Config.Screenshot.encoding or "jpg",
        quality = Config.Screenshot and Config.Screenshot.quality or 0.85
    }, function(err, data)
        if err then
            DebugPrint(("Screenshot capture failed: %s"):format(tostring(err)))
            NotifyPlayer(adminSource, L("screenshot_failed"), "error")
            return
        end

        DebugPrint(("Screenshot captured, data length: %d"):format(data and #data or 0))

        -- Upload to Discord
        uploadToDiscord(data, playerData.name, reportId, function(success, url, errorMsg)
            if success and url then
                TriggerClientEvent("sws-report:receiveScreenshot", adminSource, url, playerData.name)
                NotifyPlayer(adminSource, L("screenshot_received", playerData.name), "success")

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

    TriggerEvent("sws-report:discord:adminAction", "screenshot_player", Players[adminSource], playerData, reportId)
end

---User requests to take their own screenshot using server-side capture
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

    -- Check if screenshot-basic is available
    if not screenshotAvailable then
        NotifyPlayer(source, L("screenshot_unavailable"), "error")
        return
    end

    DebugPrint(("User %s taking screenshot for report %d"):format(player.name, reportId))

    -- Use server-side screenshot capture (bypasses FiveM event size limits for 4K+)
    exports["screenshot-basic"]:requestClientScreenshot(source, {
        encoding = Config.Screenshot and Config.Screenshot.encoding or "jpg",
        quality = Config.Screenshot and Config.Screenshot.quality or 0.85
    }, function(err, data)
        if err then
            DebugPrint(("User screenshot capture failed: %s"):format(tostring(err)))
            NotifyPlayer(source, L("screenshot_failed"), "error")
            return
        end

        DebugPrint(("User screenshot captured, data length: %d"):format(data and #data or 0))

        -- Upload to Discord
        uploadToDiscord(data, player.name, reportId, function(success, url, errorMsg)
            if success and url then
                NotifyPlayer(source, L("screenshot_uploaded"), "success")
                SendMessageWithImage(reportId, player, url)
            else
                NotifyPlayer(source, L("screenshot_upload_failed"), "error")
                PrintError(("User screenshot upload failed: %s"):format(errorMsg or "Unknown error"))
            end
        end)
    end)
end)
