"use client"

import { useLayoutEffect, useRef, useState } from "react"

/**
 * Switches a toolbar to its compact form when the full one would overflow.
 * No container queries in CEF 103, so this measures with a ResizeObserver.
 */
export function useCompactFit<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null)
  const [compact, setCompact] = useState(false)
  const fullWidth = useRef(0)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    const measure = () => {
      if (!compact) {
        fullWidth.current = element.scrollWidth
        if (element.scrollWidth > element.clientWidth + 1) setCompact(true)
      } else if (fullWidth.current && element.clientWidth >= fullWidth.current) {
        setCompact(false)
      }
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact, ...deps])

  return { ref, compact }
}
