/**
 * Accepts ISO strings, "YYYY-MM-DD HH:MM:SS" (UTC) and unix seconds/milliseconds,
 * the server has produced all of them over time.
 */
export const parseTimestamp = (timestamp: unknown): Date | null => {
  if (timestamp instanceof Date) {
    return Number.isNaN(timestamp.getTime()) ? null : timestamp
  }

  const fromUnix = (value: number): Date | null => {
    if (!Number.isFinite(value) || value < 0) return null
    const millis = value > 1_000_000_000_000 ? value : value * 1000
    const date = new Date(millis)
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (typeof timestamp === "number") return fromUnix(timestamp)
  if (typeof timestamp !== "string") return null

  const value = timestamp.trim()
  if (!value) return null
  if (/^\d+$/.test(value)) return fromUnix(Number(value))

  const sql = value.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})(?:\.\d+)?$/)
  const date = new Date(sql ? `${sql[1]}T${sql[2]}Z` : value)
  return Number.isNaN(date.getTime()) ? null : date
}

const safeLanguage = (language: string) => {
  try {
    return Intl.DateTimeFormat.supportedLocalesOf([language]).length ? language : "en"
  } catch {
    return "en"
  }
}

/** Compact age for list rows: now, 5m, 2h, 3d, 5w */
export const formatAge = (timestamp: unknown, now = Date.now()): string => {
  const date = parseTimestamp(timestamp)
  if (!date) return "–"

  const minutes = Math.max(0, Math.floor((now - date.getTime()) / 60000))
  if (minutes < 1) return "now"
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return `${Math.floor(days / 7)}w`
}

/** Short absolute time: "15:28" today, "Mon 15:28" this week, "1 Oct, 15:28" otherwise */
export const formatDateTime = (timestamp: unknown, language = "en"): string => {
  const date = parseTimestamp(timestamp)
  if (!date) return "–"

  const lang = safeLanguage(language)
  const now = new Date()
  const time = date.toLocaleTimeString(lang, { hour: "numeric", minute: "2-digit" })

  if (date.toDateString() === now.toDateString()) return time

  const ageDays = (now.getTime() - date.getTime()) / 86_400_000
  if (ageDays < 6) {
    return `${date.toLocaleDateString(lang, { weekday: "short" })} ${time}`
  }

  return date.toLocaleString(lang, {
    day: "numeric",
    month: "short",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
    hour: "numeric",
    minute: "2-digit"
  })
}

/** Full date for tooltips */
export const formatFullDate = (timestamp: unknown, language = "en"): string => {
  const date = parseTimestamp(timestamp)
  if (!date) return ""
  return date.toLocaleString(safeLanguage(language), { dateStyle: "medium", timeStyle: "short" })
}

/** Durations for statistics: 45 s, 4 min, 1 h 12 min, 2 d 3 h */
export const formatDuration = (seconds: number | null | undefined): string => {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return "–"
  if (seconds < 60) return `${Math.round(seconds)} s`

  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    const rest = minutes % 60
    return rest ? `${hours} h ${rest} min` : `${hours} h`
  }

  const days = Math.floor(hours / 24)
  const restHours = hours % 24
  return restHours ? `${days} d ${restHours} h` : `${days} d`
}

export const formatNumber = (value: number, language = "en") => {
  try {
    return value.toLocaleString(safeLanguage(language))
  } catch {
    return String(value)
  }
}
