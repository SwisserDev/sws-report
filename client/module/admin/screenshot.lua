---@type boolean Whether screenshot-basic is available
local screenshotAvailable = GetResourceState("screenshot-basic") == "started"

---Take screenshot and send to server
RegisterNetEvent("sws-report:screenshot", function(adminSource)
    if not screenshotAvailable then return end

    exports["screenshot-basic"]:requestScreenshotUpload(
        "https://api.imgur.com/3/image",
        "image",
        {
            headers = {
                ["Authorization"] = "Client-ID YOUR_IMGUR_CLIENT_ID",
                ["Content-Type"] = "multipart/form-data"
            }
        },
        function(data)
            local resp = json.decode(data)

            if resp and resp.data and resp.data.link then
                TriggerServerEvent("sws-report:screenshotTaken", resp.data.link, adminSource)
            else
                TriggerServerEvent("sws-report:screenshotTaken", nil, adminSource)
            end
        end
    )
end)

---Receive screenshot (admin)
RegisterNetEvent("sws-report:receiveScreenshot", function(imageUrl, playerName)
    if imageUrl then
        print(("[sws-report] Screenshot from %s: %s"):format(playerName, imageUrl))
    end
end)
