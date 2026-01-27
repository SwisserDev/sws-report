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

  // Data
  playerData: PlayerData | null
  myReports: Report[]
  allReports: Report[]
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
  setPlayerData: (data: PlayerData) => void
  setMyReports: (reports: Report[]) => void
  setAllReports: (reports: Report[]) => void
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
  playerData: null,
  myReports: [],
  allReports: [],
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

  // Data Actions
  setPlayerData: (data) => set({ playerData: data }),
  setMyReports: (reports) => set({ myReports: reports }),
  setAllReports: (reports) => set({ allReports: reports }),
  setCategories: (categories) => set({ categories }),
  setPriorities: (priorities) => set({ priorities }),
  setLocale: (locale) => set({ locale }),
  setFilter: (filter) => set((state) => ({ filter: { ...state.filter, ...filter } })),

  // Report Actions
  addReport: (report) => set((state) => {
    const isOwn = state.playerData?.identifier === report.playerId

    return {
      myReports: isOwn ? [report, ...state.myReports] : state.myReports,
      allReports: state.playerData?.isAdmin ? [report, ...state.allReports] : state.allReports
    }
  }),

  updateReport: (updatedReport) => set((state) => ({
    myReports: state.myReports.map((r) =>
      r.id === updatedReport.id ? { ...r, ...updatedReport } : r
    ),
    allReports: state.allReports.map((r) =>
      r.id === updatedReport.id ? { ...r, ...updatedReport } : r
    )
  })),

  removeReport: (id) => set((state) => ({
    myReports: state.myReports.filter((r) => r.id !== id),
    allReports: state.allReports.filter((r) => r.id !== id),
    selectedReportId: state.selectedReportId === id ? null : state.selectedReportId
  })),

  addMessage: (message) => set((state) => {
    const updateMessages = (reports: Report[]) =>
      reports.map((r) =>
        r.id === message.reportId
          ? { ...r, messages: [...(r.messages || []), message] }
          : r
      )

    return {
      myReports: updateMessages(state.myReports),
      allReports: updateMessages(state.allReports)
    }
  }),

  setMessages: (reportId, messages) => set((state) => {
    const updateMessages = (reports: Report[]) =>
      reports.map((r) =>
        r.id === reportId ? { ...r, messages } : r
      )

    return {
      myReports: updateMessages(state.myReports),
      allReports: updateMessages(state.allReports)
    }
  }),

  updatePlayerOnlineStatus: (playerId, isOnline) => set((state) => {
    const updateStatus = (reports: Report[]) =>
      reports.map((r) =>
        r.playerId === playerId ? { ...r, isPlayerOnline: isOnline } : r
      )

    return {
      myReports: updateStatus(state.myReports),
      allReports: updateStatus(state.allReports)
    }
  }),

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
    const reports = state.activeTab === "admin" ? state.allReports : state.myReports
    return reports.find((r) => r.id === state.selectedReportId)
  },

  getFilteredReports: () => {
    const state = get()
    const reports = state.activeTab === "admin" ? state.allReports : state.myReports

    // Only apply filters for admin tab - player tab shows whatever server returns
    if (state.activeTab !== "admin") {
      return reports
    }

    const { filter } = state

    return reports.filter((report) => {
      if (filter.status && filter.status !== "all" && report.status !== filter.status) {
        return false
      }
      if (filter.category && filter.category !== "all" && report.category !== filter.category) {
        return false
      }
      if (filter.playerId && !report.playerId.includes(filter.playerId)) {
        return false
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
