import { create } from "zustand"
import type { Report, Message, PlayerData, CategoryConfig, PriorityConfig, Notification, ReportFilter, ReportNote, PlayerNote, PlayerHistory, Statistics, InventoryItem, InventoryItemInfo, InventoryChangeLog } from "@/types"
import { generateId } from "@/lib/utils"

interface InventoryState {
  items: InventoryItem[]
  itemList: Record<string, InventoryItemInfo>
  loading: boolean
  error?: string
  systemName: string
  supportsMetadata: boolean
  actionLog: InventoryChangeLog[]
}

interface ReportState {
  // UI State
  isVisible: boolean
  theme: "dark" | "light"
  activeTab: "my-reports" | "admin" | "statistics"
  selectedReportId: number | null
  isCreatingReport: boolean
  showPlayerInfo: boolean
  selectedPlayerId: string | null

  // Feature Flags
  voiceMessagesEnabled: boolean
  voiceMaxDuration: number

  // Data
  playerData: PlayerData | null
  myReports: Report[]
  allReports: Report[]
  reportArchive: Report[]
  categories: CategoryConfig[]
  priorities: PriorityConfig[]
  locale: Record<string, string>
  notifications: Notification[]

  // Notes & History
  reportNotes: Record<number, ReportNote[]>
  playerNotes: Record<string, PlayerNote[]>
  playerHistory: PlayerHistory | null

  // Statistics
  statistics: Statistics | null

  // Inventory
  inventory: Record<number, InventoryState>

  // Filters
  filter: ReportFilter

  // Actions
  setVisible: (visible: boolean) => void
  setTheme: (theme: "dark" | "light") => void
  setActiveTab: (tab: "my-reports" | "admin" | "statistics") => void
  setSelectedReportId: (id: number | null) => void
  setIsCreatingReport: (creating: boolean) => void
  setShowPlayerInfo: (show: boolean) => void
  setSelectedPlayerId: (id: string | null) => void
  setVoiceMessagesEnabled: (enabled: boolean) => void
  setVoiceMaxDuration: (seconds: number) => void
  setPlayerData: (data: PlayerData) => void
  setMyReports: (reports: Report[]) => void
  setAllReports: (reports: Report[]) => void
  setReportArchive: (reports: Report[]) => void
  setCategories: (categories: CategoryConfig[]) => void
  setPriorities: (priorities: PriorityConfig[]) => void
  setLocale: (locale: Record<string, string>) => void
  setFilter: (filter: Partial<ReportFilter>) => void

  // Report Actions
  addReport: (report: Report) => void
  updateReport: (report: Partial<Report> & { id: number }) => void
  removeReport: (id: number) => void
  addMessage: (message: Message) => void
  setMessages: (reportId: number, messages: Message[]) => void
  updatePlayerOnlineStatus: (playerId: string, isOnline: boolean) => void

  // Note Actions
  setReportNotes: (reportId: number, notes: ReportNote[]) => void
  addReportNote: (note: ReportNote) => void
  removeReportNote: (reportId: number, noteId: number) => void
  setPlayerNotes: (playerId: string, notes: PlayerNote[]) => void
  addPlayerNote: (note: PlayerNote) => void
  removePlayerNote: (playerId: string, noteId: number) => void
  setPlayerHistory: (history: PlayerHistory) => void
  setStatistics: (statistics: Statistics) => void

  // Inventory Actions
  setInventory: (reportId: number, data: Partial<InventoryState>) => void
  setInventoryLoading: (reportId: number, loading: boolean) => void
  setInventoryItems: (reportId: number, items: InventoryItem[]) => void
  setInventoryActionLog: (reportId: number, logs: InventoryChangeLog[]) => void
  getInventory: (reportId: number) => InventoryState | undefined

  // Notification Actions
  addNotification: (notification: Omit<Notification, "id">) => void
  removeNotification: (id: string) => void

  // Permissions
  hasPermission: (permission: string) => boolean

  // Getters
  getSelectedReport: () => Report | undefined
  getFilteredReports: () => Report[]
  getReportNotes: (reportId: number) => ReportNote[]
  getPlayerNotes: (playerId: string) => PlayerNote[]
}

type ReportLists = Pick<ReportState, "myReports" | "allReports" | "reportArchive">

// Apply the same change to every list a report can live in
const mapReportLists = (state: ReportLists, fn: (reports: Report[]) => Report[]): ReportLists => ({
  myReports: fn(state.myReports),
  allReports: fn(state.allReports),
  reportArchive: fn(state.reportArchive)
})

