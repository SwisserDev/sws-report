"use client"

import { useState } from "react"
import type { Report } from "@/types"
import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"
import { Avatar, Button, ConfirmDialog, Icon, IconButton, Menu, OnlineDot, PriorityGlyph, StatusGlyph } from "@/components/ui"
import { getCategoryLabel, getPriorityMeta, getStatusLabel } from "@/lib/reportMeta"
import { formatAge, formatDateTime, formatFullDate } from "@/lib/time"
import { cn } from "@/lib/utils"
import { PlayerInfoPanel } from "./PlayerInfoPanel"

const STATUS_TEXT = {
  open: "text-fg-muted",
  claimed: "text-amber-fg",
  resolved: "text-green-fg"
}

export function DetailHeader({ report }: { report: Report }) {
  const { playerData, categories, priorities, locale, activeTab, hasPermission, language } = useReportStore()
  const { claimReport, unclaimReport, resolveReport, deleteReport, setPriority } = useNuiActions()
  const [showPlayerInfo, setShowPlayerInfo] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isStaffView = activeTab === "admin"
  const isOwner = report.playerId === playerData?.identifier
  const claimedByMe = report.claimedBy === playerData?.identifier
  const priority = getPriorityMeta(report.priority, priorities, locale)
  const canSetPriority = isStaffView && hasPermission("set_priority") && report.status !== "resolved"
  const canDelete = (isOwner && report.status === "open") || (isStaffView && hasPermission("delete_report"))
  const canSeeHistory = isStaffView && hasPermission("view_player_history")

  const priorityTrigger = (
    <span className="inline-flex items-center gap-1.5 text-sm text-fg-muted">
      <PriorityGlyph meta={priority} />
      {priority.label}
    </span>
  )

  return (
    <div className="px-5 pt-3.5 pb-4 border-b border-line bg-panel shrink-0">
      <div className="flex items-center gap-3 min-h-8">
        <span className="font-mono text-xs text-fg-faint">#{report.id}</span>

        <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", STATUS_TEXT[report.status])}>
          <StatusGlyph status={report.status} />
          {getStatusLabel(report.status, locale)}
        </span>

        {report.claimedByName && (
          <span className="inline-flex items-center gap-1.5 text-sm text-fg-muted">
            <Avatar name={report.claimedByName} size="sm" />
            {report.claimedByName}
          </span>
        )}

        {!isStaffView ? null : canSetPriority ? (
          <Menu
            trigger={({ toggle, open }) => (
              <button
                type="button"
                onClick={toggle}
                className={cn(
                  "inline-flex items-center gap-1 h-7 pl-2 pr-1.5 rounded-md border transition-colors",
                  open ? "border-line-focus bg-hover" : "border-line-strong hover:bg-hover"
                )}
                title={locale.priority || "Priority"}
              >
                {priorityTrigger}
                <Icon name="chevronDown" className="w-3.5 h-3.5 text-fg-faint" />
              </button>
            )}
            items={[...priorities].sort((a, b) => b.id - a.id).map((config) => {
              const meta = getPriorityMeta(config.id, priorities, locale)
              return {
                key: String(config.id),
                label: meta.label,
                leading: <PriorityGlyph meta={meta} />,
                selected: config.id === report.priority,
                onSelect: () => config.id !== report.priority && setPriority(report.id, config.id)
              }
            })}
          />
        ) : (
          <span title={locale.priority || "Priority"}>{priorityTrigger}</span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {isStaffView && report.status === "open" && hasPermission("claim_report") && (
            <Button variant="primary" icon="hand" onClick={() => claimReport(report.id)}>
              {locale.claim_report || "Claim"}
            </Button>
          )}
          {isStaffView && report.status === "claimed" && claimedByMe && hasPermission("claim_report") && (
            <Button variant="ghost" icon="release" onClick={() => unclaimReport(report.id)}>
              {locale.unclaim_report || "Unclaim"}
            </Button>
          )}
          {isStaffView && report.status !== "resolved" && hasPermission("resolve_report") && (
            <Button
              // Resolve becomes the main action once someone is on it
              variant={report.status === "claimed" ? "primary" : "secondary"}
              icon="check"
              onClick={() => resolveReport(report.id)}
            >
              {locale.resolve_report || "Resolve"}
            </Button>
          )}
          {!isStaffView && canDelete && (
            <Button variant="subtle" icon="trash" onClick={() => setConfirmDelete(true)}>
              {locale.withdraw_report || "Withdraw"}
            </Button>
          )}
          {isStaffView && canDelete && (
            <Menu
              align="right"
              trigger={({ toggle, open }) => (
                <IconButton icon="dots" label={locale.more || "More"} onClick={toggle} active={open} />
              )}
              items={[
                {
                  key: "delete",
                  label: locale.delete_report || "Delete report",
                  icon: "trash",
                  danger: true,
                  onSelect: () => setConfirmDelete(true)
                }
              ]}
            />
          )}
        </div>
      </div>

      <h2 className="mt-1.5 text-lg font-semibold text-fg leading-snug line-clamp-2">{report.subject}</h2>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-fg-subtle">
        {isStaffView && (
          <span className="inline-flex items-center gap-2 text-fg">
            <Avatar name={report.playerName} size="sm" />
            <span className="font-medium">{report.playerName}</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-fg-subtle">
              <OnlineDot online={report.isPlayerOnline} />
              {report.isPlayerOnline ? locale.online || "Online" : locale.offline || "Offline"}
            </span>
            {canSeeHistory && (
              <button
                type="button"
                onClick={() => setShowPlayerInfo(true)}
                className="inline-flex items-center gap-1 h-6 ml-1 px-2 rounded-md border border-line-strong text-xs text-fg-muted hover:bg-hover hover:text-fg"
              >
                <Icon name="history" className="w-3.5 h-3.5" />
                {locale.view_player_info || "View Player Info"}
              </button>
            )}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <Icon name="tag" className="w-3.5 h-3.5 text-fg-faint" />
          {getCategoryLabel(report.category, categories, locale)}
        </span>
        <span className="inline-flex items-center gap-1.5" title={formatFullDate(report.createdAt, language)}>
          <Icon name="clock" className="w-3.5 h-3.5 text-fg-faint" />
          {formatDateTime(report.createdAt, language)}
          <span className="text-fg-faint">· {formatAge(report.createdAt)}</span>
        </span>
      </div>

      {report.description && (
        <p className="mt-3 pl-3 border-l-2 border-line-strong text-base text-fg-muted leading-relaxed prewrap max-h-[6.5rem] overflow-y-auto">
          {report.description}
        </p>
      )}

      {showPlayerInfo && (
        <PlayerInfoPanel playerId={report.playerId} playerName={report.playerName} onClose={() => setShowPlayerInfo(false)} />
      )}

      <ConfirmDialog
        isOpen={confirmDelete}
        title={isStaffView ? locale.delete_report || "Delete report" : locale.withdraw_report || "Withdraw report"}
        message={(locale.delete_report_message || "Report #%d and its chat will be removed for good.").replace("%d", String(report.id))}
        confirmLabel={isStaffView ? locale.delete_report || "Delete report" : locale.withdraw_report || "Withdraw"}
        onConfirm={() => deleteReport(report.id)}
        onClose={() => setConfirmDelete(false)}
      />
    </div>
  )
}
