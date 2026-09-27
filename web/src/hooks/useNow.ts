"use client"

import { useEffect, useState } from "react"

/** Re-render on an interval so relative times ("5m") don't go stale */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])

  return now
}
