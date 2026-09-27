"use client"

import { useEffect, useMemo } from "react"
import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"
import { useNow } from "@/hooks/useNow"
import { Button, EmptyState, Input, Segmented, Select, StatusGlyph } from "@/components/ui"
import { parseTimestamp } from "@/lib/time"
import type { Report, ReportStatus } from "@/types"
import { ReportRow } from "./ReportRow"

interface Group {
  key: string
  label: string
  status?: ReportStatus
  reports: Report[]
}

const time = (value: unknown) => parseTimestamp(value)?.getTime() ?? 0

// Most urgent first, then whoever has been waiting longest
const byPriorityThenAge = (a: Report, b: Report) => b.priority - a.priority || time(a.createdAt) - time(b.createdAt)
const byNewest = (a: Report, b: Report) => time(b.resolvedAt ?? b.createdAt) - time(a.resolvedAt ?? a.createdAt)

export function ReportList() {
  const {
    isVisible, activeTab, locale, filter, setFilter, myView, setMyView, categories,
    playerData, allReports, myReports, reportArchive, setIsCreatingReport, getFilteredReports
  } = useReportStore()
  const { getMyReports, getResolvedReports } = useNuiActions()

  // Keeps ages and their warning colors current while the list is open
  useNow(30_000)

  const isAdminTab = activeTab === "admin"
  const reports = getFilteredReports()

  // Refetch on open as well, the cached list from Lua can be stale
  useEffect(() => {
    if (isVisible && activeTab === "my-reports") {
      getMyReports(myView === "resolved")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myView, activeTab, isVisible])

  // Resolved reports live only in the database, load them when staff open that view
  useEffect(() => {
    if (isVisible && isAdminTab && filter.view === "resolved") {
      getResolvedReports()
    }
  }, [isVisible, isAdminTab, filter.view, getResolvedReports])

  const groups = useMemo<Group[]>(() => {
    if (isAdminTab && filter.view === "queue") {
      const me = playerData?.identifier
      return [
        { key: "unclaimed", label: locale.group_unclaimed || "Unclaimed", status: "open" as const, reports: reports.filter((r) => r.status === "open") },
        { key: "mine", label: locale.group_mine || "Claimed by me", status: "claimed" as const, reports: reports.filter((r) => r.status === "claimed" && r.claimedBy === me) },
        { key: "others", label: locale.group_others || "Claimed by others", status: "claimed" as const, reports: reports.filter((r) => r.status === "claimed" && r.claimedBy !== me) }
      ]
        .map((group) => ({ ...group, reports: [...group.reports].sort(byPriorityThenAge) }))
        .filter((group) => group.reports.length > 0)
    }

    const resolvedView = isAdminTab ? filter.view === "resolved" : myView === "resolved"
    return [{ key: "all", label: "", reports: [...reports].sort(resolvedView ? byNewest : isAdminTab ? byPriorityThenAge : byNewest) }]
  }, [reports, isAdminTab, filter.view, myView, playerData?.identifier, locale])

  const me = playerData?.identifier
  const counts = {
    queue: allReports.filter((r) => r.status !== "resolved").length,
    mine: allReports.filter((r) => r.status === "claimed" && r.claimedBy === me).length,
    active: myReports.filter((r) => r.status !== "resolved").length
  }

  const filtered = isAdminTab && (filter.search.trim() !== "" || filter.category !== "all")
  const isEmpty = groups.every((group) => group.reports.length === 0)
  const archiveLoading = isAdminTab && filter.view === "resolved" && reportArchive.length === 0 && reports.length === 0

  return (
    <aside className="w-[23.5rem] shrink-0 flex flex-col min-h-0 border-r border-line bg-panel">
      <div className="flex flex-col gap-2 p-3 border-b border-line">
        {isAdminTab ? (
          <>
            <Segmented
              value={filter.view}
              onChange={(view) => setFilter({ view })}
              options={[
                { value: "queue", label: locale.view_active || "Active", count: counts.queue },
                { value: "mine", label: locale.view_mine || "Mine", count: counts.mine },
                { value: "resolved", label: locale.status_resolved || "Resolved" }
              ]}
            />
            <div className="flex gap-2">
              <Input
                icon="search"
                className="flex-1 min-w-0"
                placeholder={locale.search_reports || "Name or #ID"}
                value={filter.search}
                onChange={(event) => setFilter({ search: event.target.value })}
              />
              <Select
                className="w-[9.75rem] shrink-0"
                value={filter.category}
                onChange={(event) => setFilter({ category: event.target.value })}
                aria-label={locale.filter_by_category || "Filter by category"}
              >
                <option value="all">{locale.all_categories || "All categories"}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {locale[`category_${category.id}`] || category.label}
                  </option>
                ))}
              </Select>
            </div>
          </>
        ) : (
          <>
            <Button variant="primary" icon="plus" className="w-full" onClick={() => setIsCreatingReport(true)}>
              {locale.create_report || "Create Report"}
            </Button>
            <Segmented
              value={myView}
              onChange={setMyView}
              options={[
                { value: "active", label: locale.view_active || "Active", count: counts.active },
                { value: "resolved", label: locale.status_resolved || "Resolved" }
              ]}
            />
          </>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {isEmpty ? (
          archiveLoading ? (
            <EmptyState icon="history" title={locale.loading || "Loading..."} />
          ) : filtered ? (
            <EmptyState
              icon="search"
              title={locale.no_matching_reports || "No reports match this filter"}
              action={
                <Button size="sm" variant="subtle" onClick={() => setFilter({ search: "", category: "all" })}>
                  {locale.clear_filter || "Clear filter"}
                </Button>
              }
            />
          ) : isAdminTab ? (
            <EmptyState
              icon="inbox"
              title={filter.view === "resolved" ? locale.no_reports || "No reports found" : locale.queue_empty || "Nothing waiting"}
              hint={filter.view === "queue" ? locale.queue_empty_hint || "New reports show up here the moment they are created." : undefined}
            />
          ) : (
            <EmptyState
              icon="ticket"
              title={myView === "resolved" ? locale.no_reports || "No reports found" : locale.no_active_reports || "You have no active reports"}
              hint={myView === "active" ? locale.no_active_reports_hint || "Something wrong? Create a report and staff will get back to you here." : undefined}
            />
          )
        ) : (
          groups.map((group) => (
            <section key={group.key}>
              {group.label && (
                <h4 className="sticky top-0 z-10 flex items-center gap-2 h-8 px-3 border-b border-line bg-canvas text-xs font-medium text-fg-muted">
                  {group.status && <StatusGlyph status={group.status} />}
                  {group.label}
                  <span className="text-fg-faint tabular-nums">{group.reports.length}</span>
                </h4>
              )}
              {group.reports.map((report) => (
                <ReportRow key={report.id} report={report} />
              ))}
            </section>
          ))
        )}
      </div>
    </aside>
  )
}
