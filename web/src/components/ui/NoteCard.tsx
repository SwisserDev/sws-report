"use client"

import { Avatar } from "./Glyphs"
import { IconButton } from "./Button"
import { formatDateTime, formatFullDate } from "@/lib/time"
import { cn } from "@/lib/utils"

interface NoteCardProps {
  author: string
  text: string
  createdAt: string
  language: string
  pending?: boolean
  onDelete?: () => void
  deleteLabel?: string
}

/** Staff-only note, tinted amber everywhere it shows up */
export function NoteCard({ author, text, createdAt, language, pending, onDelete, deleteLabel = "Delete" }: NoteCardProps) {
  return (
    <div className={cn("group px-3.5 py-3 rounded-lg border border-amber-line bg-amber-soft", pending && "opacity-60")}>
      <div className="flex items-center gap-2 mb-1.5">
        <Avatar name={author} size="sm" />
        <span className="text-sm font-medium text-fg">{author}</span>
        <span className="text-xs text-fg-subtle" title={formatFullDate(createdAt, language)}>
          {formatDateTime(createdAt, language)}
        </span>
        {onDelete && (
          <IconButton
            icon="trash"
            label={deleteLabel}
            size="sm"
            onClick={onDelete}
            className="ml-auto -my-1 w-7 h-7 opacity-60 group-hover:opacity-100"
          />
        )}
      </div>
      <p className="text-base text-fg leading-relaxed prewrap">{text}</p>
    </div>
  )
}
