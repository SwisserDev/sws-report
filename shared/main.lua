RESOURCE_NAME = GetCurrentResourceName()

---Debug print helper
---@param ... any Values to print
function DebugPrint(...)
    if not Config.Debug then return end

    local args = { ... }
    local msg = ""

    for i = 1, #args do
        msg = msg .. tostring(args[i]) .. " "
    end

    print(("^3[sws-report:debug]^0 %s"):format(msg))
end

---Print error message
---@param message string Error message
function PrintError(message)
    print(("^1[sws-report:error]^0 %s"):format(message))
end

---Print info message
---@param message string Info message
function PrintInfo(message)
    print(("^2[sws-report]^0 %s"):format(message))
end

---Validate report category
---@param category string Category ID to validate
---@return boolean isValid
function IsValidCategory(category)
    for _, cat in ipairs(Config.Categories) do
        if cat.id == category then
            return true
        end
    end
    return false
end

---Get category config by ID
---@param categoryId string Category ID
---@return CategoryConfig | nil
function GetCategoryConfig(categoryId)
    for _, cat in ipairs(Config.Categories) do
        if cat.id == categoryId then
            return cat
        end
    end
    return nil
end

---Serialize coordinates to JSON string
---@param coords Coordinates | vector3 Coordinates
---@return string
function SerializeCoords(coords)
    if type(coords) == "vector3" then
        return json.encode({
            x = coords.x,
            y = coords.y,
            z = coords.z
        })
    end
    return json.encode(coords)
end

---Deserialize coordinates from JSON string
---@param str string JSON string
---@return Coordinates | nil
function DeserializeCoords(str)
    if not str or str == "" then return nil end

    local success, coords = pcall(json.decode, str)
    if success and coords then
        return coords
    end
    return nil
end

---Generate a unique identifier
---@return string
function GenerateUUID()
    local template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
    return string.gsub(template, "[xy]", function(c)
        local v = (c == "x") and math.random(0, 0xf) or math.random(8, 0xb)
        return string.format("%x", v)
    end)
end

---Sanitize string for database
---@param str string Input string
---@param maxLength? integer Maximum length (default 255)
---@return string
function SanitizeString(str, maxLength)
    if type(str) ~= "string" then return "" end

    maxLength = maxLength or 255
    str = str:sub(1, maxLength)
    str = str:gsub("[\r\n]", " ")

    return str
end

---Check if a value exists in a table
---@param tbl table Table to search
---@param value any Value to find
---@return boolean
function TableContains(tbl, value)
    for _, v in pairs(tbl) do
        if v == value then
            return true
        end
    end
    return false
end

---Deep copy a table
---@param tbl table Table to copy
---@return table
function DeepCopy(tbl)
    if type(tbl) ~= "table" then return tbl end

    local copy = {}
    for k, v in pairs(tbl) do
        if type(v) == "table" then
            copy[k] = DeepCopy(v)
        else
            copy[k] = v
        end
    end
    return copy
end

-- =============================================================================
-- SECURITY VALIDATION HELPERS
-- =============================================================================

---Validate reportId (must be positive integer)
---@param reportId any
---@return boolean
function IsValidReportId(reportId)
    return type(reportId) == "number" and reportId > 0 and reportId == math.floor(reportId)
end

---Validate string with max length
---@param str any
---@param maxLength number
---@return boolean
function IsValidString(str, maxLength)
    return type(str) == "string" and #str > 0 and #str <= maxLength
end

---Validate admin action against enum
---@param action any
---@return boolean
function IsValidAdminAction(action)
    if type(action) ~= "string" then return false end
    for _, v in pairs(AdminAction) do
        if v == action then return true end
    end
    return false
end

---Validate report status
---@param status any
---@return boolean
function IsValidReportStatus(status)
    if type(status) ~= "string" then return false end
    if status == "all" then return true end
    return status == ReportStatus.OPEN or
           status == ReportStatus.CLAIMED or
           status == ReportStatus.RESOLVED
end

---Validate coords table
---@param coords any
---@return boolean
function IsValidCoords(coords)
    if type(coords) ~= "table" then return false end
    return type(coords.x) == "number" and
           type(coords.y) == "number" and
           type(coords.z) == "number"
end

---Validate source is a valid player server ID
---@param source any
---@return boolean
function IsValidSource(source)
    return type(source) == "number" and source > 0 and source == math.floor(source)
end

InitLocale()
