/**
 * Generate a short unique ID (toasts)
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * Class name builder
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ")
}
