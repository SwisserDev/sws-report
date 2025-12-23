---Receive screenshot URL (admin) - for notification purposes
---Screenshot capture now handled server-side via requestClientScreenshot
RegisterNetEvent("sws-report:receiveScreenshot", function(imageUrl, playerName)
    if imageUrl then
        DebugPrint(("[sws-report] Screenshot from %s: %s"):format(playerName, imageUrl))
    end
end)
