---@type table<string, string> Sound file mapping
local SOUNDS <const> = {
    notification = Config.Sounds.newReport,
    message = Config.Sounds.newMessage
}

---Play a sound effect
---@param soundType string Sound type ("notification" | "message")
local function playSound(soundType)
    if not Config.Sounds.enabled then return end

    local soundFile = SOUNDS[soundType]
    if not soundFile then return end

    SendNUIMessage({
        type = "PLAY_SOUND",
        data = {
            sound = soundFile,
            volume = Config.Sounds.volume
        }
    })
end

-- Event handler for playing sounds
RegisterNetEvent("sws-report:playSound", function(soundType)
    playSound(soundType)
end)

-- Export for other resources
exports("PlaySound", function(soundType)
    playSound(soundType)
end)
