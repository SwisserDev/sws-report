"use client"

import { useState, useEffect, useRef } from "react"
import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"
import { Button, Badge } from "@/components/ui"
import { PriorityBadge } from "@/components/ui/PriorityBadge"
import { formatRelativeTime, formatTimestamp, truncate } from "@/lib/utils"
import type { PlayerNote, HistoryReport, PlayerIdentifiers } from "@/types"

interface PlayerInfoPanelProps {
  playerId: string
  playerName: string
  onClose: () => void
}

type ActiveTab = "history" | "notes"

// Identifier display configuration
const IDENTIFIER_CONFIG: { key: keyof PlayerIdentifiers; label: string; localeKey: string }[] = [
  { key: "license", label: "License", localeKey: "identifier_license" },
  { key: "steam", label: "Steam", localeKey: "identifier_steam" },
  { key: "discord", label: "Discord", localeKey: "identifier_discord" },
  { key: "fivem", label: "FiveM", localeKey: "identifier_fivem" },
]

// Copy Modal Component - shows input field with auto-select for Ctrl+C
function CopyIdentifierModal({
  identifier,
  label,
  copyHint,
  onClose
}: {
  identifier: string
  label: string
  copyHint: string
  onClose: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-select the input content when modal opens
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]"
      onClick={onClose}
    >
      <div
        className="bg-bg-secondary border border-border rounded-lg p-4 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-text-primary">{label}</span>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={identifier}
          readOnly
          className="w-full px-3 py-2 text-sm font-mono bg-bg-tertiary border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent select-all"
          onFocus={(e) => e.target.select()}
        />
        <p className="text-xs text-text-tertiary mt-2 text-center">
          {copyHint}
        </p>
      </div>
    </div>
  )
}

