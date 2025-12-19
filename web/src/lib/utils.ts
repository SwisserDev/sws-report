/**
 * Parse timestamp handling both ISO 8601 UTC and legacy formats
 */
const parseTimestamp = (timestamp: string): Date => {
  // Guard against null/undefined/non-string
  if (!timestamp || typeof timestamp !== 'string') {
    return new Date()
  }
  // ISO 8601 format (new): "2025-01-16T14:30:45Z"
  if (timestamp.includes('T')) {
    return new Date(timestamp)
  }
  // Legacy format: "2025-01-16 14:30:45" - treat as UTC
  return new Date(timestamp.replace(' ', 'T') + 'Z')
}

/**
 * Format a timestamp for display
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = parseTimestamp(timestamp)
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
export const formatRelativeTime = (timestamp: string): string => {
  const date = parseTimestamp(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

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
