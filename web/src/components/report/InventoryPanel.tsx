/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useState } from "react"
import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"
import { Button } from "@/components/ui"
import type { InventoryItem, InventoryItemInfo } from "@/types"

interface InventoryPanelProps {
  reportId: number
  isPlayerOnline?: boolean
}

interface ItemActionModalProps {
  isOpen: boolean
  onClose: () => void
  reportId: number
  item?: InventoryItem
  action: "add" | "remove" | "set" | "metadata"
  itemList: Record<string, InventoryItemInfo>
}

function ItemActionModal({ isOpen, onClose, reportId, item, action, itemList }: ItemActionModalProps) {
  const { locale } = useReportStore()
  const { addInventoryItem, removeInventoryItem, setInventoryItemCount, setInventoryItemMetadata } = useNuiActions()

  const [selectedItem, setSelectedItem] = useState(item?.name || "")
  const [count, setCount] = useState(item?.count || 1)
  const [metadata, setMetadata] = useState(item?.metadata ? JSON.stringify(item.metadata, null, 2) : "{}")
  const [searchTerm, setSearchTerm] = useState("")

  if (!isOpen) return null

  const filteredItems = Object.entries(itemList).filter(([name, info]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    info.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = () => {
    if (!selectedItem && action !== "metadata") return

    switch (action) {
      case "add":
        try {
          const meta = metadata !== "{}" ? JSON.parse(metadata) : undefined
          addInventoryItem(reportId, selectedItem, count, meta)
        } catch {
          addInventoryItem(reportId, selectedItem, count)
        }
        break
      case "remove":
        removeInventoryItem(reportId, selectedItem, count, item?.slot)
        break
      case "set":
        setInventoryItemCount(reportId, selectedItem, count)
        break
      case "metadata":
        if (item?.slot) {
          try {
            const meta = JSON.parse(metadata)
            setInventoryItemMetadata(reportId, item.slot, meta)
          } catch {
            return
          }
        }
        break
    }
    onClose()
  }

  const getTitle = () => {
    switch (action) {
      case "add": return locale.item_add || "Add Item"
      case "remove": return locale.item_remove || "Remove Item"
      case "set": return locale.item_set_count || "Set Count"
      case "metadata": return locale.item_edit_metadata || "Edit Metadata"
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-bg-secondary border border-border rounded-lg p-6 w-[400px] max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-text-primary mb-4">{getTitle()}</h3>

        {action !== "metadata" && (
          <>
            {/* Item Selection */}
            {!item && (
              <div className="mb-4">
                <label className="block text-sm text-text-secondary mb-2">
                  {locale.item_select || "Select Item"}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-text-primary text-sm mb-2"
                  placeholder={locale.item_search || "Search items..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="max-h-40 overflow-y-auto bg-bg-tertiary border border-border rounded-lg">
                  {filteredItems.slice(0, 50).map(([name, info]) => (
                    <button
                      key={name}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-bg-secondary transition-colors flex items-center gap-2 ${
                        selectedItem === name ? "bg-accent/20 text-accent" : "text-text-primary"
                      }`}
                      onClick={() => setSelectedItem(name)}
                    >
                      {info.image && (
                        <img
                          src={info.image}
                          alt={info.label}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none"
                          }}
                        />
                      )}
                      <span className="font-medium">{info.label}</span>
                      <span className="text-text-tertiary ml-auto">({name})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Item Display */}
            {(item || selectedItem) && (
              <div className="mb-4 p-2 bg-bg-tertiary rounded-lg flex items-center gap-2">
                {(item?.image || itemList[selectedItem]?.image) && (
                  <img
                    src={item?.image || itemList[selectedItem]?.image}
                    alt={item?.label || itemList[selectedItem]?.label || selectedItem}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                )}
                <span className="text-text-primary text-sm">
                  {item?.label || itemList[selectedItem]?.label || selectedItem}
                </span>
              </div>
            )}

            {/* Count Input */}
            <div className="mb-4">
              <label className="block text-sm text-text-secondary mb-2">
                {locale.item_count || "Count"}
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-text-primary text-sm"
                value={count}
                onChange={(e) => setCount(Math.max(action === "set" ? 0 : 1, parseInt(e.target.value) || 0))}
                min={action === "set" ? 0 : 1}
                max={1000}
              />
            </div>

            {/* Metadata for Add */}
            {action === "add" && (
              <div className="mb-4">
                <label className="block text-sm text-text-secondary mb-2">
                  {locale.item_metadata || "Metadata"} (JSON, optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-text-primary text-sm font-mono h-24"
                  value={metadata}
                  onChange={(e) => setMetadata(e.target.value)}
                  placeholder="{}"
                />
              </div>
            )}
          </>
        )}

        {/* Metadata Editor */}
        {action === "metadata" && (
          <div className="mb-4">
            <label className="block text-sm text-text-secondary mb-2">
              {locale.item_metadata || "Metadata"} (JSON)
            </label>
            <textarea
              className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-text-primary text-sm font-mono h-48"
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {locale.cancel || "Cancel"}
          </Button>
          <Button
            variant={action === "remove" ? "danger" : "primary"}
            size="sm"
            onClick={handleSubmit}
            disabled={!selectedItem && action !== "metadata"}
          >
            {locale.confirm || "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function InventoryPanel({ reportId, isPlayerOnline }: InventoryPanelProps) {
  const { locale, getInventory, setInventoryLoading } = useReportStore()
  const { getPlayerInventory } = useNuiActions()

  const [modalState, setModalState] = useState<{
    isOpen: boolean
    action: "add" | "remove" | "set" | "metadata"
    item?: InventoryItem
  }>({ isOpen: false, action: "add" })

  const [searchTerm, setSearchTerm] = useState("")

  const inventory = getInventory(reportId)

  useEffect(() => {
    if (isPlayerOnline && !inventory) {
      setInventoryLoading(reportId, true)
      getPlayerInventory(reportId)
    }
  }, [reportId, isPlayerOnline, inventory, getPlayerInventory, setInventoryLoading])

  const handleRefresh = () => {
    setInventoryLoading(reportId, true)
    getPlayerInventory(reportId)
  }

  const openModal = (action: "add" | "remove" | "set" | "metadata", item?: InventoryItem) => {
    setModalState({ isOpen: true, action, item })
  }

  const closeModal = () => {
    setModalState({ isOpen: false, action: "add" })
  }

  const filteredItems = inventory?.items?.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (!isPlayerOnline) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-text-tertiary p-6">
        <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-sm">{locale.inventory_player_offline || "Cannot view inventory - player is offline"}</p>
      </div>
    )
  }

  if (inventory?.loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-text-tertiary p-6">
        <svg className="w-8 h-8 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm">{locale.inventory_loading || "Loading inventory..."}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-text-primary">
            {locale.inventory || "Inventory"}
          </h3>
          {inventory?.systemName && (
            <span className="text-xs text-text-tertiary px-2 py-0.5 bg-bg-tertiary rounded">
              {inventory.systemName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
          <Button variant="primary" size="sm" onClick={() => openModal("add")}>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {locale.item_add || "Add"}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-border">
        <input
          type="text"
          className="w-full px-3 py-1.5 bg-bg-tertiary border border-border rounded text-text-primary text-sm"
          placeholder={locale.item_search || "Search items..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Item Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-tertiary">
            <svg className="w-10 h-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-sm">{locale.inventory_empty || "Player inventory is empty"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filteredItems.map((item, idx) => (
              <div
                key={`${item.name}-${item.slot || idx}`}
                className="bg-bg-tertiary border border-border rounded-lg p-3 hover:border-accent/50 transition-colors group"
              >
                <div className="flex gap-2 mb-2">
                  {/* Item Image */}
                  {item.image && (
                    <div className="w-10 h-10 flex-shrink-0 bg-bg-secondary rounded overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.label}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex justify-between items-start">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{item.label}</p>
                      <p className="text-xs text-text-tertiary truncate">{item.name}</p>
                    </div>
                    <span className="text-sm font-bold text-accent ml-2">x{item.count}</span>
                  </div>
                </div>

                {/* Item Details */}
                <div className="text-xs text-text-tertiary space-y-0.5 mb-2">
                  {item.slot && <p>Slot: {item.slot}</p>}
                  {item.weight && <p>Weight: {item.weight}</p>}
                  {item.metadata && Object.keys(item.metadata).length > 0 && (
                    <p className="text-accent">Has metadata</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="flex-1 px-2 py-1 text-xs bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded transition-colors"
                    onClick={() => openModal("add", item)}
                    title={locale.item_add || "Add"}
                  >
                    +
                  </button>
                  <button
                    className="flex-1 px-2 py-1 text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded transition-colors"
                    onClick={() => openModal("remove", item)}
                    title={locale.item_remove || "Remove"}
                  >
                    -
                  </button>
                  <button
                    className="flex-1 px-2 py-1 text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded transition-colors"
                    onClick={() => openModal("set", item)}
                    title={locale.item_set_count || "Set"}
                  >
                    =
                  </button>
                  {inventory?.supportsMetadata && item.slot && (
                    <button
                      className="flex-1 px-2 py-1 text-xs bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 rounded transition-colors"
                      onClick={() => openModal("metadata", item)}
                      title={locale.item_edit_metadata || "Metadata"}
                    >
                      {"{ }"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Count */}
      <div className="px-4 py-2 border-t border-border text-xs text-text-tertiary">
        {filteredItems.length} {locale.inventory_items || "items"}
        {inventory?.items && filteredItems.length !== inventory.items.length && (
          <span> ({locale.filter || "filtered"}: {inventory.items.length} total)</span>
        )}
      </div>

      {/* Modal */}
      {modalState.isOpen && (
        <ItemActionModal
          key={`${modalState.action}-${modalState.item?.name || "new"}-${modalState.item?.slot || 0}`}
          isOpen={modalState.isOpen}
          onClose={closeModal}
          reportId={reportId}
          item={modalState.item}
          action={modalState.action}
          itemList={inventory?.itemList || {}}
        />
      )}
    </div>
  )
}
