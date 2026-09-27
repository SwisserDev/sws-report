"use client"

import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { Icon, type IconName } from "./Icon"

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "subtle"
type ButtonSize = "sm" | "md"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: IconName
  /** Colors only the icon, e.g. a red icon on a neutral kick button */
  iconClassName?: string
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-fg-on-accent border-accent hover:bg-accent-hover hover:border-accent-hover",
  secondary: "bg-raised text-fg border-line-strong hover:bg-hover hover:border-line-focus",
  ghost: "bg-transparent text-fg-muted border-transparent hover:bg-hover hover:text-fg",
  subtle: "bg-transparent text-fg-muted border-line-strong hover:bg-hover hover:text-fg",
  // Solid red only on the final confirmation of something irreversible
  danger: "bg-red text-white border-red hover:bg-red-fg hover:border-red-fg hover:text-canvas"
}

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-2.5 gap-1.5 text-sm",
  md: "h-9 px-3.5 gap-2 text-base"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", icon, iconClassName, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md border font-medium",
        "transition-colors duration-100 disabled:opacity-45 disabled:pointer-events-none",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {icon && <Icon name={icon} className={iconClassName} />}
      {children}
    </button>
  )
)

Button.displayName = "Button"

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName
  label: string
  size?: ButtonSize
  active?: boolean
}

/** Icon-only button, the label doubles as tooltip and accessible name */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, size = "md", active, className, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-transparent text-fg-muted",
        "transition-colors duration-100 hover:bg-hover hover:text-fg disabled:opacity-45 disabled:pointer-events-none",
        active && "bg-active text-fg",
        size === "sm" ? "w-8 h-8" : "w-9 h-9",
        className
      )}
      {...props}
    >
      <Icon name={icon} className={size === "sm" ? "w-4 h-4" : "w-[1.125rem] h-[1.125rem]"} />
    </button>
  )
)

IconButton.displayName = "IconButton"
