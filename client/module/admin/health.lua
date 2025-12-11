---Heal player
RegisterNetEvent("sws-report:heal", function()
    local ped = PlayerPedId()
    SetEntityHealth(ped, GetEntityMaxHealth(ped))
    ClearPedBloodDamage(ped)
end)

---Revive player
RegisterNetEvent("sws-report:revive", function()
    local ped = PlayerPedId()
    local coords = GetEntityCoords(ped)
    local heading = GetEntityHeading(ped)

    NetworkResurrectLocalPlayer(coords.x, coords.y, coords.z, heading, true, false)
    SetEntityHealth(ped, GetEntityMaxHealth(ped))
    ClearPedBloodDamage(ped)
    ClearPedTasksImmediately(ped)
end)
