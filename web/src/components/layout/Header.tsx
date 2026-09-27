"use client"

import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"
import { IconButton, Icon, type IconName } from "@/components/ui"
import { cn } from "@/lib/utils"

type Tab = "my-reports" | "admin" | "statistics"

export function Header() {
  const { theme, setTheme, activeTab, setActiveTab, locale, hasPermission, myReports, allReports } = useReportStore()
  const { close, setTheme: saveTheme } = useNuiActions()

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    saveTheme(next)
  }

  const tabs: { id: Tab; label: string; icon: IconName; count?: number; visible: boolean }[] = [
    {
      id: "my-reports",
      label: locale.my_reports || "My Reports",
      icon: "ticket",
      count: myReports.filter((r) => r.status !== "resolved").length,
      visible: true
    },
    {
      id: "admin",
      label: locale.admin_panel || "Admin Panel",
      icon: "shield",
      // What staff care about at a glance: nobody has picked these up yet
      count: allReports.filter((r) => r.status === "open").length,
      visible: hasPermission("view_reports")
    },
    {
      id: "statistics",
      label: locale.statistics || "Statistics",
      icon: "chart",
      visible: hasPermission("view_statistics")
    }
  ]

  return (
    <header className="flex items-stretch h-[3.25rem] px-4 border-b border-line bg-panel shrink-0">
      <div className="flex items-center gap-2.5 min-w-[13rem]">
        <span className="flex items-center justify-center w-7 h-7 rounded-md bg-accent text-fg-on-accent">
          <Icon name="ticket" className="w-4 h-4" strokeWidth={2} />
        </span>
        <span className="text-md font-semibold text-fg">{locale.reports || "Reports"}</span>
      </div>

      <nav className="flex-1 flex items-stretch justify-center gap-1" role="tablist">
        {tabs.filter((tab) => tab.visible).map((tab) => {
          const selected = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-3.5 text-base font-medium transition-colors duration-100",
                selected ? "text-fg" : "text-fg-subtle hover:text-fg"
              )}
            >
              <Icon name={tab.icon} className={selected ? "text-accent-fg" : undefined} />
              {tab.label}
              {!!tab.count && (
                <span
                  className={cn(
                    "min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-semibold leading-5 tabular-nums",
                    selected ? "bg-accent text-fg-on-accent" : "bg-active text-fg-muted"
                  )}
                >
                  {tab.count}
                </span>
              )}
              {/* Second selection cue besides text color */}
              <span className={cn("absolute left-2 right-2 bottom-0 h-0.5 rounded-full", selected ? "bg-accent-fg" : "bg-transparent")} />
            </button>
          )
        })}
      </nav>

      <div className="flex items-center justify-end gap-1 min-w-[13rem]">
        <IconButton
          icon={theme === "dark" ? "sun" : "moon"}
          label={locale.theme || "Theme"}
          onClick={toggleTheme}
        />
        <IconButton icon="close" label={locale.close || "Close"} onClick={close} />
      </div>
    </header>
  )
}
