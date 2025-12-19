"use client"

import { useState, useEffect, useRef } from "react"
import type { Report } from "@/types"
import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"
import { Button, Input } from "@/components/ui"
import { formatTimestamp, cn } from "@/lib/utils"

interface ReportChatProps {
  report: Report
}

export function ReportChat({ report }: ReportChatProps) {
  const { locale } = useReportStore()
  const { sendMessage, getMessages, takeScreenshot } = useNuiActions()

  const [message, setMessage] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messages = report.messages || []
  const messagesLength = messages.length

  // Always fetch messages when report changes to get latest data
  useEffect(() => {
    getMessages(report.id)
  }, [report.id, getMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messagesLength])

  const handleSend = () => {
    if (!message.trim()) return
    sendMessage(report.id, message.trim())
    setMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isUserMessage = (senderType: string) => senderType === "player"
  const isSystemMessage = (senderType: string) => senderType === "system"

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Messages */}
      <div className="flex-1 flex flex-col overflow-y-auto px-6 py-4 gap-3 min-h-0">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-text-muted py-8">
            {locale.no_messages || "No messages yet"}
          </p>
        ) : (
          messages.map((msg) => (
            isSystemMessage(msg.senderType) ? (
              <div key={msg.id} className="flex flex-col items-center w-full py-1 gap-2">
                <span className="text-xs text-text-tertiary italic px-3 py-1 bg-bg-elevated/50 rounded-full">
                  {msg.message}
                  <span className="ml-2 text-text-muted">·</span>
                  <span className="ml-1 text-text-muted">{formatTimestamp(msg.createdAt)}</span>
                </span>
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="Screenshot"
                    className="max-w-[300px] max-h-[200px] rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity object-contain"
                    onClick={() => setSelectedImage(msg.imageUrl!)}
                  />
                )}
              </div>
            ) : (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[80%]",
                  isUserMessage(msg.senderType) ? "self-end items-end" : "self-start items-start"
                )}
              >
                <div
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm",
                    isUserMessage(msg.senderType)
                      ? "bg-accent text-white rounded-br-sm"
                      : "bg-success/10 border border-success/20 text-text-primary rounded-bl-sm"
                  )}
                >
                  {msg.message}
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="Screenshot"
                      className="max-w-full max-h-[200px] rounded mt-2 cursor-pointer hover:opacity-90 transition-opacity object-contain"
                      onClick={() => setSelectedImage(msg.imageUrl!)}
                    />
                  )}
                </div>
                <span className="text-[10px] xl:text-xs text-text-tertiary mt-1 flex items-center gap-1">
                  {msg.senderName}
                  {msg.senderType === "admin" && (
                    <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                  <span>·</span>
                  {formatTimestamp(msg.createdAt)}
                </span>
              </div>
            )
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {report.status !== "resolved" && (
        <div className="flex items-stretch gap-2 px-6 py-3 border-t border-border bg-bg-secondary shrink-0">
          <Input
            type="text"
            placeholder={locale.type_message || "Type a message..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 py-2"
          />
          <Button
            variant="secondary"
            onClick={() => takeScreenshot(report.id)}
            className="h-auto px-3"
            title={locale.take_screenshot || "Take Screenshot"}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Button>
          <Button variant="primary" onClick={handleSend} disabled={!message.trim()} className="h-auto px-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Screenshot"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-bg-card border border-border rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