export function PlayerInfoPanel({ playerId, playerName, onClose }: PlayerInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("history")
  const [newNote, setNewNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedIdentifier, setSelectedIdentifier] = useState<{ value: string; label: string } | null>(null)

  const { playerHistory, locale, categories } = useReportStore()
  const { getPlayerHistory, addPlayerNote, deletePlayerNote } = useNuiActions()

  useEffect(() => {
    getPlayerHistory(playerId)
  }, [playerId, getPlayerHistory])

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim() || isSubmitting) return

    const noteText = newNote.trim()
    setIsSubmitting(true)
    setNewNote("")

    const optimisticNote: PlayerNote = {
      id: -Date.now(),
      playerId,
      adminId: "pending",
      adminName: "You",
      note: noteText,
      createdAt: new Date().toISOString()
    }

    if (playerHistory) {
      useReportStore.getState().setPlayerHistory({
        ...playerHistory,
        notes: [optimisticNote, ...playerHistory.notes]
      })
    }

    addPlayerNote(playerId, noteText)
    setTimeout(() => setIsSubmitting(false), 500)
  }

  const handleDeleteNote = (noteId: number) => {
    if (playerHistory) {
      useReportStore.getState().setPlayerHistory({
        ...playerHistory,
        notes: playerHistory.notes.filter((n) => n.id !== noteId)
      })
    }
    useReportStore.getState().removePlayerNote(playerId, noteId)
    deletePlayerNote(noteId)
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "open": return "open"
      case "claimed": return "claimed"
      case "resolved": return "resolved"
      default: return "default"
    }
  }

  const getCategoryLabel = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId)
    return cat?.label || categoryId
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-bg-secondary border border-border rounded-xl w-full max-w-4xl xl:max-w-5xl 2xl:max-w-7xl max-h-[80vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{playerName}</h2>
              <p className="text-xs text-text-tertiary font-mono">{playerId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Identifiers - only shown if player is online */}
        {playerHistory?.identifiers && Object.keys(playerHistory.identifiers).length > 0 && (
          <div className="px-6 py-3 border-b border-border bg-bg-tertiary/30">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
              {IDENTIFIER_CONFIG.map(({ key, label, localeKey }) => {
                const value = playerHistory.identifiers?.[key]
                if (!value) return null

                const displayLabel = locale[localeKey] || label

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedIdentifier({ value, label: displayLabel })}
                    className="flex items-center gap-2 px-3 py-2 bg-bg-card hover:bg-bg-elevated border border-border rounded-lg transition-colors group text-left"
                    title={value}
                  >
                    <span className="text-xs font-medium text-text-tertiary min-w-[52px]">
                      {displayLabel}
                    </span>
                    <span className="flex-1 text-xs text-text-secondary font-mono truncate">
                      {truncate(value, 20)}
                    </span>
                    <svg className="w-4 h-4 text-text-tertiary group-hover:text-text-secondary flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Stats */}
        {playerHistory && (
          <div className="flex items-center gap-6 px-6 py-3 border-b border-border bg-bg-tertiary/50">
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{playerHistory.totalReports}</p>
              <p className="text-xs text-text-tertiary">{locale.total_reports || "Total Reports"}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{playerHistory.openReports}</p>
              <p className="text-xs text-text-tertiary">{locale.open_reports || "Open"}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{playerHistory.resolvedReports}</p>
              <p className="text-xs text-text-tertiary">{locale.resolved_reports || "Resolved"}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{playerHistory.notes?.length || 0}</p>
              <p className="text-xs text-text-tertiary">{locale.notes || "Notes"}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "history"
                ? "border-accent text-text-primary"
                : "border-transparent text-text-tertiary hover:text-text-secondary"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {locale.report_history || "Report History"}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "notes"
                ? "border-accent text-text-primary"
                : "border-transparent text-text-tertiary hover:text-text-secondary"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {locale.player_notes || "Player Notes"}
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "history" ? (
            <div className="p-4 space-y-3">
              {!playerHistory || playerHistory.reports.length === 0 ? (
                <p className="text-sm text-text-tertiary text-center py-8">
                  {locale.no_report_history || "No report history"}
                </p>
              ) : (
                playerHistory.reports.map((report: HistoryReport) => (
                  <div key={report.id} className="p-4 bg-bg-card border border-border rounded-lg">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-text-tertiary">#{report.id}</span>
                        <Badge variant={getStatusVariant(report.status)}>
                          {locale[`status_${report.status}`] || report.status}
                        </Badge>
                        <PriorityBadge priority={report.priority} size="sm" />
                      </div>
                      <span className="text-xs text-text-tertiary">{formatRelativeTime(report.createdAt)}</span>
                    </div>
                    <h4 className="text-sm font-medium text-text-primary mb-1">{report.subject}</h4>
                    <div className="flex items-center gap-3 text-xs text-text-tertiary">
                      <span className="px-2 py-0.5 bg-bg-elevated rounded">{getCategoryLabel(report.category)}</span>
                      {report.claimedByName && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          {report.claimedByName}
                        </span>
                      )}
                      {report.resolvedAt && (
                        <span>{locale.resolved_at || "Resolved"}: {formatTimestamp(report.resolvedAt)}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {!playerHistory || playerHistory.notes.length === 0 ? (
                  <p className="text-sm text-text-tertiary text-center py-8">
                    {locale.no_player_notes || "No notes for this player"}
                  </p>
                ) : (
                  playerHistory.notes.map((note: PlayerNote) => (
                    <div key={note.id} className="p-3 bg-bg-tertiary rounded-lg group">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-medium text-accent">{note.adminName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] xl:text-xs text-text-tertiary">{formatRelativeTime(note.createdAt)}</span>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-red-400 transition-all"
                            title={locale.delete || "Delete"}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-text-secondary whitespace-pre-wrap">{note.note}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddNote} className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={locale.add_player_note_placeholder || "Add a note about this player..."}
                    className="flex-1 px-3 py-2 text-sm bg-bg-tertiary border border-border rounded-lg resize-none focus:outline-none focus:border-accent text-text-primary placeholder:text-text-tertiary"
                    rows={2}
                    maxLength={1000}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    disabled={!newNote.trim() || isSubmitting}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Copy Identifier Modal */}
      {selectedIdentifier && (
        <CopyIdentifierModal
          identifier={selectedIdentifier.value}
          label={selectedIdentifier.label}
          copyHint={locale.copy_hint || "Ctrl+C to copy"}
          onClose={() => setSelectedIdentifier(null)}
        />
      )}
    </div>
  )
}
