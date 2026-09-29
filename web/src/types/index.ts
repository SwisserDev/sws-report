export type ReportStatus = "open" | "claimed" | "resolved"
export type SenderType = "player" | "admin" | "system"
export type MessageType = "text" | "voice"
export type ReportPriority = 0 | 1 | 2 | 3

export interface Coordinates {
  x: number
  y: number
  z: number
}

export interface CategoryConfig {
  id: string
  label: string
  icon: string
}

export interface PriorityConfig {
  id: number
  label: string
  color: string
}

export interface Report {
  id: number
  playerId: string
  playerName: string
  subject: string
  category: string
  description?: string
  status: ReportStatus
  claimedBy?: string
  claimedByName?: string
  priority: number
  playerCoords?: Coordinates
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  messages: Message[]
  isPlayerOnline?: boolean
}

export interface Message {
  id: number
  reportId: number
  senderId: string
  senderName: string
  senderType: SenderType
  message: string
  imageUrl?: string | null
  messageType?: MessageType
  audioUrl?: string
  audioDuration?: number
  createdAt: string
}

export interface PlayerData {
  identifier: string
  name: string
  isAdmin: boolean
  permissions?: Record<string, boolean>
  group?: string
}

export interface Notification {
  id: string
  message: string
  type: "success" | "error" | "info"
  duration?: number
}

export interface NuiMessage {
  type: string
  data?: unknown
}

export interface CreateReportData {
  subject: string
  category: string
  description?: string
}

/** Staff list: queue = everything active, mine = claimed by me, resolved = archive from the database */
export type AdminView = "queue" | "mine" | "resolved"
export type PlayerView = "active" | "resolved"

export interface ReportFilter {
  view: AdminView
  category: string
  search: string
}

export interface ReportNote {
  id: number
  reportId: number
  adminId: string
  adminName: string
  note: string
  createdAt: string
}

export interface PlayerNote {
  id: number
  playerId: string
  adminId: string
  adminName: string
  note: string
  createdAt: string
}

export interface HistoryReport {
  id: number
  playerId: string
  playerName: string
  subject: string
  category: string
  description?: string
  status: ReportStatus
  claimedBy?: string
  claimedByName?: string
  priority: number
  createdAt: string
  resolvedAt?: string
}

export interface PlayerIdentifiers {
  license?: string
  steam?: string
  discord?: string
  fivem?: string
}

export interface PlayerHistory {
  playerId: string
  playerName: string
  totalReports: number
  openReports: number
  resolvedReports: number
  reports: HistoryReport[]
  notes: PlayerNote[]
  identifiers?: PlayerIdentifiers
}

export type StatsRange = "today" | "7d" | "30d" | "90d" | "all"

/** Durations in seconds; null when nothing was measured in the period */
export interface DurationSummary {
  median: number | null
  p90: number | null
  count: number
}

export interface StatsPeriod {
  from: number
  to: number
  created: number
  resolved: number
  firstResponse: DurationSummary
  resolution: DurationSummary
}

export interface StatsBucket {
  /** "YYYY-MM-DD", or "YYYY-MM-DD HH:00" for the today range */
  date: string
  created: number
  resolved: number
  backlog: number
  firstResponseMedian?: number | null
  resolutionMedian?: number | null
}

export interface StaffStats {
  adminId: string
  adminName: string
  handled: number
  resolved: number
  messages: number
  firstResponseMedian?: number | null
  resolutionMedian?: number | null
}

export interface Statistics {
  range: StatsRange
  bucket: "hour" | "day" | "week"
  generatedAt: number
  snapshot: { open: number; claimed: number; oldestOpenAt?: number | null }
  current: StatsPeriod
  /** Same elapsed time one period earlier, missing for "all" */
  previous?: StatsPeriod | null
  series: StatsBucket[]
  hours: { hour: number; created: number; firstResponseMedian?: number | null }[]
  categories: { category: string; count: number }[]
  priorities: { priority: number; count: number; resolutionMedian?: number | null }[]
  resolutions: { createdAt: number; seconds: number; priority: number }[]
  staff: StaffStats[]
}

// Inventory Management Types
export type InventoryAction = "add" | "remove" | "set" | "metadata_edit"

export interface InventoryItem {
  name: string
  label: string
  count: number
  slot?: number
  weight?: number
  metadata?: Record<string, unknown>
  image?: string
}

export interface InventoryItemInfo {
  name: string
  label: string
  weight?: number
  image?: string
}

export interface InventoryState {
  items: InventoryItem[]
  itemList: Record<string, InventoryItemInfo>
  loading: boolean
  error?: string
  systemName: string
  supportsMetadata: boolean
}

export interface InventoryChangeLog {
  id: number
  adminId: string
  adminName: string
  playerId: string
  playerName: string
  reportId: number
  action: InventoryAction
  itemName: string
  itemLabel: string
  countBefore: number
  countAfter: number
  metadataBefore?: string
  metadataAfter?: string
  createdAt: string
}
