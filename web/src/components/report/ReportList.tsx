"use client"

import { useState, useEffect } from "react"
import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"
import { ReportCard } from "./ReportCard"
import { Button, Select, Input } from "@/components/ui"

export function ReportList() {
  const { activeTab, setIsCreatingReport, getFilteredReports, locale, filter, setFilter, categories } = useReportStore()
  const { getMyReports } = useNuiActions()
  const [showResolved, setShowResolved] = useState(false)

  const reports = getFilteredReports()

  // Fetch reports when showResolved changes (only for player tab)
  useEffect(() => {
    if (activeTab === "my-reports") {
      getMyReports(showResolved)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResolved, activeTab])

  return (
    <aside className="w-[380px] xl:w-[440px] 2xl:w-[520px] flex flex-col border-r border-border bg-bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">
          {activeTab === "admin"
            ? locale.active_reports || "Active Reports"
            : locale.my_reports || "My Reports"}
        </h3>
        {activeTab === "my-reports" && (
          <Button size="sm" variant="primary" onClick={() => setIsCreatingReport(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {locale.create_report || "Create"}
          </Button>
        )}
      </div>

      {/* Player: Show Resolved Toggle */}
      {activeTab === "my-reports" && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary hover:text-text-primary transition-colors">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-border bg-bg-tertiary accent-accent cursor-pointer"
            />
            {locale.show_resolved || "Show resolved"}
          </label>
        </div>
      )}

      {/* Admin Filters */}
      {activeTab === "admin" && (
        <div className="flex flex-wrap gap-2 px-3 py-2 border-b border-border">
          <Select
            className="flex-1 min-w-[90px] py-1.5 text-xs"
            value={filter.status || "all"}
            onChange={(e) => setFilter({ status: e.target.value as "open" | "claimed" | "resolved" | "all" })}
          >
            <option value="all">{locale.all || "All"}</option>
            <option value="open">{locale.status_open || "Open"}</option>
            <option value="claimed">{locale.status_claimed || "Claimed"}</option>
            <option value="resolved">{locale.status_resolved || "Resolved"}</option>
          </Select>
          <Select
            className="flex-1 min-w-[90px] py-1.5 text-xs"
            value={filter.category || "all"}
            onChange={(e) => setFilter({ category: e.target.value })}
          >
            <option value="all">{locale.all || "All"}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </Select>
          <Input
            className="w-full py-1.5 text-xs"
            type="text"
            placeholder={locale.search_by_player || "Search player..."}
            value={filter.playerId || ""}
            onChange={(e) => setFilter({ playerId: e.target.value || undefined })}
          />
        </div>
      )}

      {/* Report List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-text-tertiary">
            <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm">
              {activeTab === "admin"
                ? locale.no_reports || "No reports found"
                : locale.no_active_reports || "You have no active reports"}
            </p>
          </div>
        ) : (
          reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))
        )}
      </div>
    </aside>
  )
}
