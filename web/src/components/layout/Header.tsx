"use client"

import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"
import { Button } from "@/components/ui"

export function Header() {
  const { theme, setTheme, playerData, activeTab, setActiveTab, locale } = useReportStore()
  const { close, setTheme: saveTheme } = useNuiActions()

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    saveTheme(newTheme)
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-bg-elevated border-b border-border">
      {/* Logo */}
      <div className="flex flex-col">
        <span className="text-xl font-bold text-text-primary tracking-tight">Reports</span>
        <span className="text-[10px] xl:text-xs font-semibold text-accent uppercase tracking-wider">Support System</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-bg-card rounded-lg">
        <button
          onClick={() => setActiveTab("my-reports")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "my-reports"
              ? "bg-bg-elevated text-text-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          {locale.my_reports || "My Reports"}
        </button>

        {playerData?.isAdmin && (
          <>
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "admin"
                  ? "bg-bg-elevated text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {locale.admin_panel || "Admin Panel"}
            </button>
            <button
              onClick={() => setActiveTab("statistics")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "statistics"
                  ? "bg-bg-elevated text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {locale.statistics || "Statistics"}
            </button>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleThemeToggle} title={locale.theme || "Theme"}>
          {theme === "dark" ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={close}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
    </header>
  )
}
