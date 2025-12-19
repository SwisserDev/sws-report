---Get report statistics (called from client)
---@param source integer Player server ID
RegisterNetEvent("sws-report:getStatistics", function()
    local source = source

    if not IsPlayerAdmin(source) then
        return
    end

    local stats = GetStatistics()

    TriggerClientEvent("sws-report:setStatistics", source, stats)
end)

---Fetch all statistics from database
---@return table Statistics data
function GetStatistics()
    -- Total reports by status
    local statusCounts = MySQL.query.await([[
        SELECT
            status,
            COUNT(*) as count
        FROM reports
        GROUP BY status
    ]], {})

    local openReports = 0
    local claimedReports = 0
    local resolvedReports = 0

    for _, row in ipairs(statusCounts or {}) do
        if row.status == "open" then
            openReports = row.count
        elseif row.status == "claimed" then
            claimedReports = row.count
        elseif row.status == "resolved" then
            resolvedReports = row.count
        end
    end

    local totalReports = openReports + claimedReports + resolvedReports

    -- Average resolution time (in minutes)
    local avgTimeResult = MySQL.query.await([[
        SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, resolved_at)) as avg_time
        FROM reports
        WHERE status = 'resolved' AND resolved_at IS NOT NULL
    ]], {})

    local avgResolutionTime = 0
    if avgTimeResult and avgTimeResult[1] and avgTimeResult[1].avg_time then
        avgResolutionTime = avgTimeResult[1].avg_time
    end

    -- Reports by category
    local categoryResults = MySQL.query.await([[
        SELECT category, COUNT(*) as count
        FROM reports
        GROUP BY category
        ORDER BY count DESC
    ]], {})

    local reportsByCategory = {}
    for _, row in ipairs(categoryResults or {}) do
        table.insert(reportsByCategory, {
            category = row.category,
            count = row.count
        })
    end

    -- Reports by priority
    local priorityResults = MySQL.query.await([[
        SELECT priority, COUNT(*) as count
        FROM reports
        GROUP BY priority
        ORDER BY priority ASC
    ]], {})

    local reportsByPriority = {}
    for _, row in ipairs(priorityResults or {}) do
        table.insert(reportsByPriority, {
            priority = row.priority,
            count = row.count
        })
    end

    -- Admin leaderboard (resolved reports + messages)
    local adminResults = MySQL.query.await([[
        SELECT
            r.claimed_by as admin_id,
            r.claimed_by_name as admin_name,
            COUNT(DISTINCT CASE WHEN r.status = 'resolved' THEN r.id END) as resolved,
            COUNT(DISTINCT CASE WHEN r.status IN ('claimed', 'resolved') THEN r.id END) as claimed,
            (SELECT COUNT(*) FROM report_messages m WHERE m.sender_id = r.claimed_by AND m.sender_type = 'admin') as messages
        FROM reports r
        WHERE r.claimed_by IS NOT NULL
        GROUP BY r.claimed_by, r.claimed_by_name
        ORDER BY resolved DESC
        LIMIT 10
    ]], {})

    local adminLeaderboard = {}
    for _, row in ipairs(adminResults or {}) do
        table.insert(adminLeaderboard, {
            adminId = row.admin_id,
            adminName = row.admin_name or "Unknown",
            claimed = row.claimed or 0,
            resolved = row.resolved or 0,
            messages = row.messages or 0
        })
    end

    -- Recent activity (last 7 days)
    local activityResults = MySQL.query.await([[
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM reports
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ]], {})

    local recentActivity = {}
    for _, row in ipairs(activityResults or {}) do
        table.insert(recentActivity, {
            date = row.date,
            count = row.count
        })
    end

    return {
        totalReports = totalReports,
        openReports = openReports,
        claimedReports = claimedReports,
        resolvedReports = resolvedReports,
        avgResolutionTime = avgResolutionTime,
        reportsByCategory = reportsByCategory,
        reportsByPriority = reportsByPriority,
        adminLeaderboard = adminLeaderboard,
        recentActivity = recentActivity
    }
end
