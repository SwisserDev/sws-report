"use client"

import { useEffect, useRef } from "react"

interface EscapeLayer {
  priority: number
  handler: () => void
}

// One shared listener so only the topmost overlay reacts to Escape
const layers: EscapeLayer[] = []
let listenerInstalled = false

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key !== "Escape" || layers.length === 0) return

  let top = layers[0]
  for (const layer of layers) {
    // Later registrations win ties, they were opened on top
    if (layer.priority >= top.priority) top = layer
  }

  event.preventDefault()
  top.handler()
}

/**
 * Close something on Escape, but only if nothing above it is open.
 * The main window uses priority 0, overlays default to 1, nested overlays go higher.
 */
export function useEscapeLayer(onEscape: () => void, active = true, priority = 1) {
  const handlerRef = useRef(onEscape)

  useEffect(() => {
    handlerRef.current = onEscape
  })

  useEffect(() => {
    if (!active) return

    if (!listenerInstalled) {
      document.addEventListener("keydown", handleKeyDown)
      listenerInstalled = true
    }

    const layer: EscapeLayer = { priority, handler: () => handlerRef.current() }
    layers.push(layer)

    return () => {
      const index = layers.indexOf(layer)
      if (index !== -1) layers.splice(index, 1)
    }
  }, [active, priority])
}
