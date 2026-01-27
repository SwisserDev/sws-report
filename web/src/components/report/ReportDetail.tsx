"use client"

import { useState } from "react"
import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"
import { Button, Badge } from "@/components/ui"
import { PriorityBadge } from "@/components/ui/PriorityBadge"
import { PrioritySelector } from "@/components/ui/PrioritySelector"
import { ReportChat } from "./ReportChat"
import { ReportNotes } from "./ReportNotes"
import { PlayerInfoPanel } from "./PlayerInfoPanel"
import { InventoryPanel } from "./InventoryPanel"
import { formatTimestamp } from "@/lib/utils"

type ActionTab = "report" | "player" | "moderation"
type DetailTab = "chat" | "notes" | "inventory"

export function ReportDetail() {
  const { getSelectedReport, playerData, categories, locale, activeTab, hasPermission } = useReportStore()
  const [actionTab, setActionTab] = useState<ActionTab>("report")
  const [detailTab, setDetailTab] = useState<DetailTab>("chat")
  const [showPlayerInfo, setShowPlayerInfo] = useState(false)
  const { claimReport, unclaimReport, resolveReport, deleteReport, adminAction } = useNuiActions()

  const report = getSelectedReport()

  if (!report) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-text-tertiary">
        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
        <p className="text-sm">{locale.select_report || "Select a report to view details"}</p>
      </div>
    )
  }

  const category = categories.find((c) => c.id === report.category)
  const isAdmin = playerData?.isAdmin
  const isOwner = report.playerId === playerData?.identifier
  const isClaimed = report.status === "claimed"
  const isResolved = report.status === "resolved"
  const isClaimedByMe = report.claimedBy === playerData?.identifier
  const canDelete = (isOwner && !isClaimed) || hasPermission("delete_report")

  // Permission-based visibility for action tabs
  const hasPlayerActions = hasPermission("teleport_to") || hasPermission("bring_player") || hasPermission("heal_player") || hasPermission("revive_player")
  const hasModerationActions = hasPermission("freeze_player") || hasPermission("spectate_player") || hasPermission("ragdoll_player") || hasPermission("screenshot_player") || hasPermission("kick_player")

  const getStatusVariant = () => {
    switch (report.status) {
      case "open": return "open"
      case "claimed": return "claimed"
      case "resolved": return "resolved"
      default: return "default"
    }
  }

  const getStatusLabel = () => {
    const key = `status_${report.status}`
    return locale[key] || report.status
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        {/* Badge Bar */}
        <div className="flex items-center gap-3 px-3 py-2 mb-3 bg-bg-tertiary/50 rounded-lg">
          <span className="font-mono text-xs text-text-tertiary">#{report.id}</span>
          <Badge variant={getStatusVariant()}>{getStatusLabel()}</Badge>
          {hasPermission("set_priority") && activeTab === "admin" ? (
            <PrioritySelector reportId={report.id} currentPriority={report.priority} />
          ) : (
            <PriorityBadge priority={report.priority} />
          )}
        </div>

        {/* Subject */}
        <h2 className="text-lg font-semibold text-text-primary mb-2">{report.subject}</h2>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
          {hasPermission("view_player_history") && activeTab === "admin" ? (
            <button
              onClick={() => setShowPlayerInfo(true)}
              className="flex items-center gap-1.5 hover:text-accent transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {report.playerName}
              <span
                className={`w-2 h-2 rounded-full ${report.isPlayerOnline ? "bg-green-500" : "bg-red-500"}`}
                title={report.isPlayerOnline ? "Online" : "Offline"}
              />
              <svg className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          ) : (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {report.playerName}
              <span
                className={`w-2 h-2 rounded-full ${report.isPlayerOnline ? "bg-green-500" : "bg-red-500"}`}
                title={report.isPlayerOnline ? "Online" : "Offline"}
              />
            </span>
          )}

          {category && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {category.label}
            </span>
          )}

          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTimestamp(report.createdAt)}
          </span>

          {report.claimedByName && (
            <span className="flex items-center gap-1.5 text-warning">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {report.claimedByName}
            </span>
          )}
        </div>
      </div>

      {/* PlayerInfo Panel */}
      {showPlayerInfo && (
        <PlayerInfoPanel
          playerId={report.playerId}
          playerName={report.playerName}
          onClose={() => setShowPlayerInfo(false)}
        />
      )}

      {/* Description */}
      {report.description && (
        <div className="px-6 py-3 border-b border-border">
          <div className="p-3 bg-bg-card border border-border rounded-lg max-h-[100px] xl:max-h-[140px] 2xl:max-h-[180px] overflow-y-auto">
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
              {report.description}
            </p>
          </div>
        </div>
      )}

      {/* Chat/Notes Tabs (Admin only) */}
      {isAdmin && activeTab === "admin" ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex border-b border-border">
            <button
              onClick={() => setDetailTab("chat")}
              className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                detailTab === "chat"
                  ? "border-accent text-text-primary"
                  : "border-transparent text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {locale.chat || "Chat"}
            </button>
            {hasPermission("view_notes") && (
              <button
                onClick={() => setDetailTab("notes")}
                className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                  detailTab === "notes"
                    ? "border-accent text-text-primary"
                    : "border-transparent text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {locale.admin_notes || "Notes"}
              </button>
            )}
            {hasPermission("manage_inventory") && (
              <button
                onClick={() => setDetailTab("inventory")}
                className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                  detailTab === "inventory"
                    ? "border-accent text-text-primary"
                    : "border-transparent text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {locale.inventory || "Inventory"}
              </button>
            )}
          </div>
          {detailTab === "chat" ? (
            <ReportChat report={report} />
          ) : detailTab === "notes" ? (
            <ReportNotes reportId={report.id} />
          ) : (
            <InventoryPanel reportId={report.id} isPlayerOnline={report.isPlayerOnline} />
          )}
        </div>
      ) : (
        <ReportChat report={report} />
      )}

      {/* Actions */}
      {!isResolved && (
        <div className="bg-bg-secondary border-t border-border">
          {isAdmin && activeTab === "admin" && (
            <div className="flex flex-col">
              {/* Tab Navigation - docked to border, centered */}
              <div className="flex items-center justify-center gap-0 border-b border-border">
                <button
                  onClick={() => setActionTab("report")}
                  className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                    actionTab === "report"
                      ? "border-accent text-text-primary bg-bg-secondary"
                      : "border-transparent text-text-tertiary hover:text-text-secondary"
                  }`}
                >
                  {locale.report || "Report"}
                </button>
                {hasPlayerActions && (
                  <button
                    onClick={() => setActionTab("player")}
                    className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                      actionTab === "player"
                        ? "border-accent text-text-primary bg-bg-secondary"
                        : "border-transparent text-text-tertiary hover:text-text-secondary"
                    }`}
                  >
                    {locale.player || "Player"}
                  </button>
                )}
                {hasModerationActions && (
                  <button
                    onClick={() => setActionTab("moderation")}
                    className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                      actionTab === "moderation"
                        ? "border-accent text-text-primary bg-bg-secondary"
                        : "border-transparent text-text-tertiary hover:text-text-secondary"
                    }`}
                  >
                    {locale.moderation || "Moderation"}
                  </button>
                )}
              </div>

              {/* Tab Content */}
              <div className="flex items-center justify-center gap-2 px-6 py-3">
                {actionTab === "report" && (
                  <>
                    {!isClaimed && hasPermission("claim_report") ? (
                      <Button size="sm" variant="primary" onClick={() => claimReport(report.id)}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                        </svg>
                        {locale.claim_report || "Claim"}
                      </Button>
                    ) : isClaimed && isClaimedByMe && hasPermission("claim_report") && (
                      <Button size="sm" variant="ghost" onClick={() => unclaimReport(report.id)}>
                        {locale.unclaim_report || "Unclaim"}
                      </Button>
                    )}
                    {hasPermission("resolve_report") && (
                      <Button size="sm" variant="success" onClick={() => resolveReport(report.id)}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {locale.resolve_report || "Resolve"}
                      </Button>
                    )}
                    {canDelete && (
                      <Button size="sm" variant="danger" onClick={() => deleteReport(report.id)}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {locale.delete || "Delete"}
                      </Button>
                    )}
                  </>
                )}

                {actionTab === "player" && (
                  <>
                    {hasPermission("teleport_to") && (
                      <Button size="sm" variant="ghost" onClick={() => adminAction(report.id, "teleport_to")}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {locale.teleport_to || "Goto"}
                      </Button>
                    )}
                    {hasPermission("bring_player") && (
                      <Button size="sm" variant="ghost" onClick={() => adminAction(report.id, "bring_player")}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        {locale.bring_player || "Bring"}
                      </Button>
                    )}
                    {hasPermission("heal_player") && (
                      <Button size="sm" variant="ghost" onClick={() => adminAction(report.id, "heal_player")}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {locale.heal_player || "Heal"}
                      </Button>
                    )}
                    {hasPermission("revive_player") && (
                      <Button size="sm" variant="ghost" onClick={() => adminAction(report.id, "revive_player")}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {locale.revive_player || "Revive"}
                      </Button>
                    )}
                  </>
                )}

                {actionTab === "moderation" && (
                  <>
                    {hasPermission("freeze_player") && (
                      <Button size="sm" variant="ghost" onClick={() => adminAction(report.id, "freeze_player")}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                        </svg>
                        {locale.freeze_player || "Freeze"}
                      </Button>
                    )}
                    {hasPermission("spectate_player") && (
                      <Button size="sm" variant="ghost" onClick={() => adminAction(report.id, "spectate_player")}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {locale.spectate_player || "Spectate"}
                      </Button>
                    )}
                    {hasPermission("ragdoll_player") && (
                      <Button size="sm" variant="ghost" onClick={() => adminAction(report.id, "ragdoll_player")}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {locale.ragdoll_player || "Ragdoll"}
                      </Button>
                    )}
                    {hasPermission("screenshot_player") && (
                      <Button size="sm" variant="ghost" onClick={() => adminAction(report.id, "screenshot_player")}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {locale.screenshot_player || "Screenshot"}
                      </Button>
                    )}
                    {hasPermission("kick_player") && (
                      <Button size="sm" variant="danger" onClick={() => adminAction(report.id, "kick_player")}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {locale.kick_player || "Kick"}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Non-admin delete button */}
          {!isAdmin && canDelete && (
            <div className="px-6 py-3">
              <Button size="sm" variant="danger" onClick={() => deleteReport(report.id)}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {locale.delete || "Delete"}
              </Button>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
