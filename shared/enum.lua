---@enum ReportStatus
ReportStatus = {
    OPEN = "open",
    CLAIMED = "claimed",
    RESOLVED = "resolved"
}

---@enum ReportPriority
ReportPriority = {
    LOW = 0,
    NORMAL = 1,
    HIGH = 2,
    URGENT = 3
}

---@enum ReportCategory
ReportCategory = {
    GENERAL = "general",
    BUG = "bug",
    PLAYER = "player",
    QUESTION = "question",
    OTHER = "other"
}

---@enum SenderType
SenderType = {
    PLAYER = "player",
    ADMIN = "admin",
    SYSTEM = "system"
}

---@enum MessageType
MessageType = {
    TEXT = "text",
    VOICE = "voice"
}

---@enum AdminAction
AdminAction = {
    TELEPORT_TO = "teleport_to",
    BRING_PLAYER = "bring_player",
    HEAL_PLAYER = "heal_player",
    FREEZE_PLAYER = "freeze_player",
    SPECTATE_PLAYER = "spectate_player",
    KICK_PLAYER = "kick_player",
    REVIVE_PLAYER = "revive_player",
    SCREENSHOT_PLAYER = "screenshot_player",
    RAGDOLL_PLAYER = "ragdoll_player"
}

---@enum InventoryAction
InventoryAction = {
    ADD = "add",
    REMOVE = "remove",
    SET = "set",
    METADATA_EDIT = "metadata_edit"
}

---@enum NuiMessageType
NuiMessageType = {
    SHOW_UI = "SHOW_UI",
    HIDE_UI = "HIDE_UI",
    SET_REPORTS = "SET_REPORTS",
    SET_ALL_REPORTS = "SET_ALL_REPORTS",
    ADD_REPORT = "ADD_REPORT",
    NEW_ADMIN_REPORT = "NEW_ADMIN_REPORT",
    UPDATE_REPORT = "UPDATE_REPORT",
    REMOVE_REPORT = "REMOVE_REPORT",
    NEW_MESSAGE = "NEW_MESSAGE",
    MESSAGE_SENT = "MESSAGE_SENT",
    SET_MESSAGES = "SET_MESSAGES",
    SET_PLAYER_DATA = "SET_PLAYER_DATA",
    SET_CONFIG = "SET_CONFIG",
    NOTIFICATION = "NOTIFICATION",
    PLAY_SOUND = "PLAY_SOUND",
    UPDATE_PLAYER_ONLINE = "UPDATE_PLAYER_ONLINE",
    SET_STATISTICS = "SET_STATISTICS",
    SET_PLAYER_INVENTORY = "SET_PLAYER_INVENTORY",
    INVENTORY_UPDATED = "INVENTORY_UPDATED",
    SET_INVENTORY_SYSTEM = "SET_INVENTORY_SYSTEM"
}
