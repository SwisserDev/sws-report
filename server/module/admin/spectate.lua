---@type table<integer, integer> Spectating admins (adminSource -> targetSource)
SpectatingAdmins = {}

---Stop spectating for an admin
---@param adminSource integer Admin server ID
---@return boolean stopped
local function stopSpectating(adminSource)
    if not SpectatingAdmins[adminSource] then
        return false
    end

    SpectatingAdmins[adminSource] = nil
    TriggerClientEvent("sws-report:spectate", adminSource, false)
    NotifyPlayer(adminSource, L("spectate_stopped"), "info")

    return true
end

---Spectate/Stop spectating player
---@param adminSource integer Admin server ID
---@param reportId integer Report ID
function SpectatePlayer(adminSource, reportId)
    -- Stopping must work even if the report got resolved in the meantime
    if stopSpectating(adminSource) then
        DebugPrint(("Admin %s stopped spectating"):format(Players[adminSource].name))
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

    if playerData.source == adminSource then
        NotifyPlayer(adminSource, L("error_generic"), "error")
        return
    end

    -- Client moves next to the target first so OneSync streams it in
    local targetCoords = GetEntityCoords(GetPlayerPed(playerData.source))

    SpectatingAdmins[adminSource] = playerData.source
    TriggerClientEvent("sws-report:spectate", adminSource, true, playerData.source, {
        x = targetCoords.x,
        y = targetCoords.y,
        z = targetCoords.z
    })
    NotifyPlayer(adminSource, L("spectating_player", playerData.name), "info")
    SendSystemMessage(reportId, L("action_spectate_player", Players[adminSource].name))

    TriggerEvent("sws-report:discord:adminAction", "spectate_player", Players[adminSource], playerData, reportId)

    DebugPrint(("Admin %s started spectating player %s (Report #%d)"):format(
        Players[adminSource].name,
        playerData.name,
        reportId
    ))
end

---Client lost its target (left scope or disconnected)
RegisterNetEvent("sws-report:stopSpectate", function()
    stopSpectating(source)
end)

---Clean up spectate state for leaving admins and their targets
AddEventHandler("playerDropped", function()
    local source = source
    SpectatingAdmins[source] = nil

    for adminSource, targetSource in pairs(SpectatingAdmins) do
        if targetSource == source then
            stopSpectating(adminSource)
        end
    end
end)
