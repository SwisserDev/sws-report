import { cn } from "@/lib/utils"
import type { ReportStatus } from "@/types"
import { initials, type PriorityMeta } from "@/lib/reportMeta"

const STATUS_COLOR: Record<ReportStatus, string> = {
  open: "text-fg-subtle",
  claimed: "text-amber",
  resolved: "text-green"
}

/**
 * Status as shape + color (ring = open, half = in progress, check = resolved),
 * readable without relying on color alone.
 */
export function StatusGlyph({ status, className }: { status: ReportStatus; className?: string }) {
  return (
    <svg viewBox="0 0 14 14" className={cn("w-3.5 h-3.5 shrink-0", STATUS_COLOR[status], className)} aria-hidden="true">
      {status === "open" && <circle cx="7" cy="7" r="5.25" fill="none" stroke="currentColor" strokeWidth="1.5" />}
      {status === "claimed" && (
        <>
          <circle cx="7" cy="7" r="5.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 3.5 A3.5 3.5 0 0 1 7 10.5 Z" fill="currentColor" />
        </>
      )}
      {status === "resolved" && (
        <>
          <circle cx="7" cy="7" r="6" fill="currentColor" />
          <path d="M4.4 7.2l1.8 1.8 3.5-3.7" fill="none" stroke="var(--color-panel)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  )
}

const PRIORITY_COLOR: Record<PriorityMeta["tone"], string> = {
  muted: "text-fg-muted",
  orange: "text-orange",
  red: "text-red"
}

/** Signal bars for low/normal/high, a solid square for urgent */
export function PriorityGlyph({ meta, className }: { meta: PriorityMeta; className?: string }) {
  if (meta.kind === "urgent") {
    return (
      <svg viewBox="0 0 14 14" className={cn("w-3.5 h-3.5 shrink-0 text-red", className)} aria-hidden="true">
        <rect x="0.5" y="0.5" width="13" height="13" rx="3" fill="currentColor" />
        <rect x="6.1" y="3" width="1.8" height="5.2" rx="0.9" fill="#fff" />
        <circle cx="7" cy="10.4" r="1.05" fill="#fff" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 14 14" className={cn("w-3.5 h-3.5 shrink-0", PRIORITY_COLOR[meta.tone], className)} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={1.5 + i * 4.25}
          y={9 - i * 3.25}
          width="2.75"
          height={3.5 + i * 3.25}
          rx="0.75"
          fill="currentColor"
          opacity={i < meta.bars ? 1 : 0.22}
        />
      ))}
    </svg>
  )
}

/** Initials in a neutral square, stable per name */
export function Avatar({ name, size = "md", className }: { name: string; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0 rounded-md bg-active text-fg-muted font-semibold select-none",
        size === "sm" && "w-5 h-5 text-[0.625rem]",
        size === "md" && "w-7 h-7 text-2xs",
        size === "lg" && "w-10 h-10 text-sm",
        className
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}

export function OnlineDot({ online, className }: { online?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block w-2 h-2 rounded-full shrink-0",
        online ? "bg-green" : "border-[1.5px] border-fg-faint",
        className
      )}
      aria-hidden="true"
    />
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("w-4 h-4 anim-spin", className)} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 00-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
