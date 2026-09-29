// Fake Lua side for `npm run dev`, so the UI can be clicked through in a normal browser.
// Loaded through a dynamic import from browser mode only, it never ships into FiveM's code path.
//
// URL params: ?lang=de&theme=light&tab=admin&report=150&view=resolved&scale=1
import type { Message, Report, ReportNote, PlayerNote } from "@/types"
import locales from "./locales.json"
import {
  ALL_REPORTS, ARCHIVE, CATEGORIES, INVENTORY, ITEM_LIST, ME, MY_REPORTS, PRIORITIES,
  REPORT_NOTES, createVoiceSample, generateStatistics, playerHistory
} from "./data"

type Payload = Record<string, unknown> | undefined

const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams()

const db = {
  my: structuredClone(MY_REPORTS),
  all: structuredClone(ALL_REPORTS),
  archive: structuredClone(ARCHIVE),
  notes: structuredClone(REPORT_NOTES),
  inventory: structuredClone(INVENTORY),
  nextId: 2000
}

const emit = (type: string, data?: unknown, delay = 120) => {
  window.setTimeout(() => window.postMessage({ type, data }, "*"), delay)
}

const notify = (message: string, notifyType: "success" | "error" | "info" = "success") =>
  emit("NOTIFICATION", { message, notifyType })

const now = () => new Date().toISOString()

const findReport = (id: number): Report | undefined =>
  db.all.find((r) => r.id === id) ?? db.my.find((r) => r.id === id) ?? db.archive.find((r) => r.id === id)

const patchReport = (id: number, patch: Partial<Report>) => {
  for (const list of [db.all, db.my, db.archive]) {
    const report = list.find((r) => r.id === id)
    if (report) Object.assign(report, patch, { updatedAt: now() })
  }
  const report = findReport(id)
  if (report) emit("UPDATE_REPORT", { ...report })
}

const pushMessage = (reportId: number, message: Partial<Message>, event = "NEW_MESSAGE") => {
  const full: Message = {
    id: db.nextId++,
    reportId,
    senderId: ME.identifier,
    senderName: ME.name,
    senderType: "admin",
    message: "",
    createdAt: now(),
    ...message
  }
  findReport(reportId)?.messages.push(full)
  emit(event, full)
}

const systemMessage = (reportId: number, text: string) =>
  pushMessage(reportId, { senderId: "system", senderName: "System", senderType: "system", message: text })

const ACTION_TEXT: Record<string, string> = {
  teleport_to: "teleported to the player",
  bring_player: "brought the player",
  heal_player: "healed the player",
  revive_player: "revived the player",
  freeze_player: "froze the player",
  spectate_player: "is spectating the player",
  ragdoll_player: "ragdolled the player",
  kick_player: "kicked the player",
  screenshot_player: "took a screenshot"
}

