"use client"

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const baseInputStyles = cn(
  "w-full rounded-md border border-border bg-bg-card px-4 py-3",
  "text-sm text-text-primary placeholder:text-text-muted",
  "transition-all duration-200",
  "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15",
  "disabled:opacity-50 disabled:cursor-not-allowed"
)

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(baseInputStyles, className)}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(baseInputStyles, "min-h-[120px] resize-y", className)}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea"

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          baseInputStyles,
          "cursor-pointer appearance-none pr-10",
          "bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239ca3af%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat",
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)

Select.displayName = "Select"

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn("text-sm font-medium text-text-primary", className)}
        {...props}
      />
    )
  }
)

Label.displayName = "Label"
