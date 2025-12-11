"use client"

import { useReportStore } from "@/stores/reportStore"
import { cn } from "@/lib/utils"

export function Notifications() {
  const { notifications, removeNotification } = useReportStore()

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case "error":
        return (
          <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getBorderColor = (type: string) => {
    switch (type) {
      case "success": return "border-l-success"
      case "error": return "border-l-error"
      default: return "border-l-info"
    }
  }

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => removeNotification(notification.id)}
          className={cn(
            "flex items-center gap-3 min-w-[320px] max-w-[400px] p-4",
            "bg-bg-elevated border border-border border-l-[3px] rounded-lg shadow-lg",
            "animate-[slide-in-right_0.3s_ease-out] cursor-pointer pointer-events-auto",
            getBorderColor(notification.type)
          )}
        >
          {getIcon(notification.type)}
          <p className="flex-1 text-sm text-text-primary">{notification.message}</p>
        </div>
      ))}
    </div>
  )
}
