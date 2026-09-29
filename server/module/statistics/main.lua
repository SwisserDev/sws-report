---@alias StatsRange "today" | "7d" | "30d" | "90d" | "all"

local RANGE_DAYS = { today = 1, ["7d"] = 7, ["30d"] = 30, ["90d"] = 90 }

-- A handful of aggregate queries per request, don't redo them for every click
local CACHE_SECONDS = 30

-- The dot plot gets one point per resolved report, keep the payload bounded on busy servers
local MAX_RESOLUTION_POINTS = 600

---@type table<string, { expires: integer, data: table }>
local cache = {}

---Median and 90th percentile (sorts the list in place)
---@param values number[]
---@return { median: number|nil, p90: number|nil, count: integer }
local function summarize(values)
    local count = #values
    if count == 0 then
        return { median = nil, p90 = nil, count = 0 }
    end

    table.sort(values)

    local median
    if count % 2 == 1 then
        median = values[(count + 1) // 2]
    else
        median = (values[count // 2] + values[count // 2 + 1]) / 2
    end

    return { median = median, p90 = values[math.max(1, math.ceil(0.9 * count))], count = count }
end

---Durations in seconds from query rows
---@param rows table[]
---@return number[]
local function secondsOf(rows)
    local values = {}
    for _, row in ipairs(rows) do
        local seconds = tonumber(row.seconds)
        if seconds and seconds >= 0 then
            values[#values + 1] = seconds
        end
    end
    return values
end

---Summaries of row durations grouped by a column
---@param rows table[]
---@param key string
---@return table<any, { median: number|nil, p90: number|nil, count: integer }>
local function summarizeBy(rows, key)
    local grouped = {}
    for _, row in ipairs(rows) do
        local value = row[key]
        local seconds = tonumber(row.seconds)
        if value ~= nil and seconds and seconds >= 0 then
            grouped[value] = grouped[value] or {}
            table.insert(grouped[value], seconds)
        end
    end

    local result = {}
    for value, list in pairs(grouped) do
        result[value] = summarize(list)
    end
    return result
end

---@alias StatsBucket "hour" | "day" | "week"

---SQL expression turning a timestamp column into an hour, day or week label
---@param column string
---@param bucket StatsBucket
---@return string
local function bucketFor(column, bucket)
    if bucket == "week" then
        return ("DATE_FORMAT(%s - INTERVAL WEEKDAY(%s) DAY, '%%Y-%%m-%%d')"):format(column, column)
    end
    if bucket == "hour" then
        return ("DATE_FORMAT(%s, '%%Y-%%m-%%d %%H:00')"):format(column)
    end
    return ("DATE_FORMAT(%s, '%%Y-%%m-%%d')"):format(column)
end

---Every label between two bucket labels, so empty hours/days still show up as zero
---@param first string
---@param last string
---@param bucket StatsBucket
---@return string[]
local function bucketLabels(first, last, bucket)
    local y, m, d, h = first:match("(%d+)-(%d+)-(%d+)%s*(%d*)")
    local base = { year = tonumber(y), month = tonumber(m), day = tonumber(d), hour = tonumber(h) or 12 }
    local format = bucket == "hour" and "%Y-%m-%d %H:00" or "%Y-%m-%d"

    local labels = {}
    -- Calendar arithmetic through os.time field normalization, independent of the server's UTC offset
    for step = 0, 400 do
        local fields = { year = base.year, month = base.month, day = base.day, hour = base.hour }
        if bucket == "hour" then
            fields.hour = fields.hour + step
        else
            fields.day = fields.day + step * (bucket == "week" and 7 or 1)
        end

        local label = os.date(format, os.time(fields))
        labels[#labels + 1] = label
        if label >= last then break end
    end

    return labels
end

---First staff reply and resolution durations for a window
---@param from integer Unix seconds
---@param to integer Unix seconds
---@param bucket "day" | "week"
---@return table[] firstResponses, table[] resolutions
local function fetchDurations(from, to, bucket)
    -- Time until the first staff chat message, per report created in the window
    local firstResponses = MySQL.query.await(([[
        SELECT r.id, r.priority, HOUR(r.created_at) AS hour, %s AS bucket,
               m.sender_id, m.sender_name,
               TIMESTAMPDIFF(SECOND, r.created_at, m.created_at) AS seconds
        FROM reports r
        JOIN report_messages m ON m.id = (
            SELECT m2.id FROM report_messages m2
            WHERE m2.report_id = r.id AND m2.sender_type = 'admin'
            ORDER BY m2.created_at ASC, m2.id ASC
            LIMIT 1
        )
        WHERE r.created_at >= FROM_UNIXTIME(?) AND r.created_at < FROM_UNIXTIME(?)
    ]]):format(bucketFor("r.created_at", bucket)), { from, to }) or {}

    local resolutions = MySQL.query.await(([[
        SELECT id, priority, claimed_by, claimed_by_name, %s AS bucket,
               UNIX_TIMESTAMP(created_at) AS created,
               TIMESTAMPDIFF(SECOND, created_at, resolved_at) AS seconds
        FROM reports
        WHERE status = 'resolved' AND resolved_at IS NOT NULL
          AND resolved_at >= FROM_UNIXTIME(?) AND resolved_at < FROM_UNIXTIME(?)
        ORDER BY resolved_at DESC
    ]]):format(bucketFor("resolved_at", bucket)), { from, to }) or {}

    return firstResponses, resolutions
end

---Created/resolved counts for a window
---@param from integer
---@param to integer
---@return integer created, integer resolved
local function fetchCounts(from, to)
    local row = MySQL.single.await([[
        SELECT
            (SELECT COUNT(*) FROM reports WHERE created_at >= FROM_UNIXTIME(?) AND created_at < FROM_UNIXTIME(?)) AS created,
            (SELECT COUNT(*) FROM reports WHERE resolved_at >= FROM_UNIXTIME(?) AND resolved_at < FROM_UNIXTIME(?)) AS resolved
    ]], { from, to, from, to }) or {}

    return math.tointeger(tonumber(row.created)) or 0, math.tointeger(tonumber(row.resolved)) or 0
end

---KPI numbers for one period
---@param from integer
---@param to integer
---@param firstResponses table[]
---@param resolutions table[]
local function buildPeriod(from, to, firstResponses, resolutions)
    local created, resolved = fetchCounts(from, to)

    return {
        from = from,
        to = to,
        created = created,
        resolved = resolved,
        firstResponse = summarize(secondsOf(firstResponses)),
        resolution = summarize(secondsOf(resolutions))
    }
end

---Created/resolved/backlog per bucket plus daily medians for the sparklines
local function buildSeries(from, to, bucket, firstResponses, resolutions)
    local createdRows = MySQL.query.await(([[
        SELECT %s AS bucket, COUNT(*) AS count FROM reports
        WHERE created_at >= FROM_UNIXTIME(?) AND created_at < FROM_UNIXTIME(?)
        GROUP BY bucket
    ]]):format(bucketFor("created_at", bucket)), { from, to }) or {}

    local resolvedRows = MySQL.query.await(([[
        SELECT %s AS bucket, COUNT(*) AS count FROM reports
        WHERE resolved_at >= FROM_UNIXTIME(?) AND resolved_at < FROM_UNIXTIME(?)
        GROUP BY bucket
    ]]):format(bucketFor("resolved_at", bucket)), { from, to }) or {}

    -- Reports still open when the window started, so the backlog line starts at the right height
    local startRow = MySQL.single.await([[
        SELECT COUNT(*) AS count FROM reports
        WHERE created_at < FROM_UNIXTIME(?) AND (resolved_at IS NULL OR resolved_at >= FROM_UNIXTIME(?))
    ]], { from, from }) or {}

    -- First and last label in MySQL's time zone, the same one the buckets above use
    local edges = MySQL.single.await(([[
        SELECT %s AS first, %s AS last FROM (SELECT FROM_UNIXTIME(?) AS a, FROM_UNIXTIME(?) AS b) t
    ]]):format(bucketFor("t.a", bucket), bucketFor("t.b", bucket)), { from, to - 1 }) or {}

    local created, resolved = {}, {}
    for _, row in ipairs(createdRows) do created[row.bucket] = tonumber(row.count) or 0 end
    for _, row in ipairs(resolvedRows) do resolved[row.bucket] = tonumber(row.count) or 0 end

    local firstByBucket = summarizeBy(firstResponses, "bucket")
    local resolutionByBucket = summarizeBy(resolutions, "bucket")

    local series = {}
    local backlog = tonumber(startRow.count) or 0
    local first = edges.first or os.date(bucket == "hour" and "%Y-%m-%d %H:00" or "%Y-%m-%d", from)

    for _, label in ipairs(bucketLabels(first, edges.last or first, bucket)) do
        local c, r = created[label] or 0, resolved[label] or 0
        backlog = backlog + c - r

        series[#series + 1] = {
            date = label,
            created = c,
            resolved = r,
            backlog = math.max(0, backlog),
            firstResponseMedian = firstByBucket[label] and firstByBucket[label].median or nil,
            resolutionMedian = resolutionByBucket[label] and resolutionByBucket[label].median or nil
        }
    end

    return series
end

---Build all statistics for a range
---@param range StatsRange
---@return table
function GetStatistics(range)
    if not RANGE_DAYS[range] and range ~= "all" then
        range = "30d"
    end

    local cached = cache[range]
    if cached and cached.expires > os.time() then
        return cached.data
    end

    local clock = MySQL.single.await("SELECT UNIX_TIMESTAMP() AS now, UNIX_TIMESTAMP(CURDATE()) AS midnight") or {}
    local now = math.floor(tonumber(clock.now) or os.time())
    local midnight = math.floor(tonumber(clock.midnight) or now)
    local to = now + 1

    local days = RANGE_DAYS[range]
    -- "Today" as 24 hourly points, a single daily point would be no chart at all
    local bucket = range == "today" and "hour" or "day"
    local from, previous

    if days then
        -- Calendar days including today, compared with the same elapsed time one period earlier
        from = midnight - (days - 1) * 86400
        local prevFrom, prevTo = from - days * 86400, to - days * 86400
        local prevFirst, prevResolutions = fetchDurations(prevFrom, prevTo, bucket)
        previous = buildPeriod(prevFrom, prevTo, prevFirst, prevResolutions)
    else
        local first = MySQL.single.await("SELECT UNIX_TIMESTAMP(MIN(created_at)) AS first FROM reports") or {}
        from = math.floor(tonumber(first.first) or midnight)
        if now - from > 90 * 86400 then
            bucket = "week"
        end
    end

    local firstResponses, resolutions = fetchDurations(from, to, bucket)
    local current = buildPeriod(from, to, firstResponses, resolutions)

    -- Snapshot of what is waiting right now, independent of the range
    local snapshotRows = MySQL.query.await([[
        SELECT status, COUNT(*) AS count, UNIX_TIMESTAMP(MIN(created_at)) AS oldest
        FROM reports WHERE status != 'resolved' GROUP BY status
    ]]) or {}

    local snapshot = { open = 0, claimed = 0, oldestOpenAt = nil }
    for _, row in ipairs(snapshotRows) do
        snapshot[row.status] = tonumber(row.count) or 0
        local oldest = tonumber(row.oldest)
        if oldest and (not snapshot.oldestOpenAt or oldest < snapshot.oldestOpenAt) then
            snapshot.oldestOpenAt = math.floor(oldest)
        end
    end

    -- Busiest hours with the reply time staff manage in that hour
    local hourRows = MySQL.query.await([[
        SELECT HOUR(created_at) AS hour, COUNT(*) AS count FROM reports
        WHERE created_at >= FROM_UNIXTIME(?) AND created_at < FROM_UNIXTIME(?)
        GROUP BY hour
    ]], { from, to }) or {}

    local hourCounts = {}
    for _, row in ipairs(hourRows) do hourCounts[tonumber(row.hour)] = tonumber(row.count) or 0 end
    local firstByHour = summarizeBy(firstResponses, "hour")

    local hours = {}
    for hour = 0, 23 do
        hours[#hours + 1] = {
            hour = hour,
            created = hourCounts[hour] or 0,
            firstResponseMedian = firstByHour[hour] and firstByHour[hour].median or nil
        }
    end

    local categoryRows = MySQL.query.await([[
        SELECT category, COUNT(*) AS count FROM reports
        WHERE created_at >= FROM_UNIXTIME(?) AND created_at < FROM_UNIXTIME(?)
        GROUP BY category ORDER BY count DESC
    ]], { from, to }) or {}

    local categories = {}
    for _, row in ipairs(categoryRows) do
        categories[#categories + 1] = { category = row.category, count = tonumber(row.count) or 0 }
    end

    -- Does "urgent" actually get handled faster?
    local priorityRows = MySQL.query.await([[
        SELECT priority, COUNT(*) AS count FROM reports
        WHERE created_at >= FROM_UNIXTIME(?) AND created_at < FROM_UNIXTIME(?)
        GROUP BY priority
    ]], { from, to }) or {}

    local resolutionByPriority = summarizeBy(resolutions, "priority")
    local priorities = {}
    for _, configured in ipairs(Config.Priorities) do
        local count = 0
        for _, row in ipairs(priorityRows) do
            if tonumber(row.priority) == configured.id then count = tonumber(row.count) or 0 end
        end
        local summary = resolutionByPriority[configured.id]
        priorities[#priorities + 1] = {
            priority = configured.id,
            count = count,
            resolutionMedian = summary and summary.median or nil
        }
    end

    local points = {}
    for i = 1, math.min(#resolutions, MAX_RESOLUTION_POINTS) do
        local row = resolutions[i]
        local seconds = tonumber(row.seconds)
        if seconds and seconds >= 0 then
            points[#points + 1] = {
                createdAt = math.floor(tonumber(row.created) or 0),
                seconds = seconds,
                priority = tonumber(row.priority) or 0
            }
        end
    end

    -- Per staff member: no ranking, the UI shows a sortable table
    local staffRows = MySQL.query.await([[
        SELECT claimed_by AS id, MAX(claimed_by_name) AS name, COUNT(*) AS handled
        FROM reports
        WHERE claimed_by IS NOT NULL AND created_at >= FROM_UNIXTIME(?) AND created_at < FROM_UNIXTIME(?)
        GROUP BY claimed_by
    ]], { from, to }) or {}

    local messageRows = MySQL.query.await([[
        SELECT sender_id AS id, MAX(sender_name) AS name, COUNT(*) AS messages
        FROM report_messages
        WHERE sender_type = 'admin' AND created_at >= FROM_UNIXTIME(?) AND created_at < FROM_UNIXTIME(?)
        GROUP BY sender_id
    ]], { from, to }) or {}

    local staffById = {}
    local function staffEntry(id, name)
        if not staffById[id] then
            staffById[id] = { adminId = id, adminName = name or "Unknown", handled = 0, resolved = 0, messages = 0 }
        end
        return staffById[id]
    end

    for _, row in ipairs(staffRows) do
        staffEntry(row.id, row.name).handled = tonumber(row.handled) or 0
    end
    for _, row in ipairs(messageRows) do
        staffEntry(row.id, row.name).messages = tonumber(row.messages) or 0
    end
    for _, row in ipairs(resolutions) do
        if row.claimed_by then
            local entry = staffEntry(row.claimed_by, row.claimed_by_name)
            entry.resolved = entry.resolved + 1
        end
    end

    local firstByStaff = summarizeBy(firstResponses, "sender_id")
    for _, row in ipairs(firstResponses) do
        if row.sender_id and staffById[row.sender_id] == nil then
            staffEntry(row.sender_id, row.sender_name)
        end
    end

    local resolutionByStaff = summarizeBy(resolutions, "claimed_by")
    local staff = {}
    for id, entry in pairs(staffById) do
        entry.firstResponseMedian = firstByStaff[id] and firstByStaff[id].median or nil
        entry.resolutionMedian = resolutionByStaff[id] and resolutionByStaff[id].median or nil
        staff[#staff + 1] = entry
    end
    table.sort(staff, function(a, b) return a.adminName:lower() < b.adminName:lower() end)

    local data = {
        range = range,
        bucket = bucket,
        generatedAt = now,
        snapshot = snapshot,
        current = current,
        previous = previous,
        series = buildSeries(from, to, bucket, firstResponses, resolutions),
        hours = hours,
        categories = categories,
        priorities = priorities,
        resolutions = points,
        staff = staff
    }

    cache[range] = { expires = os.time() + CACHE_SECONDS, data = data }
    return data
end

---Get report statistics (called from client)
RegisterNetEvent("sws-report:getStatistics", function(range)
    local source = source

    if not HasPermission(source, Permission.VIEW_STATISTICS) then
        return
    end

    if type(range) ~= "string" then
        range = "30d"
    end

    if not Throttle(source, "statistics", 1000) then
        return
    end

    TriggerClientEvent("sws-report:setStatistics", source, GetStatistics(range))
end)
