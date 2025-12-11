---Teleport admin to player
---@param adminSource integer Admin server ID
---@param reportId integer Report ID
function TeleportToPlayer(adminSource, reportId)
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

    local playerPed = GetPlayerPed(playerData.source)
    local coords = GetEntityCoords(playerPed)

    TriggerClientEvent("sws-report:teleport", adminSource, coords.x, coords.y, coords.z)
    NotifyPlayer(adminSource, L("teleported_to_player"), "success")
    SendSystemMessage(reportId, L("action_teleport_to", Players[adminSource].name))

    TriggerEvent("sws-report:discord:adminAction", "teleport_to", Players[adminSource], playerData, reportId)

    DebugPrint(("Admin %s teleported to player %s (Report #%d)"):format(
        Players[adminSource].name,
        playerData.name,
        reportId
    ))
end

---Bring player to admin
---@param adminSource integer Admin server ID
---@param reportId integer Report ID
function BringPlayer(adminSource, reportId)
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

    local adminPed = GetPlayerPed(adminSource)
    local coords = GetEntityCoords(adminPed)

    TriggerClientEvent("sws-report:teleport", playerData.source, coords.x, coords.y, coords.z)
    NotifyPlayer(adminSource, L("player_brought"), "success")
    NotifyPlayer(playerData.source, L("teleported_by_admin"), "info")
    SendSystemMessage(reportId, L("action_bring_player", Players[adminSource].name))

    TriggerEvent("sws-report:discord:adminAction", "bring_player", Players[adminSource], playerData, reportId)

    DebugPrint(("Admin %s brought player %s (Report #%d)"):format(
        Players[adminSource].name,
        playerData.name,
        reportId
    ))
end
