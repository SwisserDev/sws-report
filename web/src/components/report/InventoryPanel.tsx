/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useMemo, useState } from "react"
import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"
import { Button, EmptyState, Icon, IconButton, Input, Label, Modal, Spinner, Textarea } from "@/components/ui"
import type { InventoryItem, InventoryItemInfo } from "@/types"
import { cn } from "@/lib/utils"

type ItemAction = "add" | "remove" | "set" | "metadata"

function ItemImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <span className="flex items-center justify-center w-8 h-8 rounded-md bg-raised border border-line shrink-0 overflow-hidden">
      {src && !failed ? (
        <img src={src} alt={alt} className="w-7 h-7 object-contain" onError={() => setFailed(true)} />
      ) : (
        <Icon name="box" className="w-4 h-4 text-fg-faint" />
      )}
    </span>
  )
}

interface ItemActionModalProps {
  onClose: () => void
  reportId: number
  item?: InventoryItem
  action: ItemAction
  itemList: Record<string, InventoryItemInfo>
}

function ItemActionModal({ onClose, reportId, item, action, itemList }: ItemActionModalProps) {
  const { locale } = useReportStore()
  const { addInventoryItem, removeInventoryItem, setInventoryItemCount, setInventoryItemMetadata } = useNuiActions()

  const [selectedItem, setSelectedItem] = useState(item?.name || "")
  const [count, setCount] = useState(action === "set" ? item?.count ?? 0 : 1)
  const [metadata, setMetadata] = useState(item?.metadata && action === "metadata" ? JSON.stringify(item.metadata, null, 2) : "")
  const [search, setSearch] = useState("")

  const minimum = action === "set" ? 0 : 1
  const parsedMetadata = useMemo(() => {
    if (!metadata.trim()) return { ok: true as const, value: undefined }
    try {
      return { ok: true as const, value: JSON.parse(metadata) as Record<string, unknown> }
    } catch {
      return { ok: false as const, value: undefined }
    }
  }, [metadata])

  const matches = Object.entries(itemList)
    .filter(([name, info]) => `${name} ${info.label}`.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 60)

  const titles: Record<ItemAction, string> = {
    add: locale.item_add || "Add Item",
    remove: locale.item_remove || "Remove Item",
    set: locale.item_set_count || "Set Count",
    metadata: locale.item_edit_metadata || "Edit Metadata"
  }

  const canSubmit = (action === "metadata" ? !!item?.slot : !!selectedItem) && parsedMetadata.ok && (action === "metadata" || count >= minimum)

  const submit = () => {
    if (!canSubmit) return
    if (action === "add") addInventoryItem(reportId, selectedItem, count, parsedMetadata.value)
    if (action === "remove") removeInventoryItem(reportId, selectedItem, count, item?.slot)
    if (action === "set") setInventoryItemCount(reportId, selectedItem, count)
    if (action === "metadata" && item?.slot) setInventoryItemMetadata(reportId, item.slot, parsedMetadata.value ?? {})
    onClose()
  }

  const selectedInfo = item ?? (selectedItem ? { name: selectedItem, label: itemList[selectedItem]?.label ?? selectedItem, image: itemList[selectedItem]?.image } : undefined)

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={titles[action]}
      size="sm"
      layer={2}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>{locale.cancel || "Cancel"}</Button>
          <Button variant="primary" onClick={submit} disabled={!canSubmit}>{locale.confirm || "Confirm"}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {!item && action !== "metadata" && (
          <div>
            <Label>{locale.item_select || "Select Item"}</Label>
            <Input icon="search" autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder={locale.item_search || "Search items..."} />
            <div className="mt-2 max-h-[13rem] overflow-y-auto rounded-md border border-line">
              {matches.map(([name, info]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedItem(name)}
                  className={cn(
                    "w-full flex items-center gap-2.5 h-9 px-2.5 text-left text-base border-b border-line last:border-b-0",
                    selectedItem === name ? "bg-accent-soft text-fg" : "text-fg-muted hover:bg-hover"
                  )}
                >
                  <span className="flex-1 truncate">{info.label}</span>
                  <span className="font-mono text-xs text-fg-faint">{name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedInfo && (
          <div className="flex items-center gap-2.5 p-2 rounded-md bg-raised border border-line">
            <ItemImage src={selectedInfo.image} alt={selectedInfo.label} />
            <span className="flex-1 text-base text-fg">{selectedInfo.label}</span>
            <span className="font-mono text-xs text-fg-faint">{selectedInfo.name}</span>
          </div>
        )}

        {action !== "metadata" && (
          <div>
            <Label htmlFor="item-count">{locale.item_count || "Count"}</Label>
            <div className="flex items-center gap-2">
              <IconButton icon="minus" label="-1" onClick={() => setCount((value) => Math.max(minimum, value - 1))} className="border-line-strong" />
              <Input
                id="item-count"
                type="number"
                className="flex-1 text-center tabular-nums"
                value={count}
                min={minimum}
                max={1000}
                onChange={(event) => setCount(Math.max(minimum, parseInt(event.target.value, 10) || 0))}
              />
              <IconButton icon="plus" label="+1" onClick={() => setCount((value) => value + 1)} className="border-line-strong" />
            </div>
          </div>
        )}

        {(action === "add" || action === "metadata") && (
          <div>
            <Label htmlFor="item-metadata">
              {locale.item_metadata || "Metadata"} <span className="font-normal text-fg-faint">JSON{action === "add" ? ", optional" : ""}</span>
            </Label>
            <Textarea
              id="item-metadata"
              rows={action === "metadata" ? 8 : 3}
              value={metadata}
              onChange={(event) => setMetadata(event.target.value)}
              placeholder='{ "serial": "ABC123" }'
              className={cn("font-mono text-sm", !parsedMetadata.ok && "border-red-fg")}
            />
            {!parsedMetadata.ok && <p className="mt-1 text-xs text-red-fg">{locale.invalid_json || "Not valid JSON"}</p>}
          </div>
        )}
      </div>
    </Modal>
  )
}

export function InventoryPanel({ reportId, isPlayerOnline }: { reportId: number; isPlayerOnline?: boolean }) {
  const { locale, getInventory, setInventoryLoading } = useReportStore()
  const { getPlayerInventory } = useNuiActions()
  const [modal, setModal] = useState<{ action: ItemAction; item?: InventoryItem } | null>(null)
  const [search, setSearch] = useState("")

  const inventory = getInventory(reportId)

  useEffect(() => {
    if (isPlayerOnline && !inventory) {
      setInventoryLoading(reportId, true)
      getPlayerInventory(reportId)
    }
  }, [reportId, isPlayerOnline, inventory, getPlayerInventory, setInventoryLoading])

  const refresh = () => {
    setInventoryLoading(reportId, true)
    getPlayerInventory(reportId)
  }

  if (!isPlayerOnline) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState icon="box" title={locale.inventory_player_offline || "Cannot view inventory - player is offline"} />
      </div>
    )
  }

  if (!inventory || inventory.loading) {
    return (
      <div className="flex-1 flex items-center justify-center gap-2 text-sm text-fg-subtle">
        <Spinner /> {locale.inventory_loading || "Loading inventory..."}
      </div>
    )
  }

  const items = inventory.items.filter((item) => `${item.name} ${item.label}`.toLowerCase().includes(search.toLowerCase()))
  const rowActions: { action: ItemAction; icon: "plus" | "minus" | "equals" | "braces"; label: string }[] = [
    { action: "add", icon: "plus", label: locale.item_add || "Add" },
    { action: "remove", icon: "minus", label: locale.item_remove || "Remove" },
    { action: "set", icon: "equals", label: locale.item_set_count || "Set count" }
  ]

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-line">
        <Input icon="search" className="w-[18rem]" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={locale.item_search || "Search items..."} />
        <span className="text-xs text-fg-faint">{inventory.systemName}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <IconButton icon="refresh" label={locale.inventory_refresh || "Refresh"} onClick={refresh} />
          <Button size="sm" variant="primary" icon="plus" onClick={() => setModal({ action: "add" })}>
            {locale.item_add || "Add Item"}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {items.length === 0 ? (
          <EmptyState icon="box" title={search ? locale.no_results || "No results found" : locale.inventory_empty || "Player inventory is empty"} />
        ) : (
          items.map((item, index) => (
            <div key={`${item.name}-${item.slot ?? index}`} className="flex items-center gap-3 h-12 px-5 border-b border-line hover:bg-hover">
              <ItemImage src={item.image} alt={item.label} />
              <span className="flex-1 min-w-0 flex flex-col">
                <span className="truncate text-base text-fg">{item.label}</span>
                <span className="truncate font-mono text-xs text-fg-faint">{item.name}</span>
              </span>
              {item.metadata && Object.keys(item.metadata).length > 0 && (
                // First metadata pair is usually the identifying one (serial, number, name)
                <span className="max-w-[16rem] truncate font-mono text-xs text-fg-subtle" title={JSON.stringify(item.metadata, null, 2)}>
                  {Object.entries(item.metadata).slice(0, 2).map(([key, value]) => `${key}: ${typeof value === "object" ? "…" : String(value)}`).join("  ")}
                </span>
              )}
              {item.slot !== undefined && <span className="w-14 text-xs text-fg-faint tabular-nums">{locale.item_slot || "Slot"} {item.slot}</span>}
              <span className="w-16 text-right text-md font-semibold tabular-nums text-fg">{item.count.toLocaleString()}</span>
              <span className="flex items-center gap-0.5 ml-2">
                {rowActions.map((entry) => (
                  <IconButton key={entry.action} icon={entry.icon} label={entry.label} size="sm" onClick={() => setModal({ action: entry.action, item })} />
                ))}
                {inventory.supportsMetadata && item.slot !== undefined && (
                  <IconButton icon="braces" label={locale.item_edit_metadata || "Edit metadata"} size="sm" onClick={() => setModal({ action: "metadata", item })} />
                )}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center h-8 px-5 border-t border-line text-xs text-fg-faint tabular-nums shrink-0">
        {items.length} / {inventory.items.length} {locale.inventory_items || "Items"}
      </div>

      {modal && (
        <ItemActionModal
          key={`${modal.action}-${modal.item?.name ?? "new"}-${modal.item?.slot ?? 0}`}
          onClose={() => setModal(null)}
          reportId={reportId}
          item={modal.item}
          action={modal.action}
          itemList={inventory.itemList}
        />
      )}
    </div>
  )
}
