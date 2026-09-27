"use client"

import { cn } from "@/lib/utils"

interface SegmentedOption<T extends string> {
  value: T
  label: string
  count?: number
}

interface SegmentedProps<T extends string> {
  value: T
  options: SegmentedOption<T>[]
  onChange: (value: T) => void
  className?: string
}

/** Mutually exclusive views, all options visible at once */
export function Segmented<T extends string>({ value, options, onChange, className }: SegmentedProps<T>) {
  return (
    <div role="tablist" className={cn("flex p-0.5 rounded-md bg-canvas border border-line", className)}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-1.5 h-7 px-2.5 rounded-[0.3rem] text-sm font-medium whitespace-nowrap",
              "transition-colors duration-100",
              selected ? "bg-active text-fg shadow-[0_1px_0_rgba(0,0,0,0.25)]" : "text-fg-subtle hover:text-fg"
            )}
          >
            {option.label}
            {option.count !== undefined && option.count > 0 && (
              <span className={cn("text-xs tabular-nums", selected ? "text-fg-muted" : "text-fg-faint")}>{option.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
