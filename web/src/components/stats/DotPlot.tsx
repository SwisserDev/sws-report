"use client"

import { useElementWidth } from "@/hooks/useElementWidth"
import { formatDuration } from "@/lib/time"

interface DotPlotProps {
  points: { createdAt: number; seconds: number; priority: number }[]
  median: number | null
  p90: number | null
  from: number
  to: number
  /** Priority id -> dot class, urgent/high stand out, the rest stays grey */
  dotClass: (priority: number) => string
  labels: { median: string; p90: string }
}

const HEIGHT = 200
const PAD = { top: 10, right: 118, bottom: 10, left: 52 }

// Durations span seconds to days, a log axis keeps both ends readable
const TICKS = [60, 600, 3600, 6 * 3600, 86400, 7 * 86400]

export function DotPlot({ points, median, p90, from, to, dotClass, labels }: DotPlotProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>()

  const innerWidth = Math.max(0, width - PAD.left - PAD.right)
  const innerHeight = HEIGHT - PAD.top - PAD.bottom
  const maxSeconds = Math.max(3600, ...points.map((p) => p.seconds))
  const top = TICKS.find((tick) => tick >= maxSeconds) ?? maxSeconds
  const minLog = Math.log(30)
  const maxLog = Math.log(top)

  const x = (time: number) => PAD.left + ((time - from) / Math.max(1, to - from)) * innerWidth
  const y = (seconds: number) => PAD.top + innerHeight - ((Math.log(Math.max(30, seconds)) - minLog) / (maxLog - minLog)) * innerHeight

  return (
    <div ref={ref} className="w-full" style={{ height: HEIGHT }}>
      {width > 0 && (
        <svg width={width} height={HEIGHT} className="block">
          {TICKS.filter((tick) => tick <= top).map((tick) => (
            <g key={tick}>
              <line x1={PAD.left} x2={PAD.left + innerWidth} y1={y(tick)} y2={y(tick)} className="stroke-line" />
              <text x={PAD.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-fg-faint text-[0.6875rem]">
                {formatDuration(tick)}
              </text>
            </g>
          ))}

          {points.map((point, index) => (
            <circle key={index} cx={x(point.createdAt)} cy={y(point.seconds)} r="2.6" className={dotClass(point.priority)} />
          ))}

          {[
            { value: median, label: labels.median, dash: undefined },
            { value: p90, label: labels.p90, dash: "4 4" }
          ].map((line) =>
            line.value !== null ? (
              <g key={line.label}>
                <line x1={PAD.left} x2={PAD.left + innerWidth} y1={y(line.value)} y2={y(line.value)} className="stroke-accent-fg" strokeWidth="1.5" strokeDasharray={line.dash} />
                <text x={PAD.left + innerWidth + 8} y={y(line.value)} dy="0.32em" className="fill-accent-fg text-[0.6875rem] font-medium">
                  {line.label} {formatDuration(line.value)}
                </text>
              </g>
            ) : null
          )}
        </svg>
      )}
    </div>
  )
}
