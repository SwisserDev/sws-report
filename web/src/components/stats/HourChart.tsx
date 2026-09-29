"use client"

import { useState } from "react"
import { formatDuration } from "@/lib/time"
import { cn } from "@/lib/utils"
import { formatHour, formatHourTick } from "./format"

interface HourChartProps {
  hours: { hour: number; created: number; firstResponseMedian?: number | null }[]
  language: string
  labels: { reports: string; firstResponse: string }
}

/**
 * Reports per hour of day with the median first reply underneath:
 * shows when the load comes in and whether staff keep up at that time.
 */
export function HourChart({ hours, language, labels }: HourChartProps) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...hours.map((h) => h.created))
  const busiest = hours.reduce((best, h) => (h.created > best.created ? h : best), hours[0])
  const slowest = Math.max(1, ...hours.map((h) => h.firstResponseMedian ?? 0))
  const shown = hover !== null ? hours[hover] : busiest

  return (
    <div onMouseLeave={() => setHover(null)}>
      <div className="flex items-baseline gap-2 mb-3 text-sm">
        <span className="font-medium text-fg tabular-nums">
          {formatHour(shown.hour, language)}–{formatHour((shown.hour + 1) % 24, language)}
        </span>
        <span className="text-fg-subtle tabular-nums">
          {shown.created} {labels.reports} · {labels.firstResponse} {formatDuration(shown.firstResponseMedian)}
        </span>
      </div>

      <div className="flex items-end gap-[3px] h-[8.5rem]">
        {hours.map((h, index) => (
          <div key={h.hour} className="flex-1 h-full flex items-end" onMouseEnter={() => setHover(index)}>
            <div
              className={cn(
                "w-full rounded-t-[2px]",
                hover === index ? "bg-accent-fg" : h.hour === busiest.hour ? "bg-accent" : "bg-line-focus"
              )}
              style={{ height: `${Math.max(2, (h.created / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>

      {/* Response time strip: one hue, darker means slower */}
      <div className="flex gap-[3px] mt-1.5 h-2.5">
        {hours.map((h, index) => (
          <div
            key={h.hour}
            className="flex-1 rounded-[2px] bg-amber"
            style={{ opacity: h.firstResponseMedian ? 0.12 + (h.firstResponseMedian / slowest) * 0.88 : 0.05 }}
            onMouseEnter={() => setHover(index)}
          />
        ))}
      </div>

      <div className="flex mt-1.5 text-2xs text-fg-faint tabular-nums">
        {hours.map((h) => (
          <span key={h.hour} className="flex-1 text-center whitespace-nowrap">{h.hour % 3 === 0 ? formatHourTick(h.hour) : ""}</span>
        ))}
      </div>
    </div>
  )
}
