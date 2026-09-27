"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useEscapeLayer } from "@/hooks/useEscapeLayer"
import { Icon, type IconName } from "./Icon"

export interface MenuItem {
  key: string
  label: string
  icon?: IconName
  /** Custom leading element, e.g. a priority glyph */
  leading?: ReactNode
  selected?: boolean
  danger?: boolean
  disabled?: boolean
  onSelect: () => void
}

interface MenuProps {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode
  items: MenuItem[]
  align?: "left" | "right"
  /** Opens upwards, for menus at the bottom of the window */
  placement?: "below" | "above"
  className?: string
}

export function Menu({ trigger, items, align = "left", placement = "below", className }: MenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEscapeLayer(() => setOpen(false), open, 3)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [open])

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      {trigger({ open, toggle: () => setOpen((value) => !value) })}

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-40 min-w-[11rem] py-1 rounded-lg border border-line-strong bg-panel shadow-[var(--shadow-pop)] anim-pop",
            align === "right" ? "right-0" : "left-0",
            placement === "above" ? "bottom-full mb-1.5" : "top-full mt-1.5"
          )}
        >
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false)
                item.onSelect()
              }}
              className={cn(
                "w-full flex items-center gap-2.5 h-8 px-3 text-left text-base whitespace-nowrap",
                "hover:bg-hover disabled:opacity-45 disabled:pointer-events-none",
                item.danger ? "text-red-fg" : "text-fg"
              )}
            >
              {item.leading ?? (item.icon && <Icon name={item.icon} className={item.danger ? "text-red-fg" : "text-fg-subtle"} />)}
              <span className="flex-1">{item.label}</span>
              {item.selected && <Icon name="check" className="text-accent-fg" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
