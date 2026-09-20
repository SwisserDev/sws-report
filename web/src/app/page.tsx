"use client"

import { useEffect } from "react"
import { useReportStore } from "@/stores/reportStore"
import { useNuiListener, useNuiActions } from "@/hooks/useNui"
import { useEscapeLayer } from "@/hooks/useEscapeLayer"
import { isEnvBrowser } from "@/lib/nui"
import { Header } from "@/components/layout/Header"
import { Notifications } from "@/components/layout/Notifications"
import { ReportList, ReportDetail, ReportCreate } from "@/components/report"
import { StatisticsPanel } from "@/components/report/StatisticsPanel"
import { cn } from "@/lib/utils"

export default function Home() {
  const { isVisible, theme, activeTab } = useReportStore()

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

  return (
    <div data-theme={theme}>
      {/* Main Container */}
      <div
        className={cn(
          "fixed inset-0 items-center justify-center bg-black/50 backdrop-blur-sm",
          isVisible ? "flex" : "hidden"
        )}
      >
        <div className="w-[1200px] xl:w-[1400px] 2xl:w-[1800px] max-w-[95vw] h-[800px] xl:h-[880px] 2xl:h-[1000px] max-h-[90vh] flex flex-col bg-bg-secondary border border-border rounded-xl shadow-lg overflow-hidden animate-[fade-in_0.3s_ease-out]">
          <Header />
          {activeTab === "statistics" ? (
            <StatisticsPanel />
          ) : (
            <div className="flex flex-1 overflow-hidden">
              <ReportList />
              <ReportDetail />
            </div>
          )}
        </div>
      </div>

      {/* Overlays */}
      <Notifications />
      <ReportCreate />
    </div>
  )
}
