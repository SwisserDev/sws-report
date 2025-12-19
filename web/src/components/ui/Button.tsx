"use client"

import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type ButtonVariant = "default" | "primary" | "secondary" | "success" | "danger" | "ghost"
type ButtonSize = "default" | "sm" | "lg" | "icon"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantStyles: Record<ButtonVariant, string> = {
  default: "bg-bg-card border-border text-text-primary hover:bg-bg-elevated hover:border-border-hover",
  primary: "bg-accent text-white border-accent hover:bg-accent-hover",
  secondary: "bg-bg-tertiary border-border text-text-secondary hover:bg-bg-elevated hover:text-text-primary hover:border-border-hover",
  success: "bg-success-bg text-success border-success-border hover:bg-success/20",
  danger: "bg-error-bg text-error border-error-border hover:bg-error/20",
  ghost: "bg-transparent border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
}

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-10 px-4 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-12 px-6 text-base",
  icon: "h-9 w-9 p-0"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-accent/20",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
