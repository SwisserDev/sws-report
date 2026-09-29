"use client"

import { useEffect } from "react"
import { useReportStore } from "@/stores/reportStore"
import { useNuiListener, useNuiActions } from "@/hooks/useNui"
import { useEscapeLayer } from "@/hooks/useEscapeLayer"
import { isEnvBrowser } from "@/lib/nui"
import { Header } from "@/components/layout/Header"
import { Notifications } from "@/components/layout/Notifications"
import { Footer } from "@/components/layout/Footer"
import { ReportList, ReportDetail, ReportCreate } from "@/components/report"
import { StatisticsPanel } from "@/components/stats/StatisticsPanel"
import { cn } from "@/lib/utils"

export default function Home() {
  const { isVisible, theme, activeTab, uiScale } = useReportStore()

  const { close } = useNuiActions()

  useNuiListener()

  // Browser preview (npm run dev) gets a fake Lua side with demo data
  useEffect(() => {
    if (isEnvBrowser()) {
      import("@/lib/mock/backend").then((mock) => mock.bootMock())
    }
  }, [])

  // Lowest layer: Escape only closes the whole UI when no overlay is open
  useEscapeLayer(close, isVisible, 0)

  // Config.UI.scale on top of the resolution based root size (see globals.css)
  useEffect(() => {
    document.documentElement.style.setProperty("--ui-scale", String(uiScale || 1))
  }, [uiScale])

  return (
    <div data-theme={theme}>
      {/* Scrim dims the game; the window itself is opaque, there is no blur in CEF */}
      <div className={cn("fixed inset-0 items-center justify-center bg-scrim", isVisible ? "flex" : "hidden")}>
        <div className="w-[92.5rem] max-w-[96vw] h-[55rem] max-h-[92vh] flex flex-col bg-canvas text-fg border border-line-strong rounded-lg shadow-[var(--shadow-window)] overflow-hidden anim-window">
          <Header />
          {activeTab === "statistics" ? (
            <StatisticsPanel />
          ) : (
            <div className="flex flex-1 min-h-0">
              <ReportList />
              <ReportDetail />
            </div>
          )}
          <Footer />
        </div>
      </div>

      {/* Overlays */}
      <Notifications />
      <ReportCreate />
    </div>
  )
}
