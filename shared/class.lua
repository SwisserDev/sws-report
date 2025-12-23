---@class Coordinates
---@field x number X coordinate
---@field y number Y coordinate
---@field z number Z coordinate

---@class ReportData
---@field id integer Report ID
---@field playerId string Player identifier
---@field playerName string Player name
---@field subject string Report subject
---@field category string Report category
---@field description? string Report description
---@field status ReportStatus Report status
---@field claimedBy? string Admin identifier who claimed
---@field claimedByName? string Admin name who claimed
---@field priority integer Report priority (0-5)
---@field playerCoords? Coordinates Player coordinates when created
---@field createdAt string Creation timestamp
---@field updatedAt string Last update timestamp
---@field resolvedAt? string Resolution timestamp
---@field messages? MessageData[] Chat messages

---@class MessageData
---@field id integer Message ID
---@field reportId integer Parent report ID
---@field senderId string Sender identifier
---@field senderName string Sender display name
---@field senderType SenderType Sender type (player/admin)
---@field message string Message content
---@field createdAt string Creation timestamp

---@class Report
---@field data ReportData Report data
Report = {}
Report.__index = Report

---Create a new Report instance
---@param data ReportData Report data
---@return Report
function Report:new(data)
    local instance = setmetatable({}, self)
    instance.data = data
    instance.data.messages = instance.data.messages or {}
    return instance
end

---Get report ID
---@return integer
function Report:getId()
    return self.data.id
end

---Get player identifier
---@return string
function Report:getPlayerId()
    return self.data.playerId
end

---Get player name
---@return string
function Report:getPlayerName()
    return self.data.playerName
end

---Get report status
---@return ReportStatus
function Report:getStatus()
    return self.data.status
end

---Check if report is open
---@return boolean
function Report:isOpen()
    return self.data.status == ReportStatus.OPEN
end

---Check if report is claimed
---@return boolean
function Report:isClaimed()
    return self.data.status == ReportStatus.CLAIMED
end

---Check if report is resolved
---@return boolean
function Report:isResolved()
    return self.data.status == ReportStatus.RESOLVED
end

---Set report status
---@param status ReportStatus New status
function Report:setStatus(status)
    self.data.status = status
    self.data.updatedAt = os.date("!%Y-%m-%dT%H:%M:%SZ")
end

---Claim report
---@param adminId string Admin identifier
---@param adminName string Admin name
function Report:claim(adminId, adminName)
    self.data.status = ReportStatus.CLAIMED
    self.data.claimedBy = adminId
    self.data.claimedByName = adminName
    self.data.updatedAt = os.date("!%Y-%m-%dT%H:%M:%SZ")
end

---Unclaim report
function Report:unclaim()
    self.data.status = ReportStatus.OPEN
    self.data.claimedBy = nil
    self.data.claimedByName = nil
    self.data.updatedAt = os.date("!%Y-%m-%dT%H:%M:%SZ")
end

---Resolve report
function Report:resolve()
    self.data.status = ReportStatus.RESOLVED
    self.data.resolvedAt = os.date("!%Y-%m-%dT%H:%M:%SZ")
    self.data.updatedAt = self.data.resolvedAt
end

---Get report priority
---@return integer
function Report:getPriority()
    return self.data.priority or 0
end

---Set report priority
---@param priority integer Priority level (0-3)
function Report:setPriority(priority)
    self.data.priority = priority
    self.data.updatedAt = os.date("!%Y-%m-%dT%H:%M:%SZ")
end

---Add message to report
---@param message MessageData Message data
function Report:addMessage(message)
    table.insert(self.data.messages, message)
end

---Get all messages
---@return MessageData[]
function Report:getMessages()
    return self.data.messages
end

---Serialize report to table for NUI/network
---@return ReportData
function Report:serialize()
    return self.data
end

---@class Message
---@field data MessageData Message data
Message = {}
Message.__index = Message

---Create a new Message instance
---@param data MessageData Message data
---@return Message
function Message:new(data)
    local instance = setmetatable({}, self)
    instance.data = data
    return instance
end

---Get message ID
---@return integer
function Message:getId()
    return self.data.id
end

---Get report ID
---@return integer
function Message:getReportId()
    return self.data.reportId
end

---Check if sender is admin
---@return boolean
function Message:isFromAdmin()
    return self.data.senderType == SenderType.ADMIN
end

---Serialize message to table
---@return MessageData
function Message:serialize()
    return self.data
end
