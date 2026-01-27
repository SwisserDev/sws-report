---Handle admin action
---@param source integer Admin server ID
---@param reportId integer Report ID
---@param action AdminAction Action type
RegisterNetEvent("sws-report:adminAction", function(reportId, action)
    local source = source

    if not IsValidReportId(reportId) then
        return
    end

    if not IsValidAdminAction(action) then
        return
    end

    -- Permission check: action string matches Permission enum values for player actions
    if not HasPermission(source, action) then
        NotifyPlayer(source, L("error_no_permission"), "error")
        return
    end

    if action == AdminAction.TELEPORT_TO then
        TeleportToPlayer(source, reportId)
    elseif action == AdminAction.BRING_PLAYER then
        BringPlayer(source, reportId)
    elseif action == AdminAction.HEAL_PLAYER then
        HealPlayer(source, reportId)
    elseif action == AdminAction.FREEZE_PLAYER then
        FreezePlayer(source, reportId)
    elseif action == AdminAction.SPECTATE_PLAYER then
        SpectatePlayer(source, reportId)
    elseif action == AdminAction.KICK_PLAYER then
        KickPlayer(source, reportId)
    elseif action == AdminAction.REVIVE_PLAYER then
        RevivePlayer(source, reportId)
    elseif action == AdminAction.SCREENSHOT_PLAYER then
        ScreenshotPlayer(source, reportId)
    elseif action == AdminAction.RAGDOLL_PLAYER then
        RagdollPlayer(source, reportId)
    else
        NotifyPlayer(source, L("error_generic"), "error")
    end
end)

---Toggle admin status (for testing only - disabled in production)
RegisterNetEvent("sws-report:toggleAdmin", function()
    -- Security: Only allow in debug mode
    if not Config.Debug then return end

    local source = source

    if not IsPlayerAceAllowed(source, "command") then
        return
    end

    Admins[source] = not Admins[source]

    if Admins[source] then
        PlayerGroups[source] = "_legacy_admin"
    else
        PlayerGroups[source] = false
    end

    if Players[source] then
        Players[source].isAdmin = Admins[source]
    end

    local permissions = Admins[source] and GetPlayerPermissions(source) or {}
    local group = Admins[source] and GetPlayerGroup(source) or nil

    TriggerClientEvent("sws-report:setPlayerData", source, {
        identifier = Players[source].identifier,
        name = Players[source].name,
        isAdmin = Admins[source],
        permissions = permissions,
        group = group
    })

    NotifyPlayer(source, ("Admin status: %s"):format(tostring(Admins[source])), "info")
end)
