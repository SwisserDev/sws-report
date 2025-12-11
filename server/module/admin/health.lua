---Heal player
---@param adminSource integer Admin server ID
---@param reportId integer Report ID
function HealPlayer(adminSource, reportId)
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

    TriggerClientEvent("sws-report:heal", playerData.source)
    NotifyPlayer(adminSource, L("player_healed"), "success")
    NotifyPlayer(playerData.source, L("healed_by_admin"), "success")
    SendSystemMessage(reportId, L("action_heal_player", Players[adminSource].name))

    TriggerEvent("sws-report:discord:adminAction", "heal_player", Players[adminSource], playerData, reportId)

    DebugPrint(("Admin %s healed player %s (Report #%d)"):format(
        Players[adminSource].name,
        playerData.name,
        reportId
    ))
end

---Revive player
---@param adminSource integer Admin server ID
---@param reportId integer Report ID
function RevivePlayer(adminSource, reportId)
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

    TriggerClientEvent("sws-report:revive", playerData.source)
    NotifyPlayer(adminSource, L("player_revived"), "success")
    NotifyPlayer(playerData.source, L("revived_by_admin"), "success")
    SendSystemMessage(reportId, L("action_revive_player", Players[adminSource].name))

    TriggerEvent("sws-report:discord:adminAction", "revive_player", Players[adminSource], playerData, reportId)

    DebugPrint(("Admin %s revived player %s (Report #%d)"):format(
        Players[adminSource].name,
        playerData.name,
        reportId
    ))
end
