---@type boolean Currently spectating
local isSpectating = false

---@type boolean Spectator camera attached to the target
local isAttached = false

---@type vector3 | nil Original position before spectate
local originalCoords = nil

---@type integer | nil Target player server ID
local spectateTarget = nil

---Resolve a server ID to a ped that is streamed in
---@param serverId integer
---@return integer | nil
local function getTargetPed(serverId)
    local player = GetPlayerFromServerId(serverId)
    -- -1 means out of scope, GetPlayerPed(-1) would hand back our own ped
    if player == -1 then return nil end

    local ped = GetPlayerPed(player)
    if ped == 0 or not DoesEntityExist(ped) then return nil end

    return ped
end

---Restore the admin ped
local function stopSpectating()
    local ped = PlayerPedId()

    isSpectating = false
    isAttached = false
    spectateTarget = nil

    NetworkSetInSpectatorMode(false, ped)

    SetEntityVisible(ped, true, false)
    SetEntityInvincible(ped, false)
    FreezeEntityPosition(ped, false)
    SetEntityCollision(ped, true, true)

    if originalCoords then
        RequestCollisionAtCoord(originalCoords.x, originalCoords.y, originalCoords.z)
        SetEntityCoords(ped, originalCoords.x, originalCoords.y, originalCoords.z, false, false, false, false)
        originalCoords = nil
    end
end

---Spectate player
RegisterNetEvent("sws-report:spectate", function(enable, targetSource, targetCoords)
    if not enable then
        if isSpectating then
            stopSpectating()
        end
        return
    end

    local ped = PlayerPedId()

    if not isSpectating then
        originalCoords = GetEntityCoords(ped)
    end

    isSpectating = true
    isAttached = false
    spectateTarget = targetSource

    SetEntityVisible(ped, false, false)
    SetEntityInvincible(ped, true)
    SetEntityCollision(ped, false, false)
    FreezeEntityPosition(ped, true)

    if targetCoords then
        SetEntityCoords(ped, targetCoords.x, targetCoords.y, targetCoords.z - 10.0, false, false, false, false)
    end

    -- Give OneSync a moment to stream the target in
    local targetPed = nil
    local deadline = GetGameTimer() + 5000

    while isSpectating and spectateTarget == targetSource and GetGameTimer() < deadline do
        targetPed = getTargetPed(targetSource)
        if targetPed then break end
        Wait(100)
    end

    if not isSpectating or spectateTarget ~= targetSource then return end

    if not targetPed then
        stopSpectating()
        TriggerServerEvent("sws-report:stopSpectate")
        return
    end

    NetworkSetInSpectatorMode(true, targetPed)
    isAttached = true
end)

---Follow the target so it stays in scope, stop once it is gone
CreateThread(function()
    while true do
        if isSpectating and isAttached and spectateTarget then
            local targetPed = getTargetPed(spectateTarget)

            if targetPed then
                local coords = GetEntityCoords(targetPed)
                SetEntityCoords(PlayerPedId(), coords.x, coords.y, coords.z - 10.0, false, false, false, false)
            else
                stopSpectating()
                TriggerServerEvent("sws-report:stopSpectate")
            end
        end

        Wait(1000)
    end
end)
