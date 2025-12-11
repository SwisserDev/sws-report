---Teleport to coordinates
RegisterNetEvent("sws-report:teleport", function(x, y, z)
    local ped = PlayerPedId()
    SetEntityCoords(ped, x, y, z, false, false, false, false)
end)
