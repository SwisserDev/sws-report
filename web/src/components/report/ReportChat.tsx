/* eslint-disable @next/next/no-img-element */
"use client"

import { Fragment, useCallback, useEffect, useRef, useState } from "react"
import type { Message, Report } from "@/types"
import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"
import { useEscapeLayer } from "@/hooks/useEscapeLayer"
import { fetchNui } from "@/lib/nui"
import { Button, Icon, IconButton, EmptyState } from "@/components/ui"
import { formatDateTime, formatFullDate, parseTimestamp } from "@/lib/time"
import { cn } from "@/lib/utils"
import { VoiceRecorder } from "./VoiceRecorder"
import { AudioPlayer } from "./AudioPlayer"

// Messages from the same person within this window share one name/time header
const GROUP_WINDOW_MS = 5 * 60_000

const dayKey = (value: unknown) => parseTimestamp(value)?.toDateString() ?? ""

export function ReportChat({ report }: { report: Report }) {
  const { locale, activeTab, voiceMessagesEnabled, voiceMaxDuration, language } = useReportStore()
  const { sendMessage, getMessages, takeScreenshot } = useNuiActions()

  const [message, setMessage] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const isStaffView = activeTab === "admin"
  const messages = report.messages || []
  const isResolved = report.status === "resolved"

  useEscapeLayer(() => setSelectedImage(null), selectedImage !== null)

  // Always fetch messages when report changes to get latest data
  useEffect(() => {
    getMessages(report.id)
  }, [report.id, getMessages])

  useEffect(() => {
    const element = scrollRef.current
    if (element) element.scrollTop = element.scrollHeight
  }, [messages.length, report.id])

  const handleSend = () => {
    if (!message.trim()) return
    sendMessage(report.id, message.trim())
    setMessage("")
  }

  const handleVoiceSend = useCallback((audioData: string, duration: number) => {
    fetchNui("sendVoiceMessage", { reportId: report.id, audioData, duration })
  }, [report.id])

  // Own side is on the right: staff in the admin panel, the reporter in "My reports"
  const isOwnSide = (msg: Message) => (isStaffView ? msg.senderType === "admin" : msg.senderType === "player")

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <EmptyState
            icon="chat"
            title={locale.no_messages || "No messages yet"}
            hint={
              isResolved
                ? undefined
                : isStaffView
                  ? locale.no_messages_staff_hint || "The player sees your message right away."
                  : locale.no_messages_player_hint || "Staff will answer here. You can add details or a screenshot meanwhile."
            }
          />
        ) : (
          <div className="flex flex-col">
            {messages.map((msg, index) => {
              const previous = messages[index - 1]
              const newDay = !previous || dayKey(previous.createdAt) !== dayKey(msg.createdAt)
              const grouped =
                !newDay &&
                previous &&
                previous.senderType !== "system" &&
                previous.senderId === msg.senderId &&
                (parseTimestamp(msg.createdAt)?.getTime() ?? 0) - (parseTimestamp(previous.createdAt)?.getTime() ?? 0) < GROUP_WINDOW_MS

              return (
                <Fragment key={msg.id}>
                  {newDay && (
                    <div className="flex items-center gap-3 my-3 text-xs text-fg-faint">
                      <span className="flex-1 h-px bg-line" />
                      {parseTimestamp(msg.createdAt)?.toLocaleDateString(language, { weekday: "long", day: "numeric", month: "long" })}
                      <span className="flex-1 h-px bg-line" />
                    </div>
                  )}
                  {msg.senderType === "system" ? (
                    <SystemEvent message={msg} language={language} onImage={setSelectedImage} />
                  ) : (
                    <ChatMessage
                      message={msg}
                      own={isOwnSide(msg)}
                      showHeader={!grouped}
                      language={language}
                      staffLabel={locale.staff || "Staff"}
                      onImage={setSelectedImage}
                    />
                  )}
                </Fragment>
              )
            })}
          </div>
        )}
      </div>

      {isResolved ? (
        <div className="flex items-center justify-center gap-2 h-12 px-5 border-t border-line bg-panel text-sm text-fg-subtle shrink-0">
          <Icon name="check" className="text-green-fg" />
          {locale.report_closed_hint || "This report is resolved, the conversation is closed."}
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-3 border-t border-line bg-panel shrink-0">
          {!recording && (
            <input
              type="text"
              value={message}
              maxLength={1000}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  handleSend()
                }
              }}
              placeholder={
                isStaffView
                  ? (locale.message_to_player || "Message to %s").replace("%s", report.playerName)
                  : locale.type_message || "Type a message..."
              }
              className="flex-1 min-w-0 h-10 px-3.5 rounded-md border border-line-strong bg-raised text-base text-fg placeholder:text-fg-faint hover:border-line-focus focus:outline-none focus:border-accent-fg"
            />
          )}
          {!recording && (
            <IconButton
              icon="camera"
              label={locale.take_screenshot || "Take Screenshot"}
              onClick={() => takeScreenshot(report.id)}
              className="w-10 h-10"
            />
          )}
          {voiceMessagesEnabled && (
            <VoiceRecorder
              onSend={handleVoiceSend}
              maxDuration={voiceMaxDuration}
              locale={locale}
              onRecordingChange={setRecording}
            />
          )}
          {!recording && (
            <Button variant="primary" icon="send" onClick={handleSend} disabled={!message.trim()} className="h-10">
              {locale.send_message || "Send"}
            </Button>
          )}
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim anim-fade" onClick={() => setSelectedImage(null)}>
          <div className="relative" onClick={(event) => event.stopPropagation()}>
            <img src={selectedImage} alt="" className="max-w-[86vw] max-h-[84vh] rounded-lg border border-line-strong" />
            <div className="absolute top-2 right-2 flex gap-1 p-1 rounded-md bg-panel border border-line-strong">
              <IconButton icon="close" label={locale.close || "Close"} size="sm" onClick={() => setSelectedImage(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ChatMessageProps {
  message: Message
  own: boolean
  showHeader: boolean
  language: string
  staffLabel: string
  onImage: (url: string) => void
}

function ChatMessage({ message, own, showHeader, language, staffLabel, onImage }: ChatMessageProps) {
  const isVoice = message.messageType === "voice" && message.audioUrl

  return (
    <div className={cn("flex flex-col max-w-[72%]", own ? "self-end items-end" : "self-start items-start", showHeader ? "mt-3" : "mt-1")}>
      {showHeader && (
        <div className="flex items-center gap-1.5 mb-1 px-0.5 text-xs">
          <span className="font-medium text-fg-muted">{message.senderName}</span>
          {message.senderType === "admin" && (
            <span className="inline-flex items-center gap-0.5 text-accent-fg" title={staffLabel}>
              <Icon name="shield" className="w-3 h-3" strokeWidth={2} />
            </span>
          )}
          <span className="text-fg-faint" title={formatFullDate(message.createdAt, language)}>
            {formatDateTime(message.createdAt, language)}
          </span>
        </div>
      )}

      {(message.message || isVoice) && (
        <div
          className={cn(
            "px-3 py-2 rounded-lg border text-base leading-relaxed prewrap",
            own ? "bg-accent-soft border-accent-line text-fg" : "bg-panel border-line-strong text-fg"
          )}
        >
          {isVoice ? <AudioPlayer src={message.audioUrl!} duration={message.audioDuration} /> : message.message}
        </div>
      )}

      {message.imageUrl && (
        <button type="button" onClick={() => onImage(message.imageUrl!)} className="mt-1 rounded-lg overflow-hidden border border-line-strong hover:border-line-focus">
          <img src={message.imageUrl} alt="" className="block max-w-[20rem] max-h-[12rem] object-cover" />
        </button>
      )}
    </div>
  )
}

function SystemEvent({ message, language, onImage }: { message: Message; language: string; onImage: (url: string) => void }) {
  return (
    <div className="flex flex-col items-center my-2.5">
      <div className="flex items-center gap-2 text-xs text-fg-subtle">
        <Icon name={message.imageUrl ? "camera" : "info"} className="w-3.5 h-3.5 text-fg-faint" />
        <span>{message.message}</span>
        <span className="text-fg-faint" title={formatFullDate(message.createdAt, language)}>
          {formatDateTime(message.createdAt, language)}
        </span>
      </div>
      {message.imageUrl && (
        <button type="button" onClick={() => onImage(message.imageUrl!)} className="mt-2 rounded-lg overflow-hidden border border-line-strong hover:border-line-focus">

          <img src={message.imageUrl} alt="" className="block max-w-[20rem] max-h-[12rem] object-cover" />
        </button>
      )}
    </div>
  )
}
