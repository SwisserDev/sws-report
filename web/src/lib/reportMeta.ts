import type { PriorityConfig, Report, ReportStatus } from "@/types"
import { parseTimestamp } from "./time"

export type PriorityKind = "bars" | "urgent"

export interface PriorityMeta {
  id: number
  label: string
  kind: PriorityKind
  bars: number
  tone: "muted" | "orange" | "red"
}

// Config colors are free-form names, only orange/red carry meaning in the UI
const TONES: Record<string, PriorityMeta["tone"]> = {
  orange: "orange",
  red: "red"
}

export const getPriorityMeta = (
  priority: number,
  priorities: PriorityConfig[],
  locale: Record<string, string>
): PriorityMeta => {
  const sorted = [...priorities].sort((a, b) => a.id - b.id)
  const index = Math.max(0, sorted.findIndex((p) => p.id === priority))
  const config = sorted[index] ?? { id: priority, label: String(priority), color: "gray" }
  const tone = TONES[config.color] ?? "muted"

  return {
    id: config.id,
    label: locale[`priority_${config.label.toLowerCase()}`] || config.label,
    kind: tone === "red" ? "urgent" : "bars",
    bars: Math.min(3, index + 1),
    tone
  }
}

export const getStatusLabel = (status: ReportStatus, locale: Record<string, string>) =>
  locale[`status_${status}`] || status.charAt(0).toUpperCase() + status.slice(1)

export const getCategoryLabel = (
  categoryId: string,
  categories: { id: string; label: string }[],
  locale: Record<string, string>
) => locale[`category_${categoryId}`] || categories.find((c) => c.id === categoryId)?.label || categoryId

/**
 * Who has to act next, judged by the last chat message.
 * Staff see "player" as "waiting for us", players see "staff" as "new answer".
 */
export const getLastSpeaker = (report: Report): "player" | "admin" | null => {
  const messages = report.messages || []
  for (let i = messages.length - 1; i >= 0; i--) {
    const type = messages[i].senderType
    if (type === "player" || type === "admin") return type
  }
  return null
}

// Unclaimed reports get warmer the longer they wait (minutes)
const AGE_STEPS = [
  { minutes: 60, tone: "red" },
  { minutes: 30, tone: "orange" },
  { minutes: 10, tone: "amber" }
] as const

export type AgeTone = "red" | "orange" | "amber" | "neutral"

export const getAgeTone = (createdAt: unknown, now = Date.now()): AgeTone => {
  const created = parseTimestamp(createdAt)
  if (!created) return "neutral"

  const minutes = (now - created.getTime()) / 60000
  for (const step of AGE_STEPS) {
    if (minutes >= step.minutes) return step.tone
  }
  return "neutral"
}

export const initials = (name: string) =>
  name
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?"
