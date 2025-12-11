"use client"

import { useState } from "react"
import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"
import { Modal, Button, Input, Textarea, Select, Label } from "@/components/ui"

export function ReportCreate() {
  const { isCreatingReport, setIsCreatingReport, categories, locale } = useReportStore()
  const { createReport } = useNuiActions()

  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!subject.trim() || !category) return

    setIsSubmitting(true)

    createReport({
      subject: subject.trim(),
      category,
      description: description.trim() || undefined
    })

    handleClose()
  }

  const handleClose = () => {
    setSubject("")
    setCategory("")
    setDescription("")
    setIsSubmitting(false)
    setIsCreatingReport(false)
  }

  return (
    <Modal
      isOpen={isCreatingReport}
      onClose={handleClose}
      title={locale.create_report || "Create Report"}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            {locale.cancel || "Cancel"}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!subject.trim() || !category || isSubmitting}
          >
            {locale.submit || "Submit"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject">{locale.report_subject || "Subject"}</Label>
          <Input
            id="subject"
            type="text"
            placeholder={locale.report_subject_placeholder || "Brief summary of your issue"}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={128}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">{locale.report_category || "Category"}</Label>
          <Select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">{locale.report_category_placeholder || "Select a category"}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{locale.report_description || "Description"}</Label>
          <Textarea
            id="description"
            placeholder={locale.report_description_placeholder || "Provide more details about your issue..."}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={5}
          />
        </div>
      </div>
    </Modal>
  )
}
