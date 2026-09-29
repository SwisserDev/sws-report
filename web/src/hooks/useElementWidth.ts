"use client"

import { useLayoutEffect, useRef, useState } from "react"

/** Charts draw in real pixels, so they need to know how wide they are */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    const update = () => setWidth(element.clientWidth)
    update()

    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { ref, width }
}
