---@type boolean UI visibility state
local isUIOpen = false

---@type boolean Player admin status
local isAdmin = false

---@type string | nil Player identifier
local playerIdentifier = nil

---@type string | nil Player name
local playerName = nil

---@type string Current theme
local currentTheme = Config.UI.defaultTheme

---@type ReportData[] Player's reports
local myReports = {}

---@type ReportData[] All reports (admin only)
local allReports = {}

---Open the report UI
---@param forceAdmin? boolean Force admin mode
local function openUI(forceAdmin)
    if isUIOpen then return end

    isUIOpen = true
    SetNuiFocus(true, true)

    SendNUIMessage({
        type = NuiMessageType.SHOW_UI,
        data = {
            isAdmin = forceAdmin or isAdmin,
            theme = currentTheme,
            categories = Config.Categories,
            priorities = Config.Priorities,
            myReports = myReports,
            allReports = allReports,
            playerData = {
                identifier = playerIdentifier,
                name = playerName,
                isAdmin = isAdmin
            },
            locale = CurrentLocale
        }
    })

    DebugPrint("UI opened")
end

---Close the report UI
local function closeUI()
    if not isUIOpen then return end

    isUIOpen = false
    SetNuiFocus(false, false)

    SendNUIMessage({
        type = NuiMessageType.HIDE_UI
    })

    DebugPrint("UI closed")
end

---Toggle UI visibility
local function toggleUI()
    if isUIOpen then
        closeUI()
    else
        openUI()
    end
end

---Get player coordinates
---@return Coordinates
local function getPlayerCoords()
    local ped = PlayerPedId()
    local coords = GetEntityCoords(ped)
    return {
        x = coords.x,
        y = coords.y,
        z = coords.z
    }
end

-- NUI Callbacks
RegisterNUICallback("close", function(data, cb)
    closeUI()
    cb("ok")
end)

RegisterNUICallback("createReport", function(data, cb)
    local coords = getPlayerCoords()

    TriggerServerEvent("sws-report:createReport", {
        subject = data.subject,
        category = data.category,
        description = data.description,
        coords = coords
    })

    cb("ok")
end)

RegisterNUICallback("deleteReport", function(data, cb)
    TriggerServerEvent("sws-report:deleteReport", data.id)
    cb("ok")
end)

RegisterNUICallback("claimReport", function(data, cb)
    TriggerServerEvent("sws-report:claimReport", data.id)
    cb("ok")
end)

RegisterNUICallback("unclaimReport", function(data, cb)
    TriggerServerEvent("sws-report:unclaimReport", data.id)
    cb("ok")
end)

RegisterNUICallback("resolveReport", function(data, cb)
    TriggerServerEvent("sws-report:resolveReport", data.id)
    cb("ok")
end)

RegisterNUICallback("sendMessage", function(data, cb)
    TriggerServerEvent("sws-report:sendMessage", data.reportId, data.message)
    cb("ok")
end)

RegisterNUICallback("getMessages", function(data, cb)
    TriggerServerEvent("sws-report:getMessages", data.reportId)
    cb("ok")
end)

RegisterNUICallback("adminAction", function(data, cb)
    TriggerServerEvent("sws-report:adminAction", data.reportId, data.action)
    cb("ok")
end)

RegisterNUICallback("setTheme", function(data, cb)
    currentTheme = data.theme
    SetResourceKvp("sws-report:theme", currentTheme)
    cb("ok")
end)

RegisterNUICallback("getReports", function(data, cb)
    TriggerServerEvent("sws-report:getReports", data.filter)
    cb("ok")
end)

RegisterNUICallback("getMyReports", function(data, cb)
    TriggerServerEvent("sws-report:getMyReports", data.includeResolved)
    cb("ok")
end)

RegisterNUICallback("setPriority", function(data, cb)
    TriggerServerEvent("sws-report:setPriority", data.reportId, data.priority)
    cb("ok")
end)

RegisterNUICallback("addReportNote", function(data, cb)
    TriggerServerEvent("sws-report:addReportNote", data.reportId, data.note)
    cb("ok")
end)

RegisterNUICallback("deleteReportNote", function(data, cb)
    TriggerServerEvent("sws-report:deleteReportNote", data.noteId)
    cb("ok")
end)

RegisterNUICallback("getReportNotes", function(data, cb)
    TriggerServerEvent("sws-report:getReportNotes", data.reportId)
    cb("ok")
end)

RegisterNUICallback("addPlayerNote", function(data, cb)
    TriggerServerEvent("sws-report:addPlayerNote", data.playerId, data.note)
    cb("ok")
end)

