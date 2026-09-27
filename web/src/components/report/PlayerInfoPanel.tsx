"use client"

import { useEffect, useState } from "react"
import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"
import { Avatar, Button, EmptyState, Icon, Modal, NoteCard, PriorityGlyph, Spinner, StatusGlyph } from "@/components/ui"
import { getCategoryLabel, getPriorityMeta, getStatusLabel } from "@/lib/reportMeta"
import { formatDateTime, formatFullDate } from "@/lib/time"
import { cn } from "@/lib/utils"
import type { PlayerIdentifiers } from "@/types"

interface PlayerInfoPanelProps {
  playerId: string
  playerName: string
  onClose: () => void
}

type Tab = "history" | "notes"

const IDENTIFIERS: { key: keyof PlayerIdentifiers; label: string; localeKey: string }[] = [
  { key: "license", label: "License", localeKey: "identifier_license" },
  { key: "discord", label: "Discord", localeKey: "identifier_discord" },
  { key: "steam", label: "Steam", localeKey: "identifier_steam" },
  { key: "fivem", label: "FiveM", localeKey: "identifier_fivem" }
]

export function PlayerInfoPanel({ playerId, playerName, onClose }: PlayerInfoPanelProps) {
  const [tab, setTab] = useState<Tab>("history")
  const [newNote, setNewNote] = useState("")
  const { playerHistory, locale, categories, priorities, hasPermission, language, addNotification } = useReportStore()
  const { getPlayerHistory, addPlayerNote, deletePlayerNote } = useNuiActions()

  const history = playerHistory?.playerId === playerId ? playerHistory : null
  const canManage = hasPermission("manage_notes")

  useEffect(() => {
    getPlayerHistory(playerId)
  }, [playerId, getPlayerHistory])

  const submitNote = () => {
    const text = newNote.trim()
    if (!text || !history) return

    useReportStore.getState().setPlayerHistory({
      ...history,
      notes: [{ id: -Date.now(), playerId, adminId: "pending", adminName: locale.you || "You", note: text, createdAt: new Date().toISOString() }, ...history.notes]
    })
    addPlayerNote(playerId, text)
    setNewNote("")
  }

  const removeNote = (noteId: number) => {
    if (history) {
      useReportStore.getState().setPlayerHistory({ ...history, notes: history.notes.filter((n) => n.id !== noteId) })
    }
    useReportStore.getState().removePlayerNote(playerId, noteId)
    deletePlayerNote(noteId)
  }

  // CEF has no async clipboard permission, the old execCommand still works there
  const copy = (event: React.MouseEvent<HTMLInputElement>) => {
    event.currentTarget.select()
    try {
      if (document.execCommand("copy")) {
        addNotification({ message: locale.copied || "Copied!", type: "success", duration: 1500 })
      }
    } catch {
      // Selected anyway, Ctrl+C works
    }
  }

  const identifiers = IDENTIFIERS.filter(({ key }) => history?.identifiers?.[key])

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="xl"
      title={
        <span className="flex items-center gap-3">
          <Avatar name={playerName} size="lg" />
          <span className="flex flex-col">
            <span>{playerName}</span>
            <span className="font-mono text-xs font-normal text-fg-subtle">{playerId}</span>
          </span>
        </span>
      }
    >
      {!history ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-fg-subtle">
          <Spinner /> {locale.loading || "Loading..."}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-x-8 gap-y-2 py-3 border-y border-line">
            {[
              { label: locale.total_reports || "Total Reports", value: history.totalReports },
              { label: locale.open_reports || "Open", value: history.openReports },
              { label: locale.resolved_reports || "Resolved", value: history.resolvedReports },
              { label: locale.notes || "Notes", value: history.notes.length }
            ].map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-2">
                <span className="text-xl font-semibold tabular-nums text-fg">{stat.value}</span>
                <span className="text-sm text-fg-subtle">{stat.label}</span>
              </div>
            ))}
          </div>

          {identifiers.length > 0 && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {identifiers.map(({ key, label, localeKey }) => (
                <label key={key} className="flex items-center gap-3 min-w-0">
                  <span className="w-16 shrink-0 text-sm text-fg-subtle">{locale[localeKey] || label}</span>
                  <input
                    readOnly
                    value={history.identifiers?.[key] ?? ""}
                    onClick={copy}
                    title={locale.copy_hint || "Click to copy"}
                    className="flex-1 min-w-0 h-8 px-2.5 rounded-md border border-line-strong bg-raised font-mono text-xs text-fg-muted cursor-copy hover:border-line-focus focus:outline-none focus:border-accent-fg"
                  />
                </label>
              ))}
            </div>
          )}

          <div className="flex gap-1 border-b border-line" role="tablist">
            {([
              { id: "history", label: locale.report_history || "Report History", icon: "history" },
              { id: "notes", label: locale.player_notes || "Player Notes", icon: "note" }
            ] as const).map((item) => {
              const selected = tab === item.id
              const isNotes = item.id === "notes"
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "relative flex items-center gap-1.5 h-9 px-3 text-sm font-medium",
                    selected ? (isNotes ? "text-amber-fg" : "text-fg") : "text-fg-subtle hover:text-fg"
                  )}
                >
                  <Icon name={item.icon} />
                  {item.label}
                  <span className={cn("absolute left-1.5 right-1.5 -bottom-px h-0.5 rounded-full", selected ? (isNotes ? "bg-amber" : "bg-accent-fg") : "bg-transparent")} />
                </button>
              )
            })}
          </div>

          {tab === "history" ? (
            history.reports.length === 0 ? (
              <EmptyState icon="history" title={locale.no_report_history || "No report history"} />
            ) : (
              <div className="flex flex-col rounded-lg border border-line overflow-hidden">
                {history.reports.map((report) => {
                  const priority = getPriorityMeta(report.priority, priorities, locale)
                  return (
                    <div key={report.id} className="flex items-center gap-3 h-11 px-3.5 border-b border-line last:border-b-0 text-sm">
                      <span title={getStatusLabel(report.status, locale)}><StatusGlyph status={report.status} /></span>
                      <span title={priority.label}><PriorityGlyph meta={priority} /></span>
                      <span className="font-mono text-xs text-fg-faint w-10">#{report.id}</span>
                      <span className="flex-1 truncate text-base text-fg">{report.subject}</span>
                      <span className="text-fg-subtle w-32 truncate">{getCategoryLabel(report.category, categories, locale)}</span>
                      <span className="text-fg-subtle w-32 truncate">{report.claimedByName || "–"}</span>
                      <span className="text-fg-subtle w-28 text-right tabular-nums" title={formatFullDate(report.createdAt, language)}>
                        {formatDateTime(report.createdAt, language)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )
          ) : (
            <div className="flex flex-col gap-2.5">
              {canManage && (
                <div className="flex items-end gap-2 p-3 rounded-lg border border-amber-line bg-amber-soft">
                  <textarea
                    value={newNote}
                    rows={2}
                    maxLength={1000}
                    onChange={(event) => setNewNote(event.target.value)}
                    placeholder={locale.add_player_note_placeholder || "Add a note about this player..."}
                    className="flex-1 min-w-0 px-3 py-2 rounded-md border border-amber-line bg-panel text-base text-fg placeholder:text-fg-faint resize-none focus:outline-none focus:border-amber"
                  />
                  <Button variant="secondary" icon="note" onClick={submitNote} disabled={!newNote.trim()} className="h-10">
                    {locale.add_note || "Add note"}
                  </Button>
                </div>
              )}
              {history.notes.length === 0 ? (
                <EmptyState icon="note" title={locale.no_player_notes || "No notes for this player"} />
              ) : (
                history.notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    author={note.adminName}
                    text={note.note}
                    createdAt={note.createdAt}
                    language={language}
                    pending={note.id < 0}
                    onDelete={canManage && note.id > 0 ? () => removeNote(note.id) : undefined}
                    deleteLabel={locale.delete || "Delete"}
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
