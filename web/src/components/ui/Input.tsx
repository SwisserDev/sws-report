"use client"

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { Icon, type IconName } from "./Icon"

const FIELD = cn(
  "w-full rounded-md border border-line-strong bg-raised text-base text-fg placeholder:text-fg-faint",
  "transition-colors duration-100 hover:border-line-focus",
  "focus:outline-none focus:border-accent-fg disabled:opacity-50"
)

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: IconName
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, icon, ...props }, ref) => {
  if (!icon) {
    return <input ref={ref} className={cn(FIELD, "h-9 px-3", className)} {...props} />
  }

  return (
    <div className={cn("relative", className)}>
      <Icon name={icon} className="absolute left-2.5 top-1/2 -mt-2 text-fg-faint pointer-events-none" />
      <input ref={ref} className={cn(FIELD, "h-9 pl-8 pr-3")} {...props} />
    </div>
  )
})

Input.displayName = "Input"

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(FIELD, "px-3 py-2 resize-none leading-relaxed", className)} {...props} />
  )
)

Textarea.displayName = "Textarea"

// Native select keeps keyboard and CEF dropdown behaviour; the arrow is drawn by us
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className={cn("relative", className)}>
      <select ref={ref} className={cn(FIELD, "h-9 pl-3 pr-8 appearance-none cursor-pointer")} {...props}>
        {children}
      </select>
      <Icon name="chevronDown" className="absolute right-2.5 top-1/2 -mt-2 text-fg-subtle pointer-events-none" />
    </div>
  )
)

Select.displayName = "Select"

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("block mb-1.5 text-sm font-medium text-fg-muted", className)} {...props} />
}
