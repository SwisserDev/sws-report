"use client"

import { useState } from "react"
import { useReportStore } from "@/stores/reportStore"
import { EmptyState, Icon, type IconName } from "@/components/ui"
import { cn } from "@/lib/utils"
import { DetailHeader } from "./DetailHeader"
import { ActionBar } from "./ActionBar"
import { ReportChat } from "./ReportChat"
import { ReportNotes } from "./ReportNotes"
import { InventoryPanel } from "./InventoryPanel"

type DetailTab = "chat" | "notes" | "inventory"

export function ReportDetail() {
  const { getSelectedReport, locale, activeTab, hasPermission, getReportNotes } = useReportStore()
  const [tabState, setTabState] = useState<{ reportId?: number; tab: DetailTab }>({ tab: "chat" })

  const report = getSelectedReport()
  const isStaffView = activeTab === "admin"

  // A new report starts on the conversation, not on whatever tab the last one had open
  const detailTab = tabState.reportId === report?.id ? tabState.tab : "chat"
  const setDetailTab = (tab: DetailTab) => setTabState({ reportId: report?.id, tab })

  if (!report) {
    return (
      <main className="flex-1 flex items-center justify-center bg-canvas">
        <EmptyState
          icon="ticket"
          title={locale.select_report || "Select a report to view details"}
          hint={isStaffView ? locale.select_report_hint || "Unclaimed reports are listed first, the most urgent on top." : undefined}
        />
      </main>
    )
  }

  const noteCount = getReportNotes(report.id).length
  const tabs: { id: DetailTab; label: string; icon: IconName; count?: number; visible: boolean }[] = [
    { id: "chat", label: locale.chat || "Chat", icon: "chat", visible: true },
    { id: "notes", label: locale.admin_notes || "Notes", icon: "note", count: noteCount, visible: hasPermission("view_notes") },
    // Inventory actions need a live report on the server
    { id: "inventory", label: locale.inventory || "Inventory", icon: "box", visible: hasPermission("manage_inventory") && report.status !== "resolved" }
  ]

  return (
    <main className="flex-1 min-w-0 flex flex-col min-h-0 bg-canvas">
      <DetailHeader report={report} />

      {isStaffView && (
        <div className="flex items-stretch h-10 px-3 border-b border-line bg-panel shrink-0" role="tablist">
          {tabs.filter((tab) => tab.visible).map((tab) => {
            const selected = detailTab === tab.id
            // Notes are staff-only, the tab says so in color as well
            const isNotes = tab.id === "notes"
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setDetailTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 text-sm font-medium transition-colors duration-100",
                  selected ? (isNotes ? "text-amber-fg" : "text-fg") : "text-fg-subtle hover:text-fg"
                )}
              >
                <Icon name={tab.icon} />
                {tab.label}
                {!!tab.count && <span className="text-xs tabular-nums text-fg-faint">{tab.count}</span>}
                <span
                  className={cn(
                    "absolute left-1.5 right-1.5 bottom-0 h-0.5 rounded-full",
                    selected ? (isNotes ? "bg-amber" : "bg-accent-fg") : "bg-transparent"
                  )}
                />
              </button>
            )
          })}
        </div>
      )}

      {!isStaffView || detailTab === "chat" ? (
        <ReportChat report={report} />
      ) : detailTab === "notes" ? (
        <ReportNotes reportId={report.id} />
      ) : (
        <InventoryPanel reportId={report.id} isPlayerOnline={report.isPlayerOnline} />
      )}

      {isStaffView && report.status !== "resolved" && <ActionBar report={report} />}
    </main>
  )
}