RegisterNUICallback("deletePlayerNote", function(data, cb)
    TriggerServerEvent("sws-report:deletePlayerNote", data.noteId)
    cb("ok")
end)

RegisterNUICallback("getPlayerNotes", function(data, cb)
    TriggerServerEvent("sws-report:getPlayerNotes", data.playerId)
    cb("ok")
end)

RegisterNUICallback("getPlayerHistory", function(data, cb)
    TriggerServerEvent("sws-report:getPlayerHistory", data.playerId)
    cb("ok")
end)

RegisterNUICallback("getStatistics", function(_, cb)
    TriggerServerEvent("sws-report:getStatistics")
    cb("ok")
end)

RegisterNUICallback("takeScreenshot", function(data, cb)
    cb("ok")

    local reportId = data.reportId
    if not reportId then return end

    -- Request screenshot via server (workaround for FiveM NUI callback limitation with large payloads)
    TriggerServerEvent("sws-report:requestUserScreenshot", reportId)
end)

---Handle screenshot request from server (ensures we're in RegisterNetEvent context for large payloads)
RegisterNetEvent("sws-report:takeUserScreenshot", function(reportId)
    -- Check if screenshot-basic is available
    if GetResourceState("screenshot-basic") ~= "started" then
        DebugPrint("Screenshot-basic not available")
        return
    end

    DebugPrint(("User taking screenshot for report %s"):format(tostring(reportId)))

    exports["screenshot-basic"]:requestScreenshot(function(base64Data)
        DebugPrint(("User screenshot callback, data length: %s"):format(
            base64Data and #base64Data or "nil"
        ))

        if base64Data then
            TriggerServerEvent("sws-report:userScreenshot", reportId, base64Data)
        end
    end)
end)

-- Server Events
RegisterNetEvent("sws-report:setPlayerData", function(data)
    playerIdentifier = data.identifier
    playerName = data.name
    isAdmin = data.isAdmin

    DebugPrint(("Player data set: %s (%s) - Admin: %s"):format(playerName, playerIdentifier, tostring(isAdmin)))
end)

RegisterNetEvent("sws-report:setReports", function(reports)
    myReports = reports

    if isUIOpen then
        SendNUIMessage({
            type = NuiMessageType.SET_REPORTS,
            data = myReports
        })
    end
end)

RegisterNetEvent("sws-report:setAllReports", function(reports)
    allReports = reports

    if isUIOpen and isAdmin then
        SendNUIMessage({
            type = NuiMessageType.SET_ALL_REPORTS,
            data = allReports
        })
    end
end)

RegisterNetEvent("sws-report:reportCreated", function(report)
    table.insert(myReports, 1, report)

    if isUIOpen then
        SendNUIMessage({
            type = NuiMessageType.ADD_REPORT,
            data = report
        })
    end
end)

RegisterNetEvent("sws-report:newReport", function(report)
    table.insert(allReports, 1, report)

    if isUIOpen and isAdmin then
        SendNUIMessage({
            type = NuiMessageType.NEW_ADMIN_REPORT,
            data = report
        })
    end
end)

RegisterNetEvent("sws-report:reportUpdated", function(report)
    for i, r in ipairs(myReports) do
        if r.id == report.id then
            myReports[i] = report
            break
        end
    end

    for i, r in ipairs(allReports) do
        if r.id == report.id then
            allReports[i] = report
            break
        end
    end

    if isUIOpen then
        SendNUIMessage({
            type = NuiMessageType.UPDATE_REPORT,
            data = report
        })
    end
end)

RegisterNetEvent("sws-report:reportDeleted", function(reportId)
    for i, r in ipairs(myReports) do
        if r.id == reportId then
            table.remove(myReports, i)
            break
        end
    end

    for i, r in ipairs(allReports) do
        if r.id == reportId then
            table.remove(allReports, i)
            break
        end
    end

    if isUIOpen then
        SendNUIMessage({
            type = NuiMessageType.REMOVE_REPORT,
            data = { id = reportId }
        })
    end
end)

RegisterNetEvent("sws-report:newMessage", function(message)
    for i, r in ipairs(myReports) do
        if r.id == message.reportId then
            myReports[i].messages = myReports[i].messages or {}
            table.insert(myReports[i].messages, message)
            break
        end
    end

    for i, r in ipairs(allReports) do
        if r.id == message.reportId then
            allReports[i].messages = allReports[i].messages or {}
            table.insert(allReports[i].messages, message)
            break
        end
    end

    if isUIOpen then
        SendNUIMessage({
            type = NuiMessageType.NEW_MESSAGE,
            data = message
        })
    end
end)

RegisterNetEvent("sws-report:messageSent", function(message)
    if isUIOpen then
        SendNUIMessage({
            type = NuiMessageType.MESSAGE_SENT,
            data = message
        })
    end
end)

RegisterNetEvent("sws-report:setMessages", function(reportId, messages)
    for i, r in ipairs(myReports) do
        if r.id == reportId then
            myReports[i].messages = messages
            break
        end
    end

    for i, r in ipairs(allReports) do
        if r.id == reportId then
            allReports[i].messages = messages
            break
        end
    end

    if isUIOpen then
        SendNUIMessage({
            type = NuiMessageType.SET_MESSAGES,
            data = {
                reportId = reportId,
                messages = messages
            }
        })
    end
end)

RegisterNetEvent("sws-report:notify", function(message, notifyType)
    if isUIOpen then
        SendNUIMessage({
            type = NuiMessageType.NOTIFICATION,
            data = {
                message = message,
                notifyType = notifyType
            }
        })
    else
        -- Fallback to native notification when UI is closed
        BeginTextCommandThefeedPost("STRING")
        AddTextComponentSubstringPlayerName(message)
        EndTextCommandThefeedPostTicker(false, true)
    end
end)

RegisterNetEvent("sws-report:playSound", function(sound)
    if isUIOpen and Config.Sounds.enabled then
        SendNUIMessage({
            type = NuiMessageType.PLAY_SOUND,
            data = {
                sound = sound,
                volume = Config.Sounds.volume or 0.5
            }
        })
    end
end)

RegisterNetEvent("sws-report:playerOnlineStatus", function(identifier, isOnline)
    for i, r in ipairs(allReports) do
        if r.playerId == identifier then
            allReports[i].isPlayerOnline = isOnline
        end
    end

    if isUIOpen and isAdmin then
        SendNUIMessage({
            type = NuiMessageType.UPDATE_PLAYER_ONLINE,
            data = {
                playerId = identifier,
                isOnline = isOnline
            }
        })
    end
end)

RegisterNetEvent("sws-report:setReportNotes", function(reportId, notes)
    if isUIOpen and isAdmin then
        SendNUIMessage({
            type = "SET_REPORT_NOTES",
            data = {
                reportId = reportId,
                notes = notes
            }
        })
    end
end)

RegisterNetEvent("sws-report:reportNoteAdded", function(note)
    if isUIOpen and isAdmin then
        SendNUIMessage({
            type = "REPORT_NOTE_ADDED",
            data = note
        })
    end
end)

RegisterNetEvent("sws-report:reportNoteDeleted", function(data)
    if isUIOpen and isAdmin then
        SendNUIMessage({
            type = "REPORT_NOTE_DELETED",
            data = data
        })
    end
end)

RegisterNetEvent("sws-report:setPlayerNotes", function(playerId, notes)
    if isUIOpen and isAdmin then
        SendNUIMessage({
            type = "SET_PLAYER_NOTES",
            data = {
                playerId = playerId,
                notes = notes
            }
        })
    end
end)

RegisterNetEvent("sws-report:playerNoteAdded", function(note)
    if isUIOpen and isAdmin then
        SendNUIMessage({
            type = "PLAYER_NOTE_ADDED",
            data = note
        })
    end
end)

RegisterNetEvent("sws-report:playerNoteDeleted", function(data)
    if isUIOpen and isAdmin then
        SendNUIMessage({
            type = "PLAYER_NOTE_DELETED",
            data = data
        })
    end
end)

RegisterNetEvent("sws-report:setPlayerHistory", function(history)
    if isUIOpen and isAdmin then
        SendNUIMessage({
            type = "SET_PLAYER_HISTORY",
            data = history
        })
    end
end)

RegisterNetEvent("sws-report:setStatistics", function(stats)
    if isUIOpen and isAdmin then
        SendNUIMessage({
            type = "SET_STATISTICS",
            data = stats
        })
    end
end)

-- Command
RegisterCommand(Config.Command, function()
    toggleUI()
end, false)

-- Keybind (optional)
RegisterKeyMapping(Config.Command, "Open Report Menu", "keyboard", "")

-- Player loaded
CreateThread(function()
    while true do
        if NetworkIsPlayerActive(PlayerId()) then
            break
        end
        Wait(500)
    end

    local savedTheme = GetResourceKvpString("sws-report:theme")
    if savedTheme then
        currentTheme = savedTheme
    end

    TriggerServerEvent("sws-report:playerJoined")

    DebugPrint("Player joined event sent")
end)

-- Exports
exports("OpenUI", function()
    openUI()
end)

exports("CloseUI", function()
    closeUI()
end)

exports("IsUIOpen", function()
    return isUIOpen
end)

exports("ToggleUI", function()
    toggleUI()
end)