const handlers: Record<string, (data: Payload) => void> = {
  close: () => {
    emit("HIDE_UI", undefined, 0)
    // Bring it back so the preview is not a dead end
    emit("NOTIFICATION", { message: "Browser preview: UI closed, reopening", notifyType: "info" }, 700)
    window.setTimeout(showUi, 1200)
  },

  getMyReports: (data) => {
    const own = db.my.filter((r) => r.status !== "resolved" || data?.includeResolved)
    emit("SET_REPORTS", structuredClone(own))
  },

  getReports: () => emit("SET_REPORT_ARCHIVE", structuredClone(db.archive), 350),

  getMessages: (data) => {
    const report = findReport(Number(data?.reportId))
    if (report) emit("SET_MESSAGES", { reportId: report.id, messages: structuredClone(report.messages) })
  },

  sendMessage: (data) => pushMessage(Number(data?.reportId), { message: String(data?.message ?? "") }, "MESSAGE_SENT"),

  sendVoiceMessage: (data) =>
    pushMessage(Number(data?.reportId), {
      messageType: "voice",
      audioUrl: createVoiceSample(),
      audioDuration: Math.round(Number(data?.duration ?? 3))
    }, "MESSAGE_SENT"),

  takeScreenshot: (data) => {
    notify("Taking screenshot...", "info")
    const sample = db.all[0].messages.find((m) => m.imageUrl)?.imageUrl
    window.setTimeout(() => pushMessage(Number(data?.reportId), { imageUrl: sample }, "MESSAGE_SENT"), 900)
  },

  createReport: (data) => {
    const report: Report = {
      id: db.nextId++,
      playerId: ME.identifier,
      playerName: ME.name,
      subject: String(data?.subject ?? ""),
      category: String(data?.category ?? "general"),
      description: data?.description ? String(data.description) : undefined,
      status: "open",
      priority: 0,
      createdAt: now(),
      updatedAt: now(),
      messages: [],
      isPlayerOnline: true
    }
    db.my.unshift(report)
    db.all.unshift(structuredClone(report))
    emit("ADD_REPORT", structuredClone(report))
    emit("NEW_ADMIN_REPORT", structuredClone(report), 200)
    notify("Report created")
  },

  claimReport: (data) => {
    patchReport(Number(data?.id), { status: "claimed", claimedBy: ME.identifier, claimedByName: ME.name })
    notify("Report claimed")
  },

  unclaimReport: (data) => {
    patchReport(Number(data?.id), { status: "open", claimedBy: undefined, claimedByName: undefined })
    notify("Report unclaimed")
  },

  resolveReport: (data) => {
    const report = findReport(Number(data?.id))
    patchReport(Number(data?.id), {
      status: "resolved",
      resolvedAt: now(),
      claimedBy: report?.claimedBy ?? ME.identifier,
      claimedByName: report?.claimedByName ?? ME.name
    })
    notify("Report resolved")
  },

  deleteReport: (data) => {
    const id = Number(data?.id)
    db.all = db.all.filter((r) => r.id !== id)
    db.my = db.my.filter((r) => r.id !== id)
    db.archive = db.archive.filter((r) => r.id !== id)
    emit("REMOVE_REPORT", { id })
    notify("Report deleted")
  },

  setPriority: (data) => {
    patchReport(Number(data?.reportId), { priority: Number(data?.priority) })
    notify("Priority updated")
  },

  adminAction: (data) => {
    const action = String(data?.action)
    systemMessage(Number(data?.reportId), `${ME.name} ${ACTION_TEXT[action] ?? action}`)
    notify(`Action: ${action}`, "info")
  },

  getReportNotes: (data) => {
    const reportId = Number(data?.reportId)
    emit("SET_REPORT_NOTES", { reportId, notes: structuredClone(db.notes[reportId] ?? []) })
  },

  addReportNote: (data) => {
    const reportId = Number(data?.reportId)
    const note: ReportNote = { id: db.nextId++, reportId, adminId: ME.identifier, adminName: ME.name, note: String(data?.note ?? ""), createdAt: now() }
    db.notes[reportId] = [note, ...(db.notes[reportId] ?? [])]
    emit("REPORT_NOTE_ADDED", note)
  },

  deleteReportNote: (data) => {
    const noteId = Number(data?.noteId)
    for (const [reportId, notes] of Object.entries(db.notes)) {
      if (notes.some((n) => n.id === noteId)) {
        db.notes[Number(reportId)] = notes.filter((n) => n.id !== noteId)
        emit("REPORT_NOTE_DELETED", { noteId, reportId: Number(reportId) })
      }
    }
  },

  getPlayerHistory: (data) => {
    const playerId = String(data?.playerId)
    const name = findReportByPlayer(playerId)?.playerName ?? "Unknown"
    emit("SET_PLAYER_HISTORY", playerHistory(playerId, name), 300)
  },

  addPlayerNote: (data) => {
    const note: PlayerNote = { id: db.nextId++, playerId: String(data?.playerId), adminId: ME.identifier, adminName: ME.name, note: String(data?.note ?? ""), createdAt: now() }
    emit("PLAYER_NOTE_ADDED", note)
  },

  deletePlayerNote: (data) => emit("PLAYER_NOTE_DELETED", { noteId: Number(data?.noteId), playerId: "" }),

  getStatistics: (data) => {
    const range = (["today", "7d", "30d", "90d", "all"] as const).find((r) => r === data?.range) ?? "30d"
    emit("SET_STATISTICS", generateStatistics(range), 450)
  },

  getPlayerInventory: (data) =>
    emit("SET_PLAYER_INVENTORY", {
      reportId: Number(data?.reportId),
      items: structuredClone(db.inventory),
      itemList: ITEM_LIST,
      systemName: "ox_inventory",
      supportsMetadata: true
    }, 400),

  addInventoryItem: (data) => changeItem(data, (count, amount) => count + amount),
  removeInventoryItem: (data) => changeItem(data, (count, amount) => count - amount),
  setInventoryItemCount: (data) => changeItem(data, (_, amount) => amount)
}

