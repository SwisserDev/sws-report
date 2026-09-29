"use client"

import type { ReactNode } from "react"
import { Icon } from "@/components/ui"
import { cn } from "@/lib/utils"

interface SparklineProps {
  values: (number | null)[]
  className?: string
}

/** Tufte-style: no axes, no frame, the latest point marked */
export function Sparkline({ values, className }: SparklineProps) {
  const width = 120
  const height = 28
  const points = values.map((value, index) => ({ index, value })).filter((p): p is { index: number; value: number } => p.value !== null)

  if (points.length < 2) return <div className={cn("h-7", className)} />

  const max = Math.max(...points.map((p) => p.value))
  const min = Math.min(...points.map((p) => p.value))
  const span = max - min || 1
  const x = (index: number) => (values.length <= 1 ? 0 : (index / (values.length - 1)) * (width - 4) + 2)
  const y = (value: number) => height - 3 - ((value - min) / span) * (height - 6)
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(p.index).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ")
  const last = points[points.length - 1]

  // The line stretches with the tile, the end dot is HTML so it stays round
  return (
    <div className={cn("relative h-7", className)} aria-hidden="true">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full text-fg-faint">
        <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      </svg>
      <span
        className="absolute w-[5px] h-[5px] -ml-[2.5px] -mt-[2.5px] rounded-full bg-accent-fg"
        style={{ left: `${(x(last.index) / width) * 100}%`, top: `${(y(last.value) / height) * 100}%` }}
      />
    </div>
  )
}

export type DeltaMeaning = "up-good" | "down-good" | "neutral"

interface DeltaProps {
  current: number | null
  previous: number | null | undefined
  meaning: DeltaMeaning
  format: (value: number) => string
  label: string
}

/** Absolute change first, small bases make percentages look dramatic */
export function Delta({ current, previous, meaning, format, label }: DeltaProps) {
  if (current === null || previous === null || previous === undefined) {
    return <span className="text-xs text-fg-faint">{label}: –</span>
  }

  const diff = current - previous
  const percent = previous !== 0 ? Math.round((diff / previous) * 100) : null
  const flat = Math.abs(diff) < 1e-9 || (percent !== null && Math.abs(percent) < 1)
  const good = meaning === "neutral" || flat ? null : (diff > 0) === (meaning === "up-good")

  return (
    <span className="inline-flex items-center gap-1 text-xs whitespace-nowrap" title={label}>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 font-medium tabular-nums",
          good === null ? "text-fg-muted" : good ? "text-green-fg" : "text-red-fg"
        )}
      >
        {!flat && <Icon name={diff > 0 ? "arrowUp" : "arrowDown"} className="w-3 h-3" strokeWidth={2.25} />}
        {flat ? "±0" : `${diff > 0 ? "+" : "−"}${format(Math.abs(diff))}`}
        {!flat && percent !== null && <span className="font-normal text-fg-subtle">({percent > 0 ? "+" : ""}{percent}%)</span>}
      </span>
      <span className="text-fg-faint">{label}</span>
    </span>
  )
}

interface KpiTileProps {
  label: string
  value: ReactNode
  /** Grey the value out when it rests on too few measurements */
  weak?: boolean
  detail?: ReactNode
  delta?: ReactNode
  sparkline?: (number | null)[]
}

export function KpiTile({ label, value, weak, detail, delta, sparkline }: KpiTileProps) {
  return (
    <div className="flex flex-col gap-1 min-w-0 px-5 py-4">
      <span className="text-sm font-medium text-fg-muted">{label}</span>
      <span className={cn("text-2xl font-semibold tabular-nums tracking-tight", weak ? "text-fg-faint" : "text-fg")}>{value}</span>
      <span className="min-h-4 text-xs text-fg-subtle truncate">{detail}</span>
      <span className="min-h-4">{delta}</span>
      {sparkline && <Sparkline values={sparkline} className="mt-1.5" />}
    </div>
  )
}
