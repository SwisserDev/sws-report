---Check if event type is enabled
---@param eventType string Event type
---@return boolean
local function isEventEnabled(eventType)
    if not Config.Discord.events then return true end
    return Config.Discord.events[eventType] ~= false
end

---Send Discord webhook
---@param eventType string Event type for toggle check
---@param data table Webhook data
local function sendWebhook(eventType, data)
    if not Config.Discord.enabled then return end
    if not Config.Discord.webhook or Config.Discord.webhook == "" then return end
    if not isEventEnabled(eventType) then return end

    PerformHttpRequest(Config.Discord.webhook, function(err, text, headers)
        if err ~= 200 and err ~= 204 then
            PrintError(("Discord webhook failed: %s"):format(tostring(err)))
        end
    end, "POST", json.encode(data), { ["Content-Type"] = "application/json" })
end

---Format timestamp for Discord
---@param timestamp string MySQL timestamp
---@return string
local function formatTimestamp(timestamp)
    if not timestamp then return "N/A" end
    return timestamp
end

---Build embed for new report
---@param report ReportData Report data
---@return table
local function buildNewReportEmbed(report)
    local categoryConfig = GetCategoryConfig(report.category)
    local categoryLabel = categoryConfig and categoryConfig.label or report.category

    return {
        username = Config.Discord.botName,
        avatar_url = Config.Discord.botAvatar ~= "" and Config.Discord.botAvatar or nil,
        embeds = {
            {
                title = "New Report #" .. report.id,
                color = Config.Discord.colors.new,
                fields = {
                    {
                        name = "Player",
                        value = report.playerName,
                        inline = true
                    },
                    {
                        name = "Category",
                        value = categoryLabel,
                        inline = true
                    },
                    {
                        name = "Subject",
                        value = report.subject,
                        inline = false
                    },
                    {
                        name = "Description",
                        value = report.description or "No description provided",
                        inline = false
                    }
                },
                timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ"),
                footer = {
                    text = "Report System"
                }
            }
        }
    }
end

---Build embed for claimed report
---@param report ReportData Report data
---@param admin PlayerData Admin data
---@return table
local function buildClaimedEmbed(report, admin)
    return {
        username = Config.Discord.botName,
        avatar_url = Config.Discord.botAvatar ~= "" and Config.Discord.botAvatar or nil,
        embeds = {
            {
                title = "Report #" .. report.id .. " Claimed",
                color = Config.Discord.colors.claimed,
                fields = {
                    {
                        name = "Report",
                        value = report.subject,
                        inline = true
                    },
                    {
                        name = "Claimed By",
                        value = admin.name,
                        inline = true
                    },
                    {
                        name = "Reporter",
                        value = report.playerName,
                        inline = true
                    }
                },
                timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ"),
                footer = {
                    text = "Report System"
                }
            }
        }
    }
end

---Build embed for resolved report
---@param report ReportData Report data
---@param admin PlayerData Admin data
---@return table
local function buildResolvedEmbed(report, admin)
    return {
        username = Config.Discord.botName,
        avatar_url = Config.Discord.botAvatar ~= "" and Config.Discord.botAvatar or nil,
        embeds = {
            {
                title = "Report #" .. report.id .. " Resolved",
                color = Config.Discord.colors.resolved,
                fields = {
                    {
                        name = "Report",
                        value = report.subject,
                        inline = true
                    },
                    {
                        name = "Resolved By",
                        value = admin.name,
                        inline = true
                    },
                    {
                        name = "Reporter",
                        value = report.playerName,
                        inline = true
                    },
                    {
                        name = "Created At",
                        value = formatTimestamp(report.createdAt),
                        inline = true
                    }
                },
                timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ"),
                footer = {
                    text = "Report System"
                }
            }
        }
    }
end

---Build embed for deleted report
---@param report ReportData Report data
---@param player PlayerData Player who deleted
---@return table
local function buildDeletedEmbed(report, player)
    return {
        username = Config.Discord.botName,
        avatar_url = Config.Discord.botAvatar ~= "" and Config.Discord.botAvatar or nil,
        embeds = {
            {
                title = "Report #" .. report.id .. " Deleted",
                color = Config.Discord.colors.deleted,
                fields = {
                    {
                        name = "Report",
                        value = report.subject,
                        inline = true
                    },
                    {
                        name = "Deleted By",
                        value = player.name,
                        inline = true
                    },
                    {
                        name = "Reporter",
                        value = report.playerName,
                        inline = true
                    }
                },
                timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ"),
                footer = {
                    text = "Report System"
                }
            }
        }
    }