function findReportByPlayer(playerId: string) {
  return [...db.all, ...db.archive].find((r) => r.playerId === playerId)
}

function changeItem(data: Payload, apply: (count: number, amount: number) => number) {
  const name = String(data?.itemName)
  const amount = Number(data?.count ?? 0)
  const existing = db.inventory.find((i) => i.name === name)
  if (existing) {
    existing.count = apply(existing.count, amount)
  } else {
    db.inventory.push({ name, label: ITEM_LIST[name]?.label ?? name, count: apply(0, amount), slot: db.inventory.length + 1 })
  }
  db.inventory = db.inventory.filter((i) => i.count > 0)
  emit("INVENTORY_UPDATED", { reportId: Number(data?.reportId), items: structuredClone(db.inventory) })
  notify("Inventory updated")
}

export function handleMockNui(eventName: string, data: Payload) {
  const handler = handlers[eventName]
  if (handler) {
    handler(data)
  } else {
    console.log(`[mock] unhandled NUI callback: ${eventName}`, data)
  }
}

function showUi() {
  const lang = (params.get("lang") ?? "en") as keyof typeof locales
  emit("SHOW_UI", {
    isAdmin: true,
    theme: params.get("theme") === "light" ? "light" : "dark",
    categories: CATEGORIES,
    priorities: PRIORITIES,
    myReports: structuredClone(db.my.filter((r) => r.status !== "resolved")),
    allReports: structuredClone(db.all),
    playerData: ME,
    locale: { ...locales.en, ...(locales[lang] ?? {}) },
    voiceMessagesEnabled: true,
    voiceMaxDuration: 60,
    language: lang,
    uiScale: Number(params.get("scale") ?? 1)
  }, 0)
}

export function bootMock() {
  // Stand-in for the game scene behind the overlay
  document.body.style.background =
    "radial-gradient(ellipse at 20% 15%, #f2b26b 0%, transparent 45%)," +
    "radial-gradient(ellipse at 85% 30%, #5a7bd8 0%, transparent 50%)," +
    "linear-gradient(180deg, #31405f 0%, #7d5a63 45%, #2b2a33 70%, #15161b 100%)"

  const voice = createVoiceSample()
  for (const report of [...db.all, ...db.my]) {
    for (const message of report.messages) {
      if (message.audioUrl === "mock:voice") message.audioUrl = voice
    }
  }

  showUi()

  // Restore view state from the URL (screenshots, sharing a state)
  window.setTimeout(async () => {
    const { useReportStore } = await import("@/stores/reportStore")
    const store = useReportStore.getState()
    const tab = params.get("tab")
    if (tab === "admin" || tab === "statistics" || tab === "my-reports") store.setActiveTab(tab)
    const view = params.get("view")
    if (view === "queue" || view === "mine" || view === "resolved") store.setFilter({ view })
    const report = params.get("report")
    if (report) store.setSelectedReportId(Number(report))
  }, 60)
}
