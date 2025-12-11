---@type table<integer, boolean> Frozen players cache
FrozenPlayers = {}

---Freeze/Unfreeze player
---@param adminSource integer Admin server ID
---@param reportId integer Report ID
function FreezePlayer(adminSource, reportId)
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

    local isFrozen = FrozenPlayers[playerData.source] or false
    FrozenPlayers[playerData.source] = not isFrozen

    TriggerClientEvent("sws-report:freeze", playerData.source, not isFrozen)

    if not isFrozen then
        NotifyPlayer(adminSource, L("player_frozen"), "success")
        NotifyPlayer(playerData.source, L("you_were_frozen"), "info")
    else
        NotifyPlayer(adminSource, L("player_unfrozen"), "success")
        NotifyPlayer(playerData.source, L("you_were_unfrozen"), "info")
    end
    SendSystemMessage(reportId, L("action_freeze_player", Players[adminSource].name))

    TriggerEvent("sws-report:discord:adminAction", "freeze_player", Players[adminSource], playerData, reportId)

    DebugPrint(("Admin %s %s player %s (Report #%d)"):format(
        Players[adminSource].name,
        not isFrozen and "froze" or "unfroze",
        playerData.name,
        reportId
    ))
end

---Kick player from server
---@param adminSource integer Admin server ID
---@param reportId integer Report ID
function KickPlayer(adminSource, reportId)
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

    local adminName = Players[adminSource].name
    local playerName = playerData.name

    SendSystemMessage(reportId, L("action_kick_player", adminName))
    TriggerEvent("sws-report:discord:adminAction", "kick_player", Players[adminSource], playerData, reportId)

    DropPlayer(playerData.source, L("kicked_reason", adminName))
    NotifyPlayer(adminSource, L("player_kicked"), "success")

    DebugPrint(("Admin %s kicked player %s (Report #%d)"):format(
        adminName,
        playerName,
        reportId
    ))
end

---Set player to ragdoll
---@param adminSource integer Admin server ID
---@param reportId integer Report ID
function RagdollPlayer(adminSource, reportId)
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

    TriggerClientEvent("sws-report:ragdoll", playerData.source)
    NotifyPlayer(adminSource, L("player_ragdolled"), "success")
    SendSystemMessage(reportId, L("action_ragdoll_player", Players[adminSource].name))

    TriggerEvent("sws-report:discord:adminAction", "ragdoll_player", Players[adminSource], playerData, reportId)

    DebugPrint(("Admin %s ragdolled player %s (Report #%d)"):format(
        Players[adminSource].name,
        playerData.name,
        reportId
    ))
end

---Clean up frozen status when player drops
AddEventHandler("playerDropped", function()
    local source = source
    FrozenPlayers[source] = nil
end)
