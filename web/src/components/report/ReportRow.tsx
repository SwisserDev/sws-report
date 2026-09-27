"use client"

import type { Report } from "@/types"
import { useReportStore } from "@/stores/reportStore"
import { Avatar, OnlineDot, PriorityGlyph, StatusGlyph } from "@/components/ui"
import { getAgeTone, getCategoryLabel, getLastSpeaker, getPriorityMeta, getStatusLabel } from "@/lib/reportMeta"
import { formatAge, formatFullDate } from "@/lib/time"
import { cn } from "@/lib/utils"

const AGE_COLOR = {
  neutral: "text-fg-subtle",
  amber: "text-amber-fg",
  orange: "text-orange-fg",
  red: "text-red-fg font-semibold"
}

export function ReportRow({ report }: { report: Report }) {
  const { selectedReportId, setSelectedReportId, categories, priorities, locale, activeTab, language } = useReportStore()

  const isAdminTab = activeTab === "admin"
  const selected = selectedReportId === report.id
  const priority = getPriorityMeta(report.priority, priorities, locale)
  const lastSpeaker = getLastSpeaker(report)

  // Staff: the player spoke last. Player: staff answered last.
  const waiting = report.status !== "resolved" && lastSpeaker === (isAdminTab ? "player" : "admin")
  const waitingLabel = isAdminTab ? locale.awaiting_reply || "Waiting for a reply" : locale.new_reply || "New reply from staff"

  // Only unclaimed reports heat up for staff, claimed ones already have someone on them
  const ageTone = isAdminTab && report.status === "open" ? getAgeTone(report.createdAt) : "neutral"

  return (
    <button
      type="button"
      onClick={() => setSelectedReportId(report.id)}
      className={cn(
        "relative w-full flex flex-col gap-1 px-3 py-2.5 text-left border-b border-line transition-colors duration-75",
        selected ? "bg-active" : "hover:bg-hover"
      )}
    >
      {selected && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent-fg" />}

      <span className="flex items-center gap-2 w-full min-w-0">
        {/* Priority is a staff tool, players would only read "Low" as "you don't matter" */}
        {isAdminTab && (
          <span title={`${locale.priority || "Priority"}: ${priority.label}`}>
            <PriorityGlyph meta={priority} />
          </span>
        )}
        <span className={cn("flex-1 min-w-0 truncate text-base", selected || waiting ? "font-semibold text-fg" : "font-medium text-fg")}>
          {report.subject}
        </span>
        {waiting && <span className="w-1.5 h-1.5 rounded-full bg-accent-fg shrink-0" title={waitingLabel} />}
        <span className={cn("text-xs tabular-nums shrink-0", AGE_COLOR[ageTone])} title={formatFullDate(report.createdAt, language)}>
          {formatAge(report.createdAt)}
        </span>
      </span>

      <span className="flex items-center gap-1.5 w-full min-w-0 text-sm text-fg-subtle">
        <span title={getStatusLabel(report.status, locale)}>
          <StatusGlyph status={report.status} />
        </span>
        <span className="font-mono text-xs text-fg-faint">#{report.id}</span>
        {isAdminTab && (
          <>
            <span className="truncate text-fg-muted">{report.playerName}</span>
            <OnlineDot online={report.isPlayerOnline} />
          </>
        )}
        <span className="text-fg-faint">·</span>
        <span className="truncate">{getCategoryLabel(report.category, categories, locale)}</span>

        {report.claimedByName && (
          <span className="ml-auto flex items-center gap-1.5 shrink-0 pl-2" title={`${locale.claimed_by || "Claimed by"} ${report.claimedByName}`}>
            <Avatar name={report.claimedByName} size="sm" />
            {!isAdminTab && <span className="text-xs text-fg-subtle truncate max-w-[7rem]">{report.claimedByName}</span>}
          </span>
        )}
      </span>
    </button>
  )
}
