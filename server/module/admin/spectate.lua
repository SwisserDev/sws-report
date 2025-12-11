---@type table<integer, integer> Spectating admins (adminSource -> targetSource)
SpectatingAdmins = {}

---Spectate/Stop spectating player
---@param adminSource integer Admin server ID
---@param reportId integer Report ID
function SpectatePlayer(adminSource, reportId)
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

    local isSpectating = SpectatingAdmins[adminSource] ~= nil

    if isSpectating then
        SpectatingAdmins[adminSource] = nil
        TriggerClientEvent("sws-report:spectate", adminSource, false, -1)
        NotifyPlayer(adminSource, L("spectate_stopped"), "info")

        DebugPrint(("Admin %s stopped spectating"):format(Players[adminSource].name))
    else
        SpectatingAdmins[adminSource] = playerData.source
        TriggerClientEvent("sws-report:spectate", adminSource, true, playerData.source)
        NotifyPlayer(adminSource, L("spectating_player", playerData.name), "info")
        SendSystemMessage(reportId, L("action_spectate_player", Players[adminSource].name))

        TriggerEvent("sws-report:discord:adminAction", "spectate_player", Players[adminSource], playerData, reportId)

        DebugPrint(("Admin %s started spectating player %s (Report #%d)"):format(
            Players[adminSource].name,
            playerData.name,
            reportId
        ))
    end
end

---Clean up spectate status when admin drops
AddEventHandler("playerDropped", function()
    local source = source
    SpectatingAdmins[source] = nil
end)
