"use client"

import { useEffect, useMemo } from "react"
import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"

const COLORS = {
  accent: "#3b82f6",
  success: "#22c55e",
  warning: "#eab308",
  error: "#ef4444",
  purple: "#a855f7",
  cyan: "#06b6d4",
  orange: "#f97316",
  pink: "#ec4899"
}

const PRIORITY_COLORS = ["#6b7280", "#3b82f6", "#eab308", "#ef4444"]
const CATEGORY_COLORS = [COLORS.accent, COLORS.success, COLORS.warning, COLORS.purple, COLORS.cyan]

interface PieChartProps {
  data: { label: string; value: number; color: string }[]
  size?: number
}

function PieChart({ data, size = 120 }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  const gradientParts = useMemo(() => {
    if (total === 0) return null

    let cumulative = 0
    return data.map((d) => {
      const percent = (d.value / total) * 100
      const start = cumulative
      cumulative += percent
      return `${d.color} ${start}% ${cumulative}%`
    }).join(", ")
  }, [data, total])

  if (total === 0) {
    return (
      <div
        className="rounded-full bg-bg-elevated flex items-center justify-center text-text-muted text-xs"
        style={{ width: size, height: size }}
      >
        No data
      </div>
    )
  }

  return (
    <div
      className="rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${gradientParts})`
      }}
    />
  )
}

interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  maxValue?: number
}

function BarChart({ data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1)

  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-text-secondary w-20 truncate" title={item.label}>
            {item.label}
          </span>
          <div className="flex-1 h-6 bg-bg-elevated rounded overflow-hidden">
            <div
              className="h-full rounded transition-all duration-500 flex items-center justify-end pr-2"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color || COLORS.accent,
                minWidth: item.value > 0 ? "24px" : "0"
              }}
            >
              <span className="text-xs font-medium text-white drop-shadow">
                {item.value}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color?: string
  subtext?: string
}

function StatCard({ label, value, icon, color = COLORS.accent, subtext }: StatCardProps) {
  return (
    <div className="bg-bg-card rounded-lg p-4 border border-border">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
        <div>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          <p className="text-xs text-text-secondary">{label}</p>
          {subtext && <p className="text-[10px] text-text-muted">{subtext}</p>}
        </div>
      </div>
    </div>
  )
}

/**
 * Format date (string or timestamp) to localized weekday label
 */
const formatDayLabel = (dateValue: string | number): string => {
  let date: Date

  if (typeof dateValue === "number") {
    date = new Date(dateValue * 1000)
  } else {
    date = new Date(dateValue + "T00:00:00")
  }

  if (isNaN(date.getTime())) return String(dateValue)
  return date.toLocaleDateString("de-DE", { weekday: "short" })
}

export function StatisticsPanel() {
  const { statistics, locale } = useReportStore()
  const { getStatistics } = useNuiActions()

  useEffect(() => {
    getStatistics()
  }, [getStatistics])

  if (!statistics) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted">
        <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {locale.loading || "Loading..."}
      </div>
    )
  }

  const statusData = [
    { label: locale.status_open || "Open", value: statistics.openReports, color: COLORS.warning },
    { label: locale.status_claimed || "Claimed", value: statistics.claimedReports, color: COLORS.accent },
    { label: locale.status_resolved || "Resolved", value: statistics.resolvedReports, color: COLORS.success }
  ]

  const categoryData = statistics.reportsByCategory.map((cat, i) => ({
    label: locale[`category_${cat.category}`] || cat.category,
    value: cat.count,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
  }))

  const priorityData = statistics.reportsByPriority.map((p) => ({
    label: [locale.low || "Low", locale.normal || "Normal", locale.high || "High", locale.urgent || "Urgent"][p.priority],
    value: p.count,
    color: PRIORITY_COLORS[p.priority]
  }))

  const adminData = statistics.adminLeaderboard.map((admin, i) => ({
    label: admin.adminName,
    value: admin.resolved,
    color: [COLORS.accent, COLORS.success, COLORS.warning, COLORS.purple, COLORS.cyan][i % 5]
  }))

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label={locale.total_reports || "Total Reports"}
            value={statistics.totalReports}
            color={COLORS.accent}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <StatCard
            label={locale.status_open || "Open"}
            value={statistics.openReports}
            color={COLORS.warning}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label={locale.status_claimed || "Claimed"}
            value={statistics.claimedReports}
            color={COLORS.accent}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <StatCard
            label={locale.status_resolved || "Resolved"}
            value={statistics.resolvedReports}
            color={COLORS.success}
            subtext={statistics.avgResolutionTime > 0 ? `${locale.avg_time || "Avg"}: ${formatTime(statistics.avgResolutionTime)}` : undefined}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Reports by Status */}
          <div className="bg-bg-card rounded-lg p-5 border border-border">
            <h3 className="text-sm font-semibold text-text-primary mb-4">{locale.reports_by_status || "Reports by Status"}</h3>
            <div className="flex items-center gap-6">
              <PieChart data={statusData} size={100} />
              <div className="space-y-2">
                {statusData.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-text-secondary">{item.label}</span>
                    <span className="text-xs font-medium text-text-primary ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reports by Category */}
          <div className="bg-bg-card rounded-lg p-5 border border-border">
            <h3 className="text-sm font-semibold text-text-primary mb-4">{locale.reports_by_category || "Reports by Category"}</h3>
            <div className="flex items-center gap-6">
              <PieChart data={categoryData} size={100} />
              <div className="space-y-2 flex-1">
                {categoryData.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-text-secondary truncate">{item.label}</span>
                    <span className="text-xs font-medium text-text-primary ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reports by Priority */}
          <div className="bg-bg-card rounded-lg p-5 border border-border">
            <h3 className="text-sm font-semibold text-text-primary mb-4">{locale.reports_by_priority || "Reports by Priority"}</h3>
            <BarChart data={priorityData} />
          </div>

          {/* Admin Leaderboard */}
          <div className="bg-bg-card rounded-lg p-5 border border-border">
            <h3 className="text-sm font-semibold text-text-primary mb-4">{locale.admin_leaderboard || "Admin Leaderboard"}</h3>
            {adminData.length > 0 ? (
              <div className="space-y-3">
                {adminData.slice(0, 5).map((admin, i) => (
                  <div key={admin.label} className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: i === 0 ? COLORS.warning : i === 1 ? "#9ca3af" : i === 2 ? "#b45309" : COLORS.accent }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-sm text-text-primary flex-1 truncate">{admin.label}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-text-primary">{admin.value}</span>
                      <span className="text-xs text-text-muted ml-1">{locale.resolved || "resolved"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-4">{locale.no_data || "No data available"}</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        {statistics.recentActivity && statistics.recentActivity.length > 0 && (
          <div className="bg-bg-card rounded-lg p-5 border border-border">
            <h3 className="text-sm font-semibold text-text-primary mb-4">{locale.recent_activity || "Recent Activity (Last 7 Days)"}</h3>
            <div className="flex items-end gap-2">
              {(() => {
                const maxCount = Math.max(...statistics.recentActivity.map(d => d.count), 1)
                return statistics.recentActivity.map((day, i) => {
                  const heightPercent = (day.count / maxCount) * 100
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-text-secondary">{day.count}</span>
                      <div className="w-full h-24 flex items-end">
                        <div
                          className="w-full rounded-t transition-all duration-300"
                          style={{
                            height: `${Math.max(heightPercent, 4)}%`,
                            backgroundColor: COLORS.accent
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-text-muted">
                        {formatDayLabel(day.date)}
                      </span>
                    </div>
                  )
                })
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
