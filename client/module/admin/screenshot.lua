---@type boolean Whether screenshot-basic is available
local screenshotAvailable = GetResourceState("screenshot-basic") == "started"

DebugPrint(("Screenshot-basic available: %s"):format(tostring(screenshotAvailable)))

---Take screenshot and send to server as base64
---@param adminSource integer Admin who requested
---@param reportId integer Report ID
RegisterNetEvent("sws-report:screenshot", function(adminSource, reportId)
    DebugPrint(("Screenshot requested by admin %s for report %s"):format(
        tostring(adminSource), tostring(reportId)
    ))

    if not screenshotAvailable then
        DebugPrint("Screenshot-basic not available, aborting")
        return
    end

    DebugPrint("Calling screenshot-basic:requestScreenshot...")

    exports["screenshot-basic"]:requestScreenshot(function(base64Data)
        DebugPrint(("Screenshot callback received, data length: %s"):format(
            base64Data and #base64Data or "nil"
        ))

        if base64Data then
            TriggerServerEvent("sws-report:screenshotTaken", base64Data, adminSource, reportId)
        else
            TriggerServerEvent("sws-report:screenshotTaken", nil, adminSource, reportId)
        end
    end)
end)

---Receive screenshot URL (admin)
RegisterNetEvent("sws-report:receiveScreenshot", function(imageUrl, playerName)
    if imageUrl then
        print(("[sws-report] Screenshot from %s: %s"):format(playerName, imageUrl))
    end
end)
