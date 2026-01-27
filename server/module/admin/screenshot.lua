---@type "screenshot-basic" | "screencapture" Configured screenshot provider
local screenshotProvider = Config.Screenshot and Config.Screenshot.provider or "screenshot-basic"

---@type boolean Whether the configured screenshot resource is available
local screenshotAvailable = GetResourceState(screenshotProvider) == "started"

---@type table<integer, number> Screenshot cooldowns per target source
local screenshotCooldowns = {}

---@type integer Screenshot cooldown in milliseconds
local SCREENSHOT_COOLDOWN = 5000

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

---Check if target is on screenshot cooldown
---@param targetSource integer Target player source
---@return boolean isOnCooldown
local function isOnScreenshotCooldown(targetSource)
    local now = GetGameTimer()
    if screenshotCooldowns[targetSource] and now < screenshotCooldowns[targetSource] then
        return true
    end
    return false
end

---Set screenshot cooldown for target
---@param targetSource integer Target player source
local function setScreenshotCooldown(targetSource)
    screenshotCooldowns[targetSource] = GetGameTimer() + SCREENSHOT_COOLDOWN
end

---Capture screenshot using the configured provider, then call onCapture with base64 data
---@param targetSource integer Target player source
---@param onCapture function Callback(data) with base64 image data
---@param onError function Callback(errorMsg)
local function captureScreenshot(targetSource, onCapture, onError)
    local encoding = Config.Screenshot and Config.Screenshot.encoding or "jpg"

    if screenshotProvider == "screencapture" then
        exports["screencapture"]:serverCapture(targetSource, {
            encoding = encoding
        }, function(data)
            if not data then
                onError("screencapture returned no data")
                return
            end
            onCapture(data)
        end, "base64")
    else
        local quality = Config.Screenshot and Config.Screenshot.quality or 0.85
        exports["screenshot-basic"]:requestClientScreenshot(targetSource, {
            encoding = encoding,
            quality = quality
        }, function(captureErr, data)
            if captureErr then
                onError(tostring(captureErr))
                return
            end
            onCapture(data)
        end)
    end
end

---Execute screenshot request in separate thread to prevent blocking server loop
---@param targetSource integer Target player source
---@param notifySource integer Source to notify on success/error
---@param reportId integer Report ID
---@param playerName string Player name for Discord embed
---@param onSuccess function|nil Optional callback on successful upload (url)
local function executeScreenshotRequest(targetSource, notifySource, reportId, playerName, onSuccess)
    Citizen.CreateThread(function()
        local success, err = pcall(function()
            captureScreenshot(targetSource, function(data)
                DebugPrint(("Screenshot captured, data length: %d"):format(data and #data or 0))

                uploadToDiscord(data, playerName, reportId, function(uploadSuccess, url, errorMsg)
                    if uploadSuccess and url then
                        if onSuccess then
                            onSuccess(url)
                        end
                    else
                        NotifyPlayer(notifySource, L("screenshot_upload_failed"), "error")
                        PrintError(("Screenshot upload failed: %s"):format(errorMsg or "Unknown error"))
                    end
                end)
            end, function(errorMsg)
                DebugPrint(("Screenshot capture failed: %s"):format(errorMsg))
                NotifyPlayer(notifySource, L("screenshot_failed"), "error")
            end)
        end)

        if not success then
            PrintError(("Screenshot request failed: %s"):format(tostring(err)))
            NotifyPlayer(notifySource, L("screenshot_failed"), "error")
        end
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

    if isOnScreenshotCooldown(playerData.source) then
        NotifyPlayer(adminSource, L("screenshot_cooldown"), "error")
        return
    end

    setScreenshotCooldown(playerData.source)

    NotifyPlayer(adminSource, L("screenshot_requested"), "info")

    DebugPrint(("Admin %s requested screenshot from player %s (Report #%d)"):format(
        Players[adminSource].name,
        playerData.name,
        reportId
    ))

    executeScreenshotRequest(playerData.source, adminSource, reportId, playerData.name, function(url)
        TriggerClientEvent("sws-report:receiveScreenshot", adminSource, url, playerData.name)
        NotifyPlayer(adminSource, L("screenshot_received", playerData.name), "success")

        if reportId and reportId > 0 then
            SendSystemMessageWithImage(
                reportId,
                L("action_screenshot_player", Players[adminSource].name),
                url
            )
        end
    end)

    TriggerEvent("sws-report:discord:adminAction", "screenshot_player", Players[adminSource], playerData, reportId)
end

---User requests to take their own screenshot using server-side capture
---@param reportId integer Report ID
RegisterNetEvent("sws-report:requestUserScreenshot", function(reportId)
    local source = source

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

    local isAdmin = IsPlayerAdmin(source)
    local isOwner = report:getPlayerId() == player.identifier

    if not isAdmin and not isOwner then
        NotifyPlayer(source, L("error_no_permission"), "error")
        return
    end

    if not Config.Discord.enabled or not Config.Discord.webhook or Config.Discord.webhook == "" then
        NotifyPlayer(source, L("screenshot_requires_discord"), "error")
        return
    end

    if not screenshotAvailable then
        NotifyPlayer(source, L("screenshot_unavailable"), "error")
        return
    end

    if isOnScreenshotCooldown(source) then
        NotifyPlayer(source, L("screenshot_cooldown"), "error")
        return
    end

    setScreenshotCooldown(source)

    DebugPrint(("User %s taking screenshot for report %d"):format(player.name, reportId))

    executeScreenshotRequest(source, source, reportId, player.name, function(url)
        NotifyPlayer(source, L("screenshot_uploaded"), "success")
        SendMessageWithImage(reportId, player, url)
    end)
end)

---Take automatic screenshot when report is created (silent, no user notification)
---@param source integer Player source who created the report
---@param reportId integer Report ID
---@param playerName string Player name
function TakeAutoScreenshot(source, reportId, playerName)
    if not screenshotAvailable then
        DebugPrint(("Auto-screenshot skipped: %s not available"):format(screenshotProvider))
        return
    end

    if not Config.Discord.enabled or not Config.Discord.webhook or Config.Discord.webhook == "" then
        DebugPrint("Auto-screenshot skipped: Discord not configured")
        return
    end

    DebugPrint(("Taking auto-screenshot for report #%d from %s"):format(reportId, playerName))

    Citizen.CreateThread(function()
        local success, err = pcall(function()
            captureScreenshot(source, function(data)
                uploadToDiscord(data, playerName, reportId, function(uploadSuccess, url, errorMsg)
                    if uploadSuccess and url then
                        SendSystemMessageWithImage(reportId, L("auto_screenshot"), url)
                        DebugPrint(("Auto-screenshot uploaded for report #%d"):format(reportId))
                    else
                        DebugPrint(("Auto-screenshot upload failed: %s"):format(errorMsg or "Unknown"))
                    end
                end)
            end, function(errorMsg)
                DebugPrint(("Auto-screenshot capture failed: %s"):format(errorMsg))
            end)
        end)

        if not success then
            DebugPrint(("Auto-screenshot request failed: %s"):format(tostring(err)))
        end
    end)
end
