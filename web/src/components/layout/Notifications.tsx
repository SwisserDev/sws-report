"use client"

import { useReportStore } from "@/stores/reportStore"
import { Icon, type IconName } from "@/components/ui"
import { cn } from "@/lib/utils"

const TYPES: Record<string, { icon: IconName; color: string }> = {
  success: { icon: "check", color: "text-green-fg" },
  error: { icon: "warning", color: "text-red-fg" },
  info: { icon: "info", color: "text-accent-fg" }
}

export function Notifications() {
  const { notifications, removeNotification } = useReportStore()

  return (
    // Sits directly on the game, so every toast gets a solid backing
    <div className="fixed top-5 right-5 z-[9999] flex flex-col items-end gap-2 pointer-events-none">
      {notifications.map((notification) => {
        const type = TYPES[notification.type] ?? TYPES.info
        return (
          <div
            key={notification.id}
            onClick={() => removeNotification(notification.id)}
            className="flex items-start gap-2.5 w-[22rem] px-3.5 py-3 rounded-lg border border-line-strong bg-panel shadow-[var(--shadow-pop)] pointer-events-auto cursor-pointer anim-toast"
          >
            <Icon name={type.icon} className={cn("mt-0.5", type.color)} strokeWidth={2.25} />
            <p className="flex-1 text-base text-fg leading-snug">{notification.message}</p>
          </div>
        )
      })}
    </div>
  )
}
