"use client"

import { useEffect } from "react"
import { useReportStore } from "@/stores/reportStore"
import { useNuiListener, useNuiActions } from "@/hooks/useNui"
import { isEnvBrowser } from "@/lib/nui"
import { Header } from "@/components/layout/Header"
import { Notifications } from "@/components/layout/Notifications"
import { ReportList, ReportDetail, ReportCreate } from "@/components/report"
import { StatisticsPanel } from "@/components/report/StatisticsPanel"
import { cn } from "@/lib/utils"

export default function Home() {
  const {
    isVisible,
    theme,
    activeTab,
    setVisible,
    setTheme,
    setPlayerData,
    setCategories,
    setLocale,
    setMyReports,
    setAllReports,
    setStatistics
  } = useReportStore()

  const { close } = useNuiActions()

  useNuiListener()

  // Mock data for browser development
  useEffect(() => {
    if (isEnvBrowser()) {
      setVisible(true)
      setTheme("dark")
      setPlayerData({
        identifier: "license:test123",
        name: "TestPlayer",
        isAdmin: true
      })
      setCategories([
        { id: "general", label: "General", icon: "fa-circle-info" },
        { id: "bug", label: "Bug Report", icon: "fa-bug" },
        { id: "player", label: "Player Report", icon: "fa-user" },
        { id: "question", label: "Question", icon: "fa-question" },
        { id: "other", label: "Other", icon: "fa-ellipsis" }
      ])
      setLocale({
        my_reports: "My Reports",
        admin_panel: "Admin Panel",
        create_report: "Create Report",
        active_reports: "Active Reports",
        no_active_reports: "You have no active reports",
        no_reports: "No reports found",
        select_report: "Select a report to view details",
        status_open: "Open",
        status_claimed: "Claimed",
        status_resolved: "Resolved",
        claim_report: "Claim",
        unclaim_report: "Unclaim",
        resolve_report: "Resolve",
        teleport_to: "Teleport",
        bring_player: "Bring",
        heal_player: "Heal",
        delete: "Delete",
        chat: "Chat",
        type_message: "Type a message...",
        cancel: "Cancel",
        submit: "Submit",
        report_subject: "Subject",
        report_subject_placeholder: "Brief summary of your issue",
        report_category: "Category",
        report_category_placeholder: "Select a category",
        report_description: "Description",
        report_description_placeholder: "Provide more details...",
        all: "All",
        theme: "Theme",
        search_by_player: "Search player..."
      })
      setMyReports([
        {
          id: 1,
          playerId: "license:test123",
          playerName: "TestPlayer",
          subject: "Need help with a vehicle",
          category: "general",
          description: "My vehicle disappeared after I parked it near the bank. Can someone help me recover it?",
          status: "open",
          priority: 0,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          messages: [
            {
              id: 1,
              reportId: 1,
              senderId: "license:test123",
              senderName: "TestPlayer",
              senderType: "player",
              message: "Hello, I really need help with this!",
              createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
            }
          ]
        },
        {
          id: 2,
          playerId: "license:test123",
          playerName: "TestPlayer",
          subject: "Bug in the inventory system",
          category: "bug",
          description: "Items are duplicating when I transfer them quickly.",
          status: "claimed",
          claimedBy: "license:admin123",
          claimedByName: "AdminUser",
          priority: 1,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          messages: []
        }
      ])
      setAllReports([
        {
          id: 3,
          playerId: "license:other456",
          playerName: "OtherPlayer",
          subject: "Player RDM complaint",
          category: "player",
          description: "User XYZ killed me without any roleplay.",
          status: "open",
          priority: 2,
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          messages: []
        }
      ])
      setStatistics({
        totalReports: 156,
        openReports: 12,
        claimedReports: 8,
        resolvedReports: 136,
        avgResolutionTime: 45,
        reportsByCategory: [
          { category: "general", count: 45 },
          { category: "bug", count: 38 },
          { category: "player", count: 52 },
          { category: "question", count: 15 },
          { category: "other", count: 6 }
        ],
        reportsByPriority: [
          { priority: 0, count: 78 },
          { priority: 1, count: 42 },
          { priority: 2, count: 28 },
          { priority: 3, count: 8 }
        ],
        adminLeaderboard: [
          { adminId: "steam:1", adminName: "Admin_Mike", claimed: 45, resolved: 42, messages: 156 },
          { adminId: "steam:2", adminName: "Admin_Sarah", claimed: 38, resolved: 35, messages: 120 },
          { adminId: "steam:3", adminName: "Admin_Tom", claimed: 28, resolved: 25, messages: 89 },
          { adminId: "steam:4", adminName: "Admin_Lisa", claimed: 22, resolved: 20, messages: 67 },
          { adminId: "steam:5", adminName: "Admin_Max", claimed: 15, resolved: 14, messages: 45 }
        ],
        recentActivity: [
          { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], count: 18 },
          { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], count: 24 },
          { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], count: 15 },
          { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], count: 32 },
          { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], count: 28 },
          { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], count: 21 },
          { date: new Date().toISOString().split("T")[0], count: 12 }
        ]
      })
    }
  }, [setVisible, setTheme, setPlayerData, setCategories, setLocale, setMyReports, setAllReports, setStatistics])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        close()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isVisible, close])

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
