"use client"

import { useState, useRef, useEffect } from "react"
import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"
import { cn } from "@/lib/utils"

interface PrioritySelectorProps {
  reportId: number
  currentPriority: number
}

const priorityColors: Record<string, { bg: string; text: string; hover: string }> = {
  gray: { bg: "bg-gray-500/20", text: "text-gray-400", hover: "hover:bg-gray-500/30" },
  blue: { bg: "bg-blue-500/20", text: "text-blue-400", hover: "hover:bg-blue-500/30" },
  orange: { bg: "bg-orange-500/20", text: "text-orange-400", hover: "hover:bg-orange-500/30" },
  red: { bg: "bg-red-500/20", text: "text-red-400", hover: "hover:bg-red-500/30" }
}

export function PrioritySelector({ reportId, currentPriority }: PrioritySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { priorities, locale } = useReportStore()
  const { setPriority } = useNuiActions()

  const currentConfig = priorities.find((p) => p.id === currentPriority) || priorities[0]
  const colors = priorityColors[currentConfig?.color || "gray"]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (priority: number) => {
    if (priority !== currentPriority) {
      setPriority(reportId, priority)
    }
    setIsOpen(false)
  }

  const getLabel = (label: string) => {
    return locale[`priority_${label.toLowerCase()}`] || label
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded transition-colors border border-transparent",
          colors.bg,
          colors.text,
          colors.hover
        )}
      >
        <svg className="w-3 h-3 fill-current" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="3" />
        </svg>
        {getLabel(currentConfig?.label || "Normal")}
        <svg className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-32 bg-bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {priorities.map((priority) => {
            const itemColors = priorityColors[priority.color]
            const isSelected = priority.id === currentPriority

            return (
              <button
                key={priority.id}
                onClick={() => handleSelect(priority.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors",
                  isSelected ? "bg-bg-tertiary" : "hover:bg-bg-tertiary",
                  itemColors.text
                )}
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                {getLabel(priority.label)}
                {isSelected && (
                  <svg className="w-3 h-3 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
