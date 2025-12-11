"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type BadgeVariant = "default" | "open" | "claimed" | "resolved" | "info"

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-bg-elevated text-text-secondary border-border",
  open: "bg-info-bg text-info border-info-border",
  claimed: "bg-warning-bg text-warning border-warning-border",
  resolved: "bg-success-bg text-success border-success-border",
  info: "bg-accent/10 text-accent border-accent/30"
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
