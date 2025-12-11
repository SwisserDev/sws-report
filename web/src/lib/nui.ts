/**
 * Check if running inside FiveM NUI
 */
export const isEnvBrowser = (): boolean => {
  return !(window as Window & { invokeNative?: unknown }).invokeNative
}

/**
 * Get the resource name from the URL or fallback
 */
const getResourceName = (): string => {
  if (isEnvBrowser()) return "sws-report"
  return (window as Window & { GetParentResourceName?: () => string }).GetParentResourceName?.() || "sws-report"
}

/**
 * Send a callback to the Lua client
 */
export const fetchNui = async <T = unknown>(
  eventName: string,
  data?: Record<string, unknown>
): Promise<T> => {
  if (isEnvBrowser()) {
    console.log(`[NUI] ${eventName}`, data)
    return {} as T
  }

  const resourceName = getResourceName()

  const response = await fetch(`https://${resourceName}/${eventName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(data || {})
  })

  return response.json()
}

/**
 * Subscribe to NUI messages from Lua
 */
export const onNuiEvent = <T = unknown>(
  eventType: string,
  callback: (data: T) => void
): (() => void) => {
  const handler = (event: MessageEvent) => {
    const { type, data } = event.data
    if (type === eventType) {
      callback(data as T)
    }
  }

  window.addEventListener("message", handler)

  return () => {
    window.removeEventListener("message", handler)
  }
}

/**
 * Register a global NUI message listener
 */
export const registerNuiListener = (
  callback: (type: string, data: unknown) => void
): (() => void) => {
  const handler = (event: MessageEvent) => {
    const { type, data } = event.data
    if (type) {
      callback(type, data)
    }
  }

  window.addEventListener("message", handler)

  return () => {
    window.removeEventListener("message", handler)
  }
}

/**
 * Play a sound file
 */
export const playSound = (soundFile: string, volume: number = 0.5): void => {
  if (isEnvBrowser()) {
    console.log(`[NUI] Playing sound: ${soundFile} at volume ${volume}`)
    return
  }

  const audio = new Audio(`./sounds/${soundFile}`)
  audio.volume = volume
  audio.play().catch(console.error)
}
