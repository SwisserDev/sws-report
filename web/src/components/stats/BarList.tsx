import type { ReactNode } from "react"
import { formatNumber } from "@/lib/time"

interface BarListItem {
  key: string
  label: ReactNode
  value: number
  /** Optional right-hand column, e.g. a median duration */
  extra?: ReactNode
}

/** Horizontal bars sorted by value, numbers at the bar end */
export function BarList({ items, total, extraHeader, language }: { items: BarListItem[]; total: number; extraHeader?: string; language: string }) {
  const max = Math.max(1, ...items.map((item) => item.value))

  return (
    <div className="flex flex-col gap-2.5">
      {extraHeader && (
        <div className="flex justify-end text-2xs text-fg-faint">
          <span className="w-[5.5rem] text-right">{extraHeader}</span>
        </div>
      )}
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-3 text-sm">
          <span className="w-[8.5rem] shrink-0 truncate text-fg-muted">{item.label}</span>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <div className="h-2 rounded-full bg-accent-line" style={{ width: `${Math.max(1, (item.value / max) * 100)}%` }} />
            <span className="shrink-0 tabular-nums text-fg">{formatNumber(item.value, language)}</span>
            <span className="shrink-0 tabular-nums text-xs text-fg-faint">{total ? Math.round((item.value / total) * 100) : 0}%</span>
          </div>
          {item.extra !== undefined && <span className="w-[5.5rem] shrink-0 text-right tabular-nums text-fg-muted">{item.extra}</span>}
        </div>
      ))}
    </div>
  )
}
