import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Icon, type IconName } from "./Icon"

interface EmptyStateProps {
  icon: IconName
  title: string
  /** Why it's empty or what to do next */
  hint?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, hint, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center px-6 py-10", className)}>
      <span className="flex items-center justify-center w-10 h-10 mb-3 rounded-lg border border-line text-fg-faint">
        <Icon name={icon} className="w-5 h-5" />
      </span>
      <p className="text-base font-medium text-fg-muted">{title}</p>
      {hint && <p className="mt-1 max-w-[22rem] text-sm text-fg-subtle">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