export const useReportStore = create<ReportState>((set, get) => ({
  // Initial State
  isVisible: false,
  theme: "dark",
  activeTab: "my-reports",
  selectedReportId: null,
  isCreatingReport: false,
  showPlayerInfo: false,
  selectedPlayerId: null,
  voiceMessagesEnabled: false,
  voiceMaxDuration: 60,
  playerData: null,
  myReports: [],
  allReports: [],
  reportArchive: [],
  categories: [],
  priorities: [],
  locale: {},
  notifications: [],
  reportNotes: {},
  playerNotes: {},
  playerHistory: null,
  statistics: null,
  inventory: {},
  filter: {
    status: "all",
    category: "all"
  },

  // UI Actions
  setVisible: (visible) => set({ isVisible: visible }),
  setTheme: (theme) => set({ theme }),
  setActiveTab: (tab) => set({ activeTab: tab, selectedReportId: null }),
  setSelectedReportId: (id) => set({ selectedReportId: id }),
  setIsCreatingReport: (creating) => set({ isCreatingReport: creating }),
  setShowPlayerInfo: (show) => set({ showPlayerInfo: show }),
  setSelectedPlayerId: (id) => set({ selectedPlayerId: id }),
  setVoiceMessagesEnabled: (enabled) => set({ voiceMessagesEnabled: enabled }),
  setVoiceMaxDuration: (seconds) => set({ voiceMaxDuration: seconds }),

  // Data Actions
  setPlayerData: (data) => set((state) => {
    // Kick the user off staff tabs when permissions were revoked while the UI was open
    const can = (permission: string) => data.permissions ? data.permissions[permission] === true : data.isAdmin
    const tabAllowed =
      state.activeTab === "my-reports" ||
      (state.activeTab === "admin" && can("view_reports")) ||
      (state.activeTab === "statistics" && can("view_statistics"))

    return tabAllowed
      ? { playerData: data }
      : { playerData: data, activeTab: "my-reports", selectedReportId: null }
  }),
  setMyReports: (reports) => set({ myReports: reports }),
  setAllReports: (reports) => set({ allReports: reports }),
  setReportArchive: (reports) => set({ reportArchive: reports }),
  setCategories: (categories) => set({ categories }),
  setPriorities: (priorities) => set({ priorities }),
  setLocale: (locale) => set({ locale }),
  setFilter: (filter) => set((state) => ({ filter: { ...state.filter, ...filter } })),

  // Report Actions
  addReport: (report) => set((state) => {
    // An admin's own report arrives as ADD_REPORT and NEW_ADMIN_REPORT, keep a single entry
    const upsert = (reports: Report[]) =>
      reports.some((r) => r.id === report.id)
        ? reports.map((r) => (r.id === report.id ? { ...r, ...report } : r))
        : [report, ...reports]

    const isOwn = state.playerData?.identifier === report.playerId

    return {
      myReports: isOwn ? upsert(state.myReports) : state.myReports,
      allReports: state.playerData?.isAdmin ? upsert(state.allReports) : state.allReports
    }
  }),

  updateReport: (updatedReport) => set((state) =>
    mapReportLists(state, (reports) =>
      reports.map((r) => (r.id === updatedReport.id ? { ...r, ...updatedReport } : r))
    )
  ),

  removeReport: (id) => set((state) => ({
    ...mapReportLists(state, (reports) => reports.filter((r) => r.id !== id)),
    selectedReportId: state.selectedReportId === id ? null : state.selectedReportId
  })),

  addMessage: (message) => set((state) =>
    // A fetch (SET_MESSAGES) can already contain a message that is broadcast right after
    mapReportLists(state, (reports) =>
      reports.map((r) =>
        r.id === message.reportId && !(r.messages || []).some((m) => m.id === message.id)
          ? { ...r, messages: [...(r.messages || []), message] }
          : r
      )
    )
  ),

  setMessages: (reportId, messages) => set((state) =>
    mapReportLists(state, (reports) =>
      reports.map((r) => (r.id === reportId ? { ...r, messages } : r))
    )
  ),

  updatePlayerOnlineStatus: (playerId, isOnline) => set((state) =>
    mapReportLists(state, (reports) =>
      reports.map((r) => (r.playerId === playerId ? { ...r, isPlayerOnline: isOnline } : r))
    )
  ),

  // Notification Actions
  addNotification: (notification) => {
    const id = generateId()
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }]
    }))

    setTimeout(() => {
      get().removeNotification(id)
    }, notification.duration || 4000)
  },

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id)
  })),

  // Note Actions
  setReportNotes: (reportId, notes) => set((state) => ({
    reportNotes: { ...state.reportNotes, [reportId]: notes }
  })),

  addReportNote: (note) => set((state) => {
    const existingNotes = state.reportNotes[note.reportId] || []
    // If this is a real note from server (positive ID), remove any optimistic note with same content
    const filteredNotes = note.id > 0
      ? existingNotes.filter((n) => !(n.id < 0 && n.note === note.note))
      : existingNotes
    return {
      reportNotes: {
        ...state.reportNotes,
        [note.reportId]: [note, ...filteredNotes]
      }
    }
  }),

  removeReportNote: (reportId, noteId) => set((state) => ({
    reportNotes: {
      ...state.reportNotes,
      [reportId]: (state.reportNotes[reportId] || []).filter((n) => n.id !== noteId)
    }
  })),

  setPlayerNotes: (playerId, notes) => set((state) => ({
    playerNotes: { ...state.playerNotes, [playerId]: notes }
  })),

  addPlayerNote: (note) => set((state) => {
    const existingNotes = state.playerNotes[note.playerId] || []
    // If this is a real note from server (positive ID), remove any optimistic note with same content
    const filteredNotes = note.id > 0
      ? existingNotes.filter((n) => !(n.id < 0 && n.note === note.note))
      : existingNotes

    // Also update playerHistory if it exists and matches this player
    const updatedHistory = state.playerHistory && state.playerHistory.playerId === note.playerId
      ? {
          ...state.playerHistory,
          notes: note.id > 0
            ? [note, ...state.playerHistory.notes.filter((n) => !(n.id < 0 && n.note === note.note))]
            : state.playerHistory.notes
        }
      : state.playerHistory

    return {
      playerNotes: {
        ...state.playerNotes,
        [note.playerId]: [note, ...filteredNotes]
      },
      playerHistory: updatedHistory
    }
  }),

  removePlayerNote: (playerId, noteId) => set((state) => ({
    playerNotes: {
      ...state.playerNotes,
      [playerId]: (state.playerNotes[playerId] || []).filter((n) => n.id !== noteId)
    }
  })),

  setPlayerHistory: (history) => set({ playerHistory: history }),
  setStatistics: (statistics) => set({ statistics }),

  // Inventory Actions
  setInventory: (reportId, data) => set((state) => {
    const existing = state.inventory[reportId]
    const defaults = {
      items: [],
      itemList: {},
      loading: false,
      systemName: "",
      supportsMetadata: false,
      actionLog: []
    }
    return {
      inventory: {
        ...state.inventory,
        [reportId]: { ...defaults, ...existing, ...data }
      }
    }
  }),

  setInventoryLoading: (reportId, loading) => set((state) => {
    const existing = state.inventory[reportId]
    const defaults = {
      items: [],
      itemList: {},
      loading: false,
      systemName: "",
      supportsMetadata: false,
      actionLog: []
    }
    return {
      inventory: {
        ...state.inventory,
        [reportId]: { ...defaults, ...existing, loading }
      }
    }
  }),

  setInventoryItems: (reportId, items) => set((state) => ({
    inventory: {
      ...state.inventory,
      [reportId]: {
        ...state.inventory[reportId],
        items,
        loading: false
      }
    }
  })),

  setInventoryActionLog: (reportId, logs) => set((state) => ({
    inventory: {
      ...state.inventory,
      [reportId]: {
        ...state.inventory[reportId],
        actionLog: logs
      }
    }
  })),

  getInventory: (reportId) => {
    return get().inventory[reportId]
  },

  // Permissions
  hasPermission: (permission) => {
    const state = get()
    const { playerData } = state
    if (!playerData) return false
    if (playerData.permissions) {
      return playerData.permissions[permission] === true
    }
    // Fallback: no permissions object means legacy admin with full access
    return playerData.isAdmin
  },

  // Getters
  getSelectedReport: () => {
    const state = get()

    if (state.activeTab !== "admin") {
      return state.myReports.find((r) => r.id === state.selectedReportId)
    }

    return state.allReports.find((r) => r.id === state.selectedReportId)
      ?? state.reportArchive.find((r) => r.id === state.selectedReportId)
  },

  getFilteredReports: () => {
    const state = get()

    // Only apply filters for admin tab - player tab shows whatever server returns
    if (state.activeTab !== "admin") {
      return state.myReports
    }

    const { filter } = state

    // Resolved reports are not cached server-side, they come from the archive fetch.
    // Reports resolved during this session are still in allReports.
    const reports = filter.status === "resolved"
      ? [
          ...state.allReports.filter((r) => !state.reportArchive.some((a) => a.id === r.id)),
          ...state.reportArchive
        ]
      : state.allReports

    // The search box is labelled "player", staff type names or #ids, not license hashes
    const search = filter.playerId?.trim().toLowerCase().replace(/^#/, "")

    return reports.filter((report) => {
      if (filter.status && filter.status !== "all" && report.status !== filter.status) {
        return false
      }
      if (filter.category && filter.category !== "all" && report.category !== filter.category) {
        return false
      }
      if (search) {
        const haystack = [String(report.id), report.playerName, report.playerId, report.subject]
        if (!haystack.some((value) => value?.toLowerCase().includes(search))) {
          return false
        }
      }
      return true
    })
  },

  getReportNotes: (reportId) => {
    return get().reportNotes[reportId] || []
  },

  getPlayerNotes: (playerId) => {
    return get().playerNotes[playerId] || []
  }
}))
