---@type boolean Whether screenshot-basic is available
local screenshotAvailable = GetResourceState("screenshot-basic") == "started"

---Take screenshot of player
---@param adminSource integer Admin server ID
---@param reportId integer Report ID
function ScreenshotPlayer(adminSource, reportId)
    if not screenshotAvailable then
        NotifyPlayer(adminSource, L("screenshot_unavailable"), "error")
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

    TriggerClientEvent("sws-report:screenshot", playerData.source, adminSource)
    NotifyPlayer(adminSource, L("screenshot_requested"), "info")
    SendSystemMessage(reportId, L("action_screenshot_player", Players[adminSource].name))

    TriggerEvent("sws-report:discord:adminAction", "screenshot_player", Players[adminSource], playerData, reportId)

    DebugPrint(("Admin %s requested screenshot from player %s (Report #%d)"):format(
        Players[adminSource].name,
        playerData.name,
        reportId
    ))
end

---Receive screenshot from player
RegisterNetEvent("sws-report:screenshotTaken", function(imageData, adminSource)
    local source = source

    if not IsValidSource(adminSource) then
        return
    end

    -- Security: Validate imageData is a string and not too large (max 5MB)
    if type(imageData) ~= "string" or #imageData > 5000000 then
        return
    end

    if not Players[adminSource] then
        return
    end

    local playerData = Players[source]

    if not playerData then return end

    TriggerClientEvent("sws-report:receiveScreenshot", adminSource, imageData, playerData.name)
    NotifyPlayer(adminSource, L("screenshot_received", playerData.name), "success")

    DebugPrint(("Screenshot received from player %s"):format(playerData.name))
end)
