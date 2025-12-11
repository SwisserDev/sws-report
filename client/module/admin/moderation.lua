---@type boolean Current freeze state
local isFrozen = false

---Freeze/Unfreeze player
RegisterNetEvent("sws-report:freeze", function(freeze)
    local ped = PlayerPedId()
    isFrozen = freeze

    FreezeEntityPosition(ped, freeze)

    if freeze then
        SetEntityCollision(ped, false, true)
    else
        SetEntityCollision(ped, true, true)
    end
end)

---Set player to ragdoll
RegisterNetEvent("sws-report:ragdoll", function()
    local ped = PlayerPedId()

    SetPedToRagdoll(ped, 3000, 3000, 0, false, false, false)
end)

---Prevent movement when frozen
CreateThread(function()
    while true do
        if isFrozen then
            DisableAllControlActions(0)
            EnableControlAction(0, 249, true) -- Push to talk
            EnableControlAction(0, 46, true)  -- Push to talk secondary
        end
        Wait(0)
    end
end)