end

---Build embed for unclaimed report
---@param report ReportData Report data
---@param admin PlayerData Admin data
---@return table
local function buildUnclaimedEmbed(report, admin)
    return {
        username = Config.Discord.botName,
        avatar_url = Config.Discord.botAvatar ~= "" and Config.Discord.botAvatar or nil,
        embeds = {
            {
                title = "Report #" .. report.id .. " Unclaimed",
                color = Config.Discord.colors.claimed,
                fields = {
                    {
                        name = "Report",
                        value = report.subject,
                        inline = true
                    },
                    {
                        name = "Unclaimed By",
                        value = admin.name,
                        inline = true
                    },
                    {
                        name = "Reporter",
                        value = report.playerName,
                        inline = true
                    }
                },
                timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ"),
                footer = {
                    text = "Report System"
                }
            }
        }
    }
end

---Build embed for chat message
---@param report ReportData Report data
---@param message table Message data
---@return table
local function buildChatMessageEmbed(report, message)
    return {
        username = Config.Discord.botName,
        avatar_url = Config.Discord.botAvatar ~= "" and Config.Discord.botAvatar or nil,
        embeds = {
            {
                title = "New Message in Report #" .. report.id,
                description = message.message,
                color = Config.Discord.colors.message or 7506394,
                fields = {
                    {
                        name = "From",
                        value = message.senderName,
                        inline = true
                    },
                    {
                        name = "Type",
                        value = message.senderType == "admin" and "Admin" or "Player",
                        inline = true
                    },
                    {
                        name = "Report",
                        value = report.subject,
                        inline = false
                    }
                },
                timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ"),
                footer = {
                    text = "Report System"
                }
            }
        }
    }
end

---Build embed for admin action
---@param action string Action type
---@param admin PlayerData Admin data
---@param target PlayerData Target player data
---@param reportId? number Report ID
---@return table
local function buildAdminActionEmbed(action, admin, target, reportId)
    local actionLabels = {
        teleport_to = "Teleported To",
        bring_player = "Brought Player",
        heal_player = "Healed",
        revive_player = "Revived",
        freeze_player = "Froze/Unfroze",
        spectate_player = "Spectating",
        kick_player = "Kicked",
        ragdoll_player = "Ragdolled",
        screenshot_player = "Screenshot Requested"
    }

    return {
        username = Config.Discord.botName,
        avatar_url = Config.Discord.botAvatar ~= "" and Config.Discord.botAvatar or nil,
        embeds = {
            {
                title = "Admin Action: " .. (actionLabels[action] or action),
                color = Config.Discord.colors.admin or 16753920,
                fields = {
                    {
                        name = "Admin",
                        value = admin.name,
                        inline = true
                    },
                    {
                        name = "Target",
                        value = target.name,
                        inline = true
                    },
                    {
                        name = "Report",
                        value = reportId and ("#" .. reportId) or "N/A",
                        inline = true
                    }
                },
                timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ"),
                footer = {
                    text = "Report System"
                }
            }
        }
    }
end

-- Event handlers for Discord logging
AddEventHandler("sws-report:discord:newReport", function(report)
    sendWebhook("newReport", buildNewReportEmbed(report))
end)

AddEventHandler("sws-report:discord:claimed", function(report, admin)
    sendWebhook("reportClaimed", buildClaimedEmbed(report, admin))
end)

AddEventHandler("sws-report:discord:unclaimed", function(report, admin)
    sendWebhook("reportUnclaimed", buildUnclaimedEmbed(report, admin))
end)

AddEventHandler("sws-report:discord:resolved", function(report, admin)
    sendWebhook("reportResolved", buildResolvedEmbed(report, admin))
end)

AddEventHandler("sws-report:discord:deleted", function(report, player)
    sendWebhook("reportDeleted", buildDeletedEmbed(report, player))
end)

AddEventHandler("sws-report:discord:chatMessage", function(report, message)
    sendWebhook("chatMessage", buildChatMessageEmbed(report, message))
end)

AddEventHandler("sws-report:discord:adminAction", function(action, admin, target, reportId)
    sendWebhook("adminAction", buildAdminActionEmbed(action, admin, target, reportId))
end)

DebugPrint("Discord module loaded")
