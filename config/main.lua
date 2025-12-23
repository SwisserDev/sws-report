---@class CategoryConfig
---@field id string Category identifier
---@field label string Display label
---@field icon string FontAwesome icon class

---@class PriorityConfig
---@field id number Priority level (0-3)
---@field label string Display label
---@field color string CSS color class

---@class SoundConfig
---@field enabled boolean Enable sound notifications
---@field newReport string Sound file for new reports
---@field newMessage string Sound file for new messages
---@field volume number Volume level (0.0 - 1.0)

---@class DiscordColors
---@field new number Color for new reports
---@field claimed number Color for claimed reports
---@field resolved number Color for resolved reports
---@field deleted number Color for deleted reports
---@field message number Color for chat messages
---@field admin number Color for admin actions

---@class DiscordEvents
---@field newReport boolean Log new reports
---@field reportClaimed boolean Log claimed reports
---@field reportUnclaimed boolean Log unclaimed reports
---@field reportResolved boolean Log resolved reports
---@field reportDeleted boolean Log deleted reports
---@field chatMessage boolean Log chat messages
---@field voiceMessage boolean Log voice messages
---@field adminAction boolean Log admin actions

---@class DiscordConfig
---@field enabled boolean Enable Discord webhooks
---@field webhook string Webhook URL
---@field botName string Bot display name
---@field botAvatar string Bot avatar URL
---@field events DiscordEvents Event toggles
---@field colors DiscordColors Embed colors

---@class UIConfig
---@field defaultTheme "dark" | "light" Default theme
---@field position string UI position

---@class VoiceMessageConfig
---@field enabled boolean Enable voice messages in chat
---@field maxDurationSeconds integer Maximum recording duration in seconds
---@field maxFileSizeKB integer Maximum file size in KB

---@class ConfigType
---@field Debug boolean Enable debug logging
---@field Locale string Default locale
---@field Command string Command to open report UI
---@field Cooldown number Cooldown between reports in seconds
---@field MaxActiveReports number Maximum active reports per player
---@field Categories CategoryConfig[] Available report categories
---@field Priorities PriorityConfig[] Available priority levels
---@field AdminAcePermission string Ace permission for admin access
---@field AdminIdentifiers string[] Admin identifiers (steam/license)
---@field Sounds SoundConfig Sound configuration
---@field Discord DiscordConfig Discord webhook configuration
---@field UI UIConfig UI configuration
---@field VoiceMessages VoiceMessageConfig Voice message configuration

Config = {} ---@type ConfigType

-- General Settings
Config.Debug = false
Config.Locale = "en"
Config.Command = "report"

-- Report Settings
Config.Cooldown = 60
Config.MaxActiveReports = 3
Config.Categories = {
    { id = "general", label = "General", icon = "fa-circle-info" },
    { id = "bug", label = "Bug Report", icon = "fa-bug" },
    { id = "player", label = "Player Report", icon = "fa-user" },
    { id = "question", label = "Question", icon = "fa-question" },
    { id = "other", label = "Other", icon = "fa-ellipsis" }
}

Config.Priorities = {
    { id = 0, label = "Low", color = "gray" },
    { id = 1, label = "Normal", color = "blue" },
    { id = 2, label = "High", color = "orange" },
    { id = 3, label = "Urgent", color = "red" }
}

-- Admin Settings
Config.AdminAcePermission = "report.admin"
Config.AdminIdentifiers = {
    -- "steam:110000xxxxxxxxx",
    -- "license:xxxxxxxxxxxxx"
    "license:815c4d6cf569fc8361f3c94bfec50f0a16643e52"
}

-- Notification Settings
Config.Sounds = {
    enabled = true,
    newReport = "notification.ogg",
    newMessage = "message.ogg",
    volume = 0.5
}

-- Custom Notification Function
-- Set to nil to use built-in notifications, or define your own function
-- Function signature: function(source, message, type)
-- type is: "success", "error", or "info"
Config.CustomNotify = nil

--[[ ESX Example:
Config.CustomNotify = function(source, message, type)
    TriggerClientEvent('esx:showNotification', source, message)
end
]]

--[[ QBCore Example:
Config.CustomNotify = function(source, message, type)
    TriggerClientEvent('QBCore:Notify', source, message, type)
end
]]

--[[ ox_lib Example:
Config.CustomNotify = function(source, message, type)
    TriggerClientEvent('ox_lib:notify', source, {
        title = 'Report System',
        description = message,
        type = type
    })
end
]]

-- Discord Webhook
Config.Discord = {
    enabled = false,
    webhook = "",
    botName = "Report System",
    botAvatar = "",

    -- Event Toggles (enable/disable individual events)
    events = {
        newReport = true,
        reportClaimed = true,
        reportUnclaimed = true,
        reportResolved = true,
        reportDeleted = true,
        chatMessage = false,    -- Disabled by default (can be spammy)
        voiceMessage = true,
        adminAction = true,
        inventoryAction = true  -- Log inventory management actions
    },

    -- Embed Colors (decimal)
    colors = {
        new = 3447003,          -- Blue
        claimed = 16776960,     -- Yellow
        resolved = 3066993,     -- Green
        deleted = 15158332,     -- Red
        message = 7506394,      -- Purple
        admin = 16753920,       -- Orange
        inventory = 10181046    -- Purple (Inventory actions)
    }
}

-- UI Settings
Config.UI = {
    defaultTheme = "dark",
    position = "center"
}

-- Voice Message Settings
Config.VoiceMessages = {
    enabled = true,
    maxDurationSeconds = 60,
    maxFileSizeKB = 7500    -- 7.5MB to stay under Discord 8MB limit
}

---@class InventoryAllowedActions
---@field add boolean Allow adding items to player inventory
---@field remove boolean Allow removing items from player inventory
---@field set boolean Allow setting item count directly
---@field metadata_edit boolean Allow editing item metadata (ox_inventory only)

---@class InventoryConfig
---@field enabled boolean Enable inventory management feature
---@field allowedActions InventoryAllowedActions Actions admins can perform
---@field logToDiscord boolean Log inventory changes to Discord webhook
---@field maxItemCount number Maximum items per single action (safety limit)

-- Inventory Management Settings
Config.Inventory = {
    enabled = true,

    -- Which actions admins can perform
    allowedActions = {
        add = true,
        remove = true,
        set = true,
        metadata_edit = true    -- ox_inventory only, ESX default does not support metadata
    },

    -- Discord logging (uses same webhook as main Discord config)
    logToDiscord = true,

    -- Safety limits
    maxItemCount = 1000         -- Maximum items per single action
}
