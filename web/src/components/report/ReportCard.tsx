"use client"

import type { Report } from "@/types"
import { useReportStore } from "@/stores/reportStore"
import { formatRelativeTime, cn } from "@/lib/utils"
import { Badge } from "@/components/ui"
import { PriorityBadge } from "@/components/ui/PriorityBadge"

interface ReportCardProps {
  report: Report
}

export function ReportCard({ report }: ReportCardProps) {
  const { selectedReportId, setSelectedReportId, categories, locale } = useReportStore()

  const isSelected = selectedReportId === report.id
  const category = categories.find((c) => c.id === report.category)

  const getStatusVariant = () => {
    switch (report.status) {
      case "open": return "open"
      case "claimed": return "claimed"
      case "resolved": return "resolved"
      default: return "default"
    }
  }

  const getStatusLabel = () => {
    const key = `status_${report.status}`
    return locale[key] || report.status
  }

  return (
    <div
      onClick={() => setSelectedReportId(report.id)}
      className={cn(
        "p-4 bg-bg-card border border-border rounded-lg cursor-pointer transition-all duration-200",
        "hover:bg-bg-tertiary hover:border-border-hover",
        isSelected && "border-accent bg-bg-tertiary"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <span className="flex items-center gap-1.5 font-mono text-xs text-text-tertiary">
          #{report.id}
          <span
            className={`w-2 h-2 rounded-full ${report.isPlayerOnline ? "bg-green-500" : "bg-red-500"}`}
            title={report.isPlayerOnline ? "Online" : "Offline"}
          />
        </span>
        <div className="flex items-center gap-1.5">
          <PriorityBadge priority={report.priority} size="sm" />
          <Badge variant={getStatusVariant()}>{getStatusLabel()}</Badge>
        </div>
      </div>

      {/* Subject */}
      <h4 className="text-[15px] font-semibold text-text-primary mb-2 line-clamp-2">
        {report.subject}
      </h4>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-text-tertiary">
        {category && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-bg-elevated rounded">
            {category.label}
          </span>
        )}
        <span>{formatRelativeTime(report.createdAt)}</span>
        {report.claimedByName && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {report.claimedByName}
          </span>
        )}
      </div>
    </div>
  )
}
