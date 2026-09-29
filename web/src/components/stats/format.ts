import type { StatsBucket } from "@/types"

const safeLanguage = (language: string) => {
  try {
    return Intl.DateTimeFormat.supportedLocalesOf([language]).length ? language : "en"
  } catch {
    return "en"
  }
}

/** "2026-09-30" / "2026-09-30 14:00" as a local date */
export const parseBucket = (label: string): Date => {
  const [datePart, timePart] = label.split(" ")
  const [year, month, day] = datePart.split("-").map(Number)
  const hour = timePart ? Number(timePart.slice(0, 2)) : 12
  return new Date(year, month - 1, day, hour)
}

export const formatBucket = (label: string, bucket: "hour" | "day" | "week", language: string, long = false) => {
  const date = parseBucket(label)
  const lang = safeLanguage(language)

  if (bucket === "hour") return date.toLocaleTimeString(lang, { hour: "numeric", minute: "2-digit" })
  if (long) return date.toLocaleDateString(lang, { weekday: "short", day: "numeric", month: "short" })
  return date.toLocaleDateString(lang, { day: "numeric", month: "short" })
}

export const formatHour = (hour: number, language: string) =>
  new Date(2000, 0, 1, hour).toLocaleTimeString(safeLanguage(language), { hour: "numeric", minute: "2-digit" })

/** Compact 24h axis label, "12 AM" style labels wrap under narrow columns */
export const formatHourTick = (hour: number) => `${String(hour).padStart(2, "0")}:00`

/** Median of whatever numbers are present, used for the team row */
export const median = (values: (number | null | undefined)[]) => {
  const list = values.filter((value): value is number => typeof value === "number").sort((a, b) => a - b)
  if (list.length === 0) return null
  const middle = Math.floor(list.length / 2)
  return list.length % 2 ? list[middle] : (list[middle - 1] + list[middle]) / 2
}

/** Around 6 evenly spaced tick indexes, always including the last bucket */
export const tickIndexes = (count: number, target = 6) => {
  if (count <= target) return Array.from({ length: count }, (_, i) => i)
  const step = Math.ceil(count / target)
  const ticks: number[] = []
  for (let i = count - 1; i >= 0; i -= step) ticks.unshift(i)
  return ticks
}

/** Nice upper bound for an axis: 1, 2, 5 × 10^n */
export const niceMax = (value: number) => {
  if (value <= 0) return 1
  const exponent = Math.pow(10, Math.floor(Math.log10(value)))
  const fraction = value / exponent
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10
  return nice * exponent
}

export const seriesValues = (series: StatsBucket[], key: "created" | "resolved" | "backlog" | "firstResponseMedian" | "resolutionMedian") =>
  series.map((bucket) => bucket[key] ?? null)
