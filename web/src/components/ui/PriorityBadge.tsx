"use client"

import { useReportStore } from "@/stores/reportStore"
import { cn } from "@/lib/utils"

interface PriorityBadgeProps {
  priority: number
  size?: "sm" | "md"
}

const priorityColors: Record<string, string> = {
  gray: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30"
}

export function PriorityBadge({ priority, size = "sm" }: PriorityBadgeProps) {
  const { priorities, locale } = useReportStore()

  const config = priorities.find((p) => p.id === priority)
  if (!config) return null

  const colorClass = priorityColors[config.color] || priorityColors.gray
  const label = locale[`priority_${config.label.toLowerCase()}`] || config.label

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium border rounded",
        colorClass,
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"
      )}
    >
      <svg className={cn("fill-current", size === "sm" ? "w-2 h-2" : "w-3 h-3")} viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" />
      </svg>
      {label}
    </span>
  )
}
