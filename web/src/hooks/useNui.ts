"use client"

import { useEffect, useCallback } from "react"
import { useReportStore } from "@/stores/reportStore"
import { fetchNui, registerNuiListener, playSound } from "@/lib/nui"
import type { Report, Message, PlayerData, CategoryConfig, PriorityConfig, ReportNote, PlayerNote, PlayerHistory, Statistics } from "@/types"

interface ShowUIData {
  isAdmin: boolean
  theme: "dark" | "light"
  categories: CategoryConfig[]
  priorities: PriorityConfig[]
  myReports: Report[]
  allReports: Report[]
  playerData: PlayerData
  locale: Record<string, string>
  voiceMessagesEnabled?: boolean
}

export function useNuiListener() {
  const store = useReportStore()

  useEffect(() => {
    const unsubscribe = registerNuiListener((type, data) => {
      switch (type) {
        case "SHOW_UI": {
          const uiData = data as ShowUIData
          store.setVisible(true)
          store.setTheme(uiData.theme)
          store.setCategories(uiData.categories)
          store.setPriorities(uiData.priorities || [])
          store.setMyReports(uiData.myReports || [])
          store.setAllReports(uiData.allReports || [])
          store.setPlayerData(uiData.playerData)
          store.setLocale(uiData.locale || {})
          store.setVoiceMessagesEnabled(uiData.voiceMessagesEnabled ?? false)
          break
        }

        case "HIDE_UI":
          store.setVisible(false)
          store.setSelectedReportId(null)
          store.setIsCreatingReport(false)
          break

        case "SET_REPORTS":
          store.setMyReports(data as Report[])
          break

        case "SET_ALL_REPORTS":
          store.setAllReports(data as Report[])
          break

        case "ADD_REPORT":
        case "NEW_ADMIN_REPORT":
          store.addReport(data as Report)
          break

        case "UPDATE_REPORT":
          store.updateReport(data as Partial<Report> & { id: number })
          break

        case "REMOVE_REPORT": {
          const { id } = data as { id: number }
          store.removeReport(id)
          break
        }

        case "NEW_MESSAGE":
          store.addMessage(data as Message)
          break

        case "MESSAGE_SENT":
          store.addMessage(data as Message)
          break

        case "SET_MESSAGES": {
          const msgData = data as { reportId: number; messages: Message[] }
          store.setMessages(msgData.reportId, msgData.messages)
          break
        }

        case "NOTIFICATION": {
          const notif = data as { message: string; notifyType: "success" | "error" | "info" }
          store.addNotification({
            message: notif.message,
            type: notif.notifyType
          })
          break
        }

        case "PLAY_SOUND": {
          const soundData = data as { sound: string; volume: number }
          playSound(soundData.sound, soundData.volume)
          break
        }

        case "UPDATE_PLAYER_ONLINE": {
          const statusData = data as { playerId: string; isOnline: boolean }
          store.updatePlayerOnlineStatus(statusData.playerId, statusData.isOnline)
          break
        }

        case "SET_REPORT_NOTES": {
          const notesData = data as { reportId: number; notes: ReportNote[] }
          store.setReportNotes(notesData.reportId, notesData.notes)
          break
        }

        case "REPORT_NOTE_ADDED": {
          store.addReportNote(data as ReportNote)
          break
        }

        case "REPORT_NOTE_DELETED": {
          const deleteData = data as { noteId: number; reportId: number }
          store.removeReportNote(deleteData.reportId, deleteData.noteId)
          break
        }

        case "SET_PLAYER_NOTES": {
          const notesData = data as { playerId: string; notes: PlayerNote[] }
          store.setPlayerNotes(notesData.playerId, notesData.notes)
          break
        }

        case "PLAYER_NOTE_ADDED": {
          store.addPlayerNote(data as PlayerNote)
          break
        }

        case "PLAYER_NOTE_DELETED": {
          const deleteData = data as { noteId: number; playerId: string }
          store.removePlayerNote(deleteData.playerId, deleteData.noteId)
          break
        }

        case "SET_PLAYER_HISTORY": {
          store.setPlayerHistory(data as PlayerHistory)
          break
        }

        case "SET_STATISTICS": {
          store.setStatistics(data as Statistics)
          break
        }
      }
    })

    return () => unsubscribe()
  }, [store])
}

export function useNuiActions() {
  const close = useCallback(() => {
    fetchNui("close")
  }, [])

  const createReport = useCallback((data: { subject: string; category: string; description?: string }) => {
    fetchNui("createReport", data)
  }, [])

  const deleteReport = useCallback((id: number) => {
    fetchNui("deleteReport", { id })
  }, [])

  const claimReport = useCallback((id: number) => {
    fetchNui("claimReport", { id })
  }, [])

  const unclaimReport = useCallback((id: number) => {
    fetchNui("unclaimReport", { id })
  }, [])

  const resolveReport = useCallback((id: number) => {
    fetchNui("resolveReport", { id })
  }, [])

  const sendMessage = useCallback((reportId: number, message: string) => {
    fetchNui("sendMessage", { reportId, message })
  }, [])

  const getMessages = useCallback((reportId: number) => {
    fetchNui("getMessages", { reportId })
  }, [])

  const adminAction = useCallback((reportId: number, action: string) => {
    fetchNui("adminAction", { reportId, action })
  }, [])

  const setTheme = useCallback((theme: string) => {
    fetchNui("setTheme", { theme })
  }, [])

  const setPriority = useCallback((reportId: number, priority: number) => {
    fetchNui("setPriority", { reportId, priority })
  }, [])

  const addReportNote = useCallback((reportId: number, note: string) => {
    fetchNui("addReportNote", { reportId, note })
  }, [])

  const deleteReportNote = useCallback((noteId: number) => {
    fetchNui("deleteReportNote", { noteId })
  }, [])

  const getReportNotes = useCallback((reportId: number) => {
    fetchNui("getReportNotes", { reportId })
  }, [])

  const addPlayerNote = useCallback((playerId: string, note: string) => {
    fetchNui("addPlayerNote", { playerId, note })
  }, [])

  const deletePlayerNote = useCallback((noteId: number) => {
    fetchNui("deletePlayerNote", { noteId })
  }, [])

  const getPlayerNotes = useCallback((playerId: string) => {
    fetchNui("getPlayerNotes", { playerId })
  }, [])

  const getPlayerHistory = useCallback((playerId: string) => {
    fetchNui("getPlayerHistory", { playerId })
  }, [])

  const getMyReports = useCallback((includeResolved: boolean) => {
    fetchNui("getMyReports", { includeResolved })
  }, [])

  const getStatistics = useCallback(() => {
    fetchNui("getStatistics")
  }, [])

  const takeScreenshot = useCallback((reportId: number) => {
    fetchNui("takeScreenshot", { reportId })
  }, [])

  return {
    close,
    createReport,
    deleteReport,
    claimReport,
    unclaimReport,
    resolveReport,
    sendMessage,
    getMessages,
    adminAction,
    setTheme,
    setPriority,
    addReportNote,
    deleteReportNote,
    getReportNotes,
    addPlayerNote,
    deletePlayerNote,
    getPlayerNotes,
    getPlayerHistory,
    getMyReports,
    getStatistics,
    takeScreenshot
  }
}
