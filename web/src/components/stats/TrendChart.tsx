"use client"

import { useState } from "react"
import type { StatsBucket } from "@/types"
import { useElementWidth } from "@/hooks/useElementWidth"
import { formatBucket, niceMax, tickIndexes } from "./format"

interface TrendChartProps {
  series: StatsBucket[]
  bucket: "hour" | "day" | "week"
  language: string
  labels: { created: string; resolved: string; backlog: string }
}

const HEIGHT = 220
const PAD = { top: 12, right: 72, bottom: 26, left: 36 }

/** Created vs. resolved over time, lines labelled at their ends instead of a legend */
export function TrendChart({ series, bucket, language, labels }: TrendChartProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)

  const innerWidth = Math.max(0, width - PAD.left - PAD.right)
  const innerHeight = HEIGHT - PAD.top - PAD.bottom
  const max = niceMax(Math.max(1, ...series.map((b) => Math.max(b.created, b.resolved))))
  const count = series.length

  const x = (index: number) => PAD.left + (count <= 1 ? innerWidth / 2 : (index / (count - 1)) * innerWidth)
  const y = (value: number) => PAD.top + innerHeight - (value / max) * innerHeight
  const line = (key: "created" | "resolved") => series.map((b, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(b[key]).toFixed(1)}`).join(" ")

  const last = series[count - 1]
  const grid = [0, 0.5, 1].map((f) => Math.round(max * f))
  const hovered = hover !== null ? series[hover] : null

  // Keep the two end labels from sitting on top of each other
  let createdLabelY = last ? y(last.created) : 0
  let resolvedLabelY = last ? y(last.resolved) : 0
  if (Math.abs(createdLabelY - resolvedLabelY) < 14) {
    const mid = (createdLabelY + resolvedLabelY) / 2
    const up = last && last.created >= last.resolved
    createdLabelY = mid + (up ? -7 : 7)
    resolvedLabelY = mid + (up ? 7 : -7)
  }

  return (
    <div ref={ref} className="relative w-full" style={{ height: HEIGHT }} onMouseLeave={() => setHover(null)}>
      {width > 0 && count > 0 && (
        <svg width={width} height={HEIGHT} className="block">
          {grid.map((value) => (
            <g key={value}>
              <line x1={PAD.left} x2={PAD.left + innerWidth} y1={y(value)} y2={y(value)} className="stroke-line" strokeDasharray={value ? "3 4" : undefined} />
              <text x={PAD.left - 8} y={y(value)} dy="0.32em" textAnchor="end" className="fill-fg-faint text-[0.6875rem] tabular-nums">{value}</text>
            </g>
          ))}

          {tickIndexes(count).map((index) => (
            <text key={index} x={x(index)} y={HEIGHT - 6} textAnchor="middle" className="fill-fg-faint text-[0.6875rem]">
              {formatBucket(series[index].date, bucket, language)}
            </text>
          ))}

          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerHeight} className="stroke-line-focus" />}

          <path d={line("created")} fill="none" className="stroke-fg-subtle" strokeWidth="1.75" strokeLinejoin="round" />
          <path d={line("resolved")} fill="none" className="stroke-accent-fg" strokeWidth="2.25" strokeLinejoin="round" />

          {hovered && hover !== null && (
            <>
              <circle cx={x(hover)} cy={y(hovered.created)} r="3.5" className="fill-panel stroke-fg-subtle" strokeWidth="1.75" />
              <circle cx={x(hover)} cy={y(hovered.resolved)} r="3.5" className="fill-panel stroke-accent-fg" strokeWidth="2" />
            </>
          )}

          {last && (
            <>
              <text x={x(count - 1) + 8} y={createdLabelY} dy="0.32em" className="fill-fg-subtle text-xs">{labels.created}</text>
              <text x={x(count - 1) + 8} y={resolvedLabelY} dy="0.32em" className="fill-accent-fg text-xs font-medium">{labels.resolved}</text>
            </>
          )}

          {/* Hover targets, one column per bucket */}
          {series.map((_, index) => (
            <rect
              key={index}
              x={x(index) - innerWidth / Math.max(1, count - 1) / 2}
              y={PAD.top}
              width={innerWidth / Math.max(1, count - 1)}
              height={innerHeight}
              fill="transparent"
              onMouseEnter={() => setHover(index)}
            />
          ))}
        </svg>
      )}

      {hovered && hover !== null && (
        <div
          className="absolute top-2 z-10 min-w-[10rem] px-3 py-2 rounded-md border border-line-strong bg-panel shadow-[var(--shadow-pop)] text-xs pointer-events-none"
          style={x(hover) > width / 2 ? { right: width - x(hover) + 12 } : { left: x(hover) + 12 }}
        >
          <div className="mb-1 font-medium text-fg">{formatBucket(hovered.date, bucket, language, true)}</div>
          <div className="flex justify-between gap-4 text-fg-subtle"><span>{labels.created}</span><span className="tabular-nums text-fg">{hovered.created}</span></div>
          <div className="flex justify-between gap-4 text-accent-fg"><span>{labels.resolved}</span><span className="tabular-nums">{hovered.resolved}</span></div>
          <div className="flex justify-between gap-4 text-fg-subtle"><span>{labels.backlog}</span><span className="tabular-nums text-fg">{hovered.backlog}</span></div>
        </div>
      )}
    </div>
  )
}
