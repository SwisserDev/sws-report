"use client"

import { useReportStore } from "@/stores/reportStore"

export function Footer() {
  const { locale } = useReportStore()

  return (
    <footer className="flex items-center justify-between h-7 px-4 border-t border-line bg-canvas text-2xs text-fg-faint shrink-0 select-none">
      <span>
        Made by <span className="font-medium text-fg-subtle">SwisserDev</span>
      </span>
      <span className="flex items-center gap-1.5">
        <kbd className="px-1 rounded-sm border border-line-strong font-mono text-[0.625rem] leading-[0.875rem] text-fg-subtle">Esc</kbd>
        {locale.close || "Close"}
      </span>
    </footer>
  )
}
