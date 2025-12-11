---@type boolean Currently spectating
local isSpectating = false

---@type vector3 | nil Original position before spectate
local originalCoords = nil

---@type integer | nil Target player server ID
local spectateTarget = nil

---Spectate player
RegisterNetEvent("sws-report:spectate", function(enable, targetSource)
    local ped = PlayerPedId()

    if enable then
        originalCoords = GetEntityCoords(ped)
        spectateTarget = targetSource
        isSpectating = true

        local targetPed = GetPlayerPed(GetPlayerFromServerId(targetSource))

        if targetPed and DoesEntityExist(targetPed) then
            local targetCoords = GetEntityCoords(targetPed)
            SetEntityCoords(ped, targetCoords.x, targetCoords.y, targetCoords.z - 10.0, false, false, false, false)

            SetEntityVisible(ped, false, false)
            SetEntityInvincible(ped, true)
            FreezeEntityPosition(ped, true)
            SetEntityCollision(ped, false, false)

            NetworkSetInSpectatorMode(true, targetPed)
        end
    else
        isSpectating = false
        spectateTarget = nil

        NetworkSetInSpectatorMode(false, ped)

        SetEntityVisible(ped, true, false)
        SetEntityInvincible(ped, false)
        FreezeEntityPosition(ped, false)
        SetEntityCollision(ped, true, true)

        if originalCoords then
            SetEntityCoords(ped, originalCoords.x, originalCoords.y, originalCoords.z, false, false, false, false)
            originalCoords = nil
        end
    end
end)

---Update spectate target position
CreateThread(function()
    while true do
        if isSpectating and spectateTarget then
            local targetPed = GetPlayerPed(GetPlayerFromServerId(spectateTarget))

            if not DoesEntityExist(targetPed) then
                TriggerServerEvent("sws-report:adminAction", 0, "spectate_player")
            end
        end
        Wait(1000)
    end
end)
