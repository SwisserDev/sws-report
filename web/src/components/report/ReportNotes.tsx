"use client"

import { useEffect, useState } from "react"
import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"
import { Button, EmptyState, NoteCard } from "@/components/ui"
import type { ReportNote } from "@/types"

export function ReportNotes({ reportId }: { reportId: number }) {
  const [newNote, setNewNote] = useState("")
  const { getReportNotes, locale, hasPermission, language } = useReportStore()
  const { addReportNote, deleteReportNote, getReportNotes: fetchNotes } = useNuiActions()

  const notes = getReportNotes(reportId)
  const canManage = hasPermission("manage_notes")

  useEffect(() => {
    fetchNotes(reportId)
  }, [reportId, fetchNotes])

  const submit = () => {
    const text = newNote.trim()
    if (!text) return

    useReportStore.getState().addReportNote({
      id: -Date.now(),
      reportId,
      adminId: "pending",
      adminName: locale.you || "You",
      note: text,
      createdAt: new Date().toISOString()
    })
    addReportNote(reportId, text)
    setNewNote("")
  }

  const remove = (noteId: number) => {
    useReportStore.getState().removeReportNote(reportId, noteId)
    deleteReportNote(noteId)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
        {notes.length === 0 ? (
          <EmptyState
            icon="note"
            title={locale.no_notes || "No notes yet"}
            hint={locale.notes_hint || "Notes are only visible to staff. Use them for context the next person needs."}
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {notes.map((note: ReportNote) => (
              <NoteCard
                key={note.id}
                author={note.adminName}
                text={note.note}
                createdAt={note.createdAt}
                language={language}
                pending={note.id < 0}
                onDelete={canManage && note.id > 0 ? () => remove(note.id) : undefined}
                deleteLabel={locale.delete || "Delete"}
              />
            ))}
          </div>
        )}
      </div>

      {canManage && (
        // Amber like the notes themselves, so nobody mistakes this for the player chat
        <div className="flex items-end gap-2 px-4 py-3 border-t border-amber-line bg-amber-soft shrink-0">
          <textarea
            value={newNote}
            rows={2}
            maxLength={1000}
            onChange={(event) => setNewNote(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) submit()
            }}
            placeholder={locale.add_note_placeholder || "Only staff can see this note..."}
            className="flex-1 min-w-0 px-3 py-2 rounded-md border border-amber-line bg-panel text-base text-fg placeholder:text-fg-faint resize-none focus:outline-none focus:border-amber"
          />
          <Button variant="secondary" icon="note" onClick={submit} disabled={!newNote.trim()} className="h-10">
            {locale.add_note || "Add note"}
          </Button>
        </div>
      )}
    </div>
  )
}
