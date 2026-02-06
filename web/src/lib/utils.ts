/**
 * Parse timestamp handling both ISO 8601 UTC and legacy formats
 */
const parseTimestamp = (timestamp: unknown): Date | null => {
  if (timestamp instanceof Date) {
    return Number.isNaN(timestamp.getTime()) ? null : timestamp
  }

  const parseUnixNumber = (value: number): Date | null => {
    if (!Number.isFinite(value) || value < 0) return null
    const seconds = value > 1_000_000_000_000 ? Math.floor(value / 1000) : Math.floor(value)
    const date = new Date(seconds * 1000)
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (typeof timestamp === "number") {
    return parseUnixNumber(timestamp)
  }

  if (typeof timestamp !== "string") {
    return null
  }

  const normalized = timestamp.trim()
  if (!normalized) {
    return null
  }

  if (/^\d+$/.test(normalized)) {
    return parseUnixNumber(Number(normalized))
  }

  if (normalized.includes("T")) {
    const isoDate = new Date(normalized)
    return Number.isNaN(isoDate.getTime()) ? null : isoDate
  }

  const sqlTimestamp = normalized.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})(?:\.\d+)?$/)
  if (sqlTimestamp) {
    const sqlDate = new Date(`${sqlTimestamp[1]}T${sqlTimestamp[2]}Z`)
    return Number.isNaN(sqlDate.getTime()) ? null : sqlDate
  }

  const fallbackDate = new Date(normalized)
  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate
}

/**
 * Format a timestamp for display
 */
export const formatTimestamp = (timestamp: unknown): string => {
  const date = parseTimestamp(timestamp)
  if (!date) {
    if (typeof timestamp === "string" && timestamp.trim() !== "") {
      return timestamp
    }
    return "Unknown"
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (timestamp: unknown): string => {
  const date = parseTimestamp(timestamp)
  if (!date) return "Unknown"

  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 0) return "Just now"

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return "Just now"
}

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + "..."
}

/**
 * Capitalize first letter
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Get status color class
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "open":
      return "status-open"
    case "claimed":
      return "status-claimed"
    case "resolved":
      return "status-resolved"
    default:
      return ""
  }
}

/**
 * Get status label
 */
export const getStatusLabel = (status: string, locale: Record<string, string>): string => {
  const key = `status_${status}`
  return locale[key] || capitalize(status)
}

/**
 * Debounce function
 */
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Class name builder
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ")
}
