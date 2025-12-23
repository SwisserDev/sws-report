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

export interface ReportFilter {
  status?: ReportStatus | "all"
  category?: string | "all"
  playerId?: string
  includeResolved?: boolean
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

export interface AdminStats {
  adminId: string
  adminName: string
  claimed: number
  resolved: number
  messages: number
}

export interface CategoryStats {
  category: string
  count: number
}

export interface Statistics {
  totalReports: number
  openReports: number
  claimedReports: number
  resolvedReports: number
  avgResolutionTime: number
  reportsByCategory: CategoryStats[]
  reportsByPriority: { priority: number; count: number }[]
  adminLeaderboard: AdminStats[]
  recentActivity: { date: string; count: number }[]
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
