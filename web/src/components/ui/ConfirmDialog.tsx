"use client"

import { useState, type ReactNode } from "react"
import { useReportStore } from "@/stores/reportStore"
import { Modal } from "./Modal"
import { Button } from "./Button"
import { Input, Label } from "./Input"

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  /** Name the consequence, e.g. "Kick Marcus Hale from the server?" */
  message: ReactNode
  confirmLabel: string
  onConfirm: (reason: string) => void
  onClose: () => void
  /** Ask for a short reason, sent along with the action */
  reasonLabel?: string
  reasonPlaceholder?: string
  reasonRequired?: boolean
}

/** Only for irreversible actions (kick, delete). Routine actions never ask. */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
  reasonLabel,
  reasonPlaceholder,
  reasonRequired
}: ConfirmDialogProps) {
  const { locale } = useReportStore()
  const [reason, setReason] = useState("")

  const close = () => {
    setReason("")
    onClose()
  }

  const confirm = () => {
    if (reasonRequired && !reason.trim()) return
    onConfirm(reason.trim())
    close()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={title}
      size="sm"
      layer={4}
      footer={
        <>
          <Button variant="ghost" onClick={close}>{locale.cancel || "Cancel"}</Button>
          <Button variant="danger" onClick={confirm} disabled={reasonRequired && !reason.trim()}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-base text-fg-muted leading-relaxed">{message}</div>
      {reasonLabel && (
        <div className="mt-4">
          <Label htmlFor="confirm-reason">{reasonLabel}</Label>
          <Input
            id="confirm-reason"
            autoFocus
            value={reason}
            maxLength={200}
            placeholder={reasonPlaceholder}
            onChange={(event) => setReason(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && confirm()}
          />
        </div>
      )}
    </Modal>
  )
}
