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
  const { sendMessage, getMessages } = useNuiActions()

  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messages = report.messages || []
  const messagesLength = messages.length

  useEffect(() => {
    if (messagesLength === 0) {
      getMessages(report.id)
    }
  }, [report.id, messagesLength, getMessages])

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
              <div key={msg.id} className="flex justify-center w-full py-1">
                <span className="text-xs text-text-tertiary italic px-3 py-1 bg-bg-elevated/50 rounded-full">
                  {msg.message}
                  <span className="ml-2 text-text-muted">·</span>
                  <span className="ml-1 text-text-muted">{formatTimestamp(msg.createdAt)}</span>
                </span>
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
          <Button variant="primary" onClick={handleSend} disabled={!message.trim()} className="h-auto px-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  )
}
