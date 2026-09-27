"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useEscapeLayer } from "@/hooks/useEscapeLayer"
import { IconButton } from "./Button"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: ReactNode
  /** Small line under the title */
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  /** Escape priority, raise it for dialogs opened from another overlay */
  layer?: number
}

const SIZES = {
  sm: "w-[26rem]",
  md: "w-[34rem]",
  lg: "w-[46rem]",
  xl: "w-[64rem]"
}

export function Modal({ isOpen, onClose, title, description, children, footer, size = "md", layer = 1 }: ModalProps) {
  useEscapeLayer(onClose, isOpen, layer)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim anim-fade" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "max-w-[94vw] max-h-[88vh] flex flex-col rounded-lg border border-line-strong bg-panel shadow-[var(--shadow-window)] anim-window",
          SIZES[size]
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
          <div className="min-w-0">
            <h3 className="text-md font-semibold text-fg">{title}</h3>
            {description && <p className="mt-0.5 text-sm text-fg-subtle">{description}</p>}
          </div>
          <IconButton icon="close" label="Close" size="sm" onClick={onClose} className="-mr-1.5 -mt-0.5" />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-1 pb-4">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-line bg-canvas rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
