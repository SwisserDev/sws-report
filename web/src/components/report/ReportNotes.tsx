"use client"

import { useState, useEffect } from "react"
import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"
import { Button } from "@/components/ui"
import { formatRelativeTime } from "@/lib/utils"
import type { ReportNote } from "@/types"

interface ReportNotesProps {
  reportId: number
}

export function ReportNotes({ reportId }: ReportNotesProps) {
  const [newNote, setNewNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { getReportNotes, locale, hasPermission } = useReportStore()
  const { addReportNote, deleteReportNote, getReportNotes: fetchNotes } = useNuiActions()

  const notes = getReportNotes(reportId)

  useEffect(() => {
    fetchNotes(reportId)
  }, [reportId, fetchNotes])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim() || isSubmitting) return

    const noteText = newNote.trim()
    setIsSubmitting(true)
    setNewNote("")

    const optimisticNote: ReportNote = {
      id: -Date.now(),
      reportId,
      adminId: "pending",
      adminName: "You",
      note: noteText,
      createdAt: new Date().toISOString()
    }

    useReportStore.getState().addReportNote(optimisticNote)
    addReportNote(reportId, noteText)
    setTimeout(() => setIsSubmitting(false), 500)
  }

  const handleDelete = (noteId: number) => {
    useReportStore.getState().removeReportNote(reportId, noteId)
    deleteReportNote(noteId)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {locale.admin_notes || "Admin Notes"}
          <span className="text-xs text-text-tertiary font-normal">({locale.internal_only || "internal only"})</span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notes.length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-4">
            {locale.no_notes || "No notes yet"}
          </p>
        ) : (
          notes.map((note: ReportNote) => (
            <div key={note.id} className="p-3 bg-bg-tertiary rounded-lg group">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-accent">{note.adminName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] xl:text-xs text-text-tertiary">{formatRelativeTime(note.createdAt)}</span>
                  {hasPermission("manage_notes") && <button
                    onClick={() => handleDelete(note.id)}
                    className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-red-400 transition-all"
                    title={locale.delete || "Delete"}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>}
                </div>
              </div>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{note.note}</p>
            </div>
          ))
        )}
      </div>

      {hasPermission("manage_notes") && (
        <form onSubmit={handleSubmit} className="p-4 border-t border-border">
          <div className="flex gap-2">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder={locale.add_note_placeholder || "Add a note..."}
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
      )}
    </div>
  )
}
