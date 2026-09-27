"use client"

import { useState } from "react"
import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"
import { Button, Icon, Input, Label, Modal, Textarea, type IconName } from "@/components/ui"
import { cn } from "@/lib/utils"

const SUBJECT_MAX = 128
const DESCRIPTION_MAX = 2000

// Config uses FontAwesome names, the UI ships its own icon set
const CATEGORY_ICONS: Record<string, IconName> = {
  "fa-circle-info": "info",
  "fa-info": "info",
  "fa-bug": "bug",
  "fa-user": "user",
  "fa-users": "user",
  "fa-question": "question",
  "fa-circle-question": "question",
  "fa-ellipsis": "dots",
  "fa-car": "pin",
  "fa-money-bill": "box"
}

export function ReportCreate() {
  const { isCreatingReport, setIsCreatingReport, categories, locale } = useReportStore()
  const { createReport } = useNuiActions()

  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")

  const close = () => {
    setSubject("")
    setCategory("")
    setDescription("")
    setIsCreatingReport(false)
  }

  const canSubmit = subject.trim() !== "" && category !== ""

  const submit = () => {
    if (!canSubmit) return
    createReport({ subject: subject.trim(), category, description: description.trim() || undefined })
    close()
  }

  return (
    <Modal
      isOpen={isCreatingReport}
      onClose={close}
      title={locale.create_report || "Create Report"}
      description={locale.create_report_hint || "Staff get notified right away and answer you in the report chat."}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={close}>{locale.cancel || "Cancel"}</Button>
          <Button variant="primary" icon="send" onClick={submit} disabled={!canSubmit}>
            {locale.submit || "Submit"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <Label htmlFor="report-subject">{locale.report_subject || "Subject"}</Label>
          <Input
            id="report-subject"
            autoFocus
            value={subject}
            maxLength={SUBJECT_MAX}
            placeholder={locale.report_subject_placeholder || "Brief summary of your issue"}
            onChange={(event) => setSubject(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && submit()}
          />
        </div>

        <div role="radiogroup" aria-label={locale.report_category || "Category"}>
          <span className="block mb-1.5 text-sm font-medium text-fg-muted">{locale.report_category || "Category"}</span>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((option) => {
              const selected = option.id === category
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setCategory(option.id)}
                  className={cn(
                    "flex items-center gap-2.5 h-10 px-3 rounded-md border text-left text-base transition-colors duration-100",
                    selected
                      ? "border-accent-fg bg-accent-soft text-fg"
                      : "border-line-strong bg-raised text-fg-muted hover:border-line-focus hover:text-fg"
                  )}
                >
                  <Icon name={CATEGORY_ICONS[option.icon] ?? "tag"} className={selected ? "text-accent-fg" : "text-fg-subtle"} />
                  <span className="flex-1 truncate">{locale[`category_${option.id}`] || option.label}</span>
                  <span
                    className={cn(
                      "w-3.5 h-3.5 rounded-full border-[1.5px] shrink-0",
                      selected ? "border-accent-fg bg-accent-fg shadow-[inset_0_0_0_2px_var(--color-accent-soft)]" : "border-line-focus"
                    )}
                  />
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <Label htmlFor="report-description">{locale.report_description || "Description"}</Label>
            <span className="text-xs tabular-nums text-fg-faint">{description.length} / {DESCRIPTION_MAX}</span>
          </div>
          <Textarea
            id="report-description"
            rows={5}
            value={description}
            maxLength={DESCRIPTION_MAX}
            placeholder={locale.report_description_placeholder || "Provide more details about your issue..."}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
      </div>
    </Modal>
  )
}
