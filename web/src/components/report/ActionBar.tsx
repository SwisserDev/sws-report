"use client"

import { Fragment, useState } from "react"
import type { Report } from "@/types"
import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"
import { useCompactFit } from "@/hooks/useCompactFit"
import { Button, ConfirmDialog, type IconName } from "@/components/ui"

interface PlayerAction {
  action: string
  icon: IconName
  label: string
  fallback: string
}

// Grouped by intent, the destructive kick sits apart at the far end
const GROUPS: PlayerAction[][] = [
  [
    { action: "teleport_to", icon: "pin", label: "teleport", fallback: "Teleport" },
    { action: "bring_player", icon: "bring", label: "bring", fallback: "Bring" },
    { action: "spectate_player", icon: "eye", label: "spectate_player", fallback: "Spectate" }
  ],
  [
    { action: "heal_player", icon: "heart", label: "heal_player", fallback: "Heal" },
    { action: "revive_player", icon: "bolt", label: "revive_player", fallback: "Revive" },
    { action: "freeze_player", icon: "snowflake", label: "freeze_player", fallback: "Freeze" },
    { action: "ragdoll_player", icon: "ragdoll", label: "ragdoll_player", fallback: "Ragdoll" }
  ],
  [
    { action: "screenshot_player", icon: "camera", label: "screenshot_player", fallback: "Screenshot" }
  ]
]

export function ActionBar({ report }: { report: Report }) {
  const { locale, hasPermission } = useReportStore()
  const { adminAction } = useNuiActions()
  const [confirmKick, setConfirmKick] = useState(false)

  const groups = GROUPS.map((group) => group.filter((item) => hasPermission(item.action))).filter((group) => group.length > 0)
  const canKick = hasPermission("kick_player")
  const { ref, compact } = useCompactFit<HTMLDivElement>([groups.length, canKick, locale])

  if (groups.length === 0 && !canKick) return null

  const offline = !report.isPlayerOnline
  const offlineHint = locale.player_offline || "Player is offline"

  return (
    <div ref={ref} className="flex items-center gap-1.5 px-4 py-2.5 border-t border-line bg-panel shrink-0 overflow-hidden">
      {groups.map((group, index) => (
        <Fragment key={index}>
          {index > 0 && <span className="w-px h-5 mx-1.5 bg-line-strong shrink-0" />}
          {group.map((item) => {
            const label = locale[item.label] || item.fallback
            return (
              <Button
                key={item.action}
                size="sm"
                variant="ghost"
                icon={item.icon}
                disabled={offline}
                title={offline ? offlineHint : label}
                aria-label={label}
                onClick={() => adminAction(report.id, item.action)}
                className="shrink-0"
              >
                {!compact && label}
              </Button>
            )
          })}
        </Fragment>
      ))}

      {canKick && (
        <Button
          size="sm"
          variant="subtle"
          icon="kick"
          iconClassName="text-red-fg"
          disabled={offline}
          title={offline ? offlineHint : undefined}
          onClick={() => setConfirmKick(true)}
          className="ml-auto shrink-0"
        >
          {locale.kick_player || "Kick"}
        </Button>
      )}

      {offline && (
        <span className="ml-3 text-xs text-fg-faint whitespace-nowrap shrink-0">{offlineHint}</span>
      )}

      <ConfirmDialog
        isOpen={confirmKick}
        title={(locale.kick_confirm_title || "Kick %s?").replace("%s", report.playerName)}
        message={locale.kick_confirm_message || "The player is disconnected from the server immediately. The reason is shown to them and logged in the report."}
        confirmLabel={locale.kick_player || "Kick"}
        reasonLabel={locale.kick_reason || "Reason"}
        reasonPlaceholder={locale.kick_reason_placeholder || "e.g. Repeated RDM after warning"}
        onConfirm={(reason) => adminAction(report.id, "kick_player", reason)}
        onClose={() => setConfirmKick(false)}
      />
    </div>
  )
}
