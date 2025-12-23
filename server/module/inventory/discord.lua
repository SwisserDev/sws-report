---Discord webhook integration for inventory actions

---Build inventory action embed
---@param data table Action data
---@return table embed Discord embed object
local function buildInventoryEmbed(data)
    local action = data.action
    local admin = data.admin
    local player = data.player
    local item = data.item
    local reportId = data.reportId

    local actionLabels = {
        [InventoryAction.ADD] = "Item Added",
        [InventoryAction.REMOVE] = "Item Removed",
        [InventoryAction.SET] = "Item Count Set",
        [InventoryAction.METADATA_EDIT] = "Metadata Edited"
    }

    local actionColors = {
        [InventoryAction.ADD] = 3066993,        -- Green
        [InventoryAction.REMOVE] = 15158332,    -- Red
        [InventoryAction.SET] = 16776960,       -- Yellow
        [InventoryAction.METADATA_EDIT] = 7506394 -- Purple
    }

    local fields = {
        {
            name = "Admin",
            value = admin.name,
            inline = true
        },
        {
            name = "Player",
            value = player.name,
            inline = true
        },
        {
            name = "Report",
            value = "#" .. tostring(reportId),
            inline = true
        },
        {
            name = "Item",
            value = item.label or item.name,
            inline = true
        }
    }

    if action == InventoryAction.ADD or action == InventoryAction.REMOVE then
        table.insert(fields, {
            name = "Amount",
            value = tostring(item.count),
            inline = true
        })
        table.insert(fields, {
            name = "Count Change",
            value = ("%d → %d"):format(data.countBefore or 0, data.countAfter or 0),
            inline = true
        })
    elseif action == InventoryAction.SET then
        table.insert(fields, {
            name = "Count Change",
            value = ("%d → %d"):format(data.countBefore or 0, data.countAfter or 0),
            inline = true
        })
    elseif action == InventoryAction.METADATA_EDIT then
        if item.slot then
            table.insert(fields, {
                name = "Slot",
                value = tostring(item.slot),
                inline = true
            })
        end

        if data.metadataBefore then
            table.insert(fields, {
                name = "Metadata Before",
                value = "```json\n" .. json.encode(data.metadataBefore):sub(1, 900) .. "\n```",
                inline = false
            })
        end

        if data.metadataAfter then
            table.insert(fields, {
                name = "Metadata After",
                value = "```json\n" .. json.encode(data.metadataAfter):sub(1, 900) .. "\n```",
                inline = false
            })
        end
    end

    return {
        title = L("discord_inventory_action") .. ": " .. (actionLabels[action] or action),
        color = actionColors[action] or Config.Discord.colors.inventory,
        fields = fields,
        footer = {
            text = "Inventory Management • " .. os.date("!%Y-%m-%d %H:%M:%S UTC")
        }
    }
end

---Handle inventory action discord logging
---@param data table Action data containing action, admin, player, item, report
RegisterNetEvent("sws-report:discord:inventoryAction", function(data)
    if not Config.Discord.enabled then
        return
    end

    if not Config.Discord.events.inventoryAction then
        return
    end

    if not Config.Discord.webhook or Config.Discord.webhook == "" then
        return
    end

    local embed = buildInventoryEmbed(data)

    local payload = {
        username = Config.Discord.botName or "Report System",
        avatar_url = Config.Discord.botAvatar ~= "" and Config.Discord.botAvatar or nil,
        embeds = { embed }
    }

    PerformHttpRequest(Config.Discord.webhook, function(statusCode, response, headers)
        if statusCode >= 200 and statusCode < 300 then
            DebugPrint("Inventory action logged to Discord")
        else
            PrintWarn(("Failed to send inventory action to Discord: %s"):format(statusCode))
        end
    end, "POST", json.encode(payload), { ["Content-Type"] = "application/json" })
end)
