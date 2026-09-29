"use client"

import { useMemo, useState } from "react"
import type { StaffStats } from "@/types"
import { Avatar, Icon } from "@/components/ui"
import { formatDuration, formatNumber } from "@/lib/time"
import { cn } from "@/lib/utils"
import { median } from "./format"

type SortKey = "adminName" | "handled" | "resolved" | "messages" | "firstResponseMedian" | "resolutionMedian"

interface StaffTableProps {
  staff: StaffStats[]
  labels: Record<SortKey, string> & { teamMedian: string }
  language: string
}

const COUNT_KEYS: SortKey[] = ["handled", "resolved", "messages"]
const DURATION_KEYS: SortKey[] = ["firstResponseMedian", "resolutionMedian"]

/**
 * Plain sortable table instead of a leaderboard: no ranks or medals,
 * alphabetical by default, a team median row to compare against.
 */
export function StaffTable({ staff, labels, language }: StaffTableProps) {
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "adminName", desc: false })

  const rows = useMemo(() => {
    const sorted = [...staff].sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv)
      // Missing durations always sink to the bottom
      if (av === null || av === undefined) return 1
      if (bv === null || bv === undefined) return -1
      return (av as number) - (bv as number)
    })
    return sort.desc ? sorted.reverse() : sorted
  }, [staff, sort])

  const maxima = Object.fromEntries(COUNT_KEYS.map((key) => [key, Math.max(1, ...staff.map((s) => s[key] as number))]))

  const toggle = (key: SortKey) =>
    setSort((current) => (current.key === key ? { key, desc: !current.desc } : { key, desc: COUNT_KEYS.includes(key) }))

  const header = (key: SortKey, align: "left" | "right" = "right") => (
    <th key={key} className={cn("px-4 h-9 font-medium", align === "right" ? "text-right" : "text-left")}>
      <button
        type="button"
        onClick={() => toggle(key)}
        className={cn("inline-flex items-center gap-1 hover:text-fg", sort.key === key ? "text-fg" : "text-fg-subtle")}
      >
        {labels[key]}
        {sort.key === key && <Icon name={sort.desc ? "arrowDown" : "arrowUp"} className="w-3 h-3" strokeWidth={2.25} />}
      </button>
    </th>
  )

  return (
    <table className="w-full text-sm">
      <thead className="border-b border-line text-xs">
        <tr>
          {header("adminName", "left")}
          {[...COUNT_KEYS, ...DURATION_KEYS].map((key) => header(key))}
        </tr>
      </thead>
      <tbody>
        {rows.map((person) => (
          <tr key={person.adminId} className="border-b border-line last:border-b-0 hover:bg-hover">
            <td className="px-4 h-11">
              <span className="flex items-center gap-2.5">
                <Avatar name={person.adminName} size="sm" />
                <span className="text-base text-fg">{person.adminName}</span>
              </span>
            </td>
            {COUNT_KEYS.map((key) => (
              <td key={key} className="px-4 text-right">
                <span className="inline-flex items-center justify-end gap-2.5 w-full">
                  <span className="w-16 h-1.5 rounded-full bg-raised overflow-hidden">
                    <span className="block h-full rounded-full bg-accent-line" style={{ width: `${((person[key] as number) / maxima[key]) * 100}%` }} />
                  </span>
                  <span className="w-12 tabular-nums text-fg">{formatNumber(person[key] as number, language)}</span>
                </span>
              </td>
            ))}
            {DURATION_KEYS.map((key) => (
              <td key={key} className="px-4 text-right tabular-nums text-fg-muted">{formatDuration(person[key] as number | null)}</td>
            ))}
          </tr>
        ))}
      </tbody>
      {staff.length > 1 && (
        <tfoot className="border-t border-line-strong text-fg-subtle">
          <tr>
            <td className="px-4 h-10 text-sm font-medium">{labels.teamMedian}</td>
            {COUNT_KEYS.map((key) => (
              <td key={key} className="px-4 text-right tabular-nums">
                <span className="inline-block w-12">{formatNumber(Math.round(median(staff.map((s) => s[key] as number)) ?? 0), language)}</span>
              </td>
            ))}
            {DURATION_KEYS.map((key) => (
              <td key={key} className="px-4 text-right tabular-nums">{formatDuration(median(staff.map((s) => s[key] as number | null)))}</td>
            ))}
          </tr>
        </tfoot>
      )}
    </table>
  )
}
