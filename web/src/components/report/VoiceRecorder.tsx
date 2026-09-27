"use client"

import { useCallback, useEffect, useState } from "react"
import { Button, IconButton, Spinner } from "@/components/ui"
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder"
import { cn } from "@/lib/utils"

interface VoiceRecorderProps {
  onSend: (audioData: string, duration: number) => void
  maxDuration?: number
  disabled?: boolean
  locale: Record<string, string>
  /** Lets the composer hide the text input while recording */
  onRecordingChange?: (recording: boolean) => void
}

const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`

export function VoiceRecorder({ onSend, maxDuration = 60, disabled = false, locale, onRecordingChange }: VoiceRecorderProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleRecordingComplete = useCallback((audioBlob: Blob, duration: number) => {
    setIsProcessing(true)

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1]
      onSend(base64, duration)
      setIsProcessing(false)
    }
    reader.onerror = () => setIsProcessing(false)
    reader.readAsDataURL(audioBlob)
  }, [onSend])

  const { isRecording, isPaused, duration, error, startRecording, stopRecording, pauseRecording, resumeRecording, cancelRecording } =
    useVoiceRecorder({ maxDuration, onRecordingComplete: handleRecordingComplete })

  const active = isRecording || isPaused

  useEffect(() => {
    onRecordingChange?.(active)
  }, [active, onRecordingChange])

  if (active) {
    return (
      <div className="flex-1 flex items-center gap-3 h-10 pl-3.5 pr-1 rounded-md border border-red-line bg-red-soft">
        <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", isPaused ? "bg-amber" : "bg-red")} />
        <span className="text-sm font-medium tabular-nums text-fg w-[5.5rem] shrink-0">
          {formatDuration(duration)} / {formatDuration(maxDuration)}
        </span>
        <div className="flex-1 h-1 rounded-full bg-line-strong overflow-hidden">
          <div className={cn("h-full", isPaused ? "bg-amber" : "bg-red")} style={{ width: `${Math.min(100, (duration / maxDuration) * 100)}%` }} />
        </div>
        <IconButton
          icon={isPaused ? "mic" : "pause"}
          label={isPaused ? locale.resume || "Resume" : locale.pause || "Pause"}
          size="sm"
          onClick={isPaused ? resumeRecording : pauseRecording}
        />
        <IconButton icon="close" label={locale.cancel || "Cancel"} size="sm" onClick={cancelRecording} />
        <Button size="sm" variant="primary" icon="send" onClick={stopRecording} disabled={duration < 0.5}>
          {locale.send_message || "Send"}
        </Button>
      </div>
    )
  }

  if (isProcessing) {
    return (
      <span className="flex items-center justify-center w-10 h-10 text-fg-subtle">
        <Spinner />
      </span>
    )
  }

  return (
    <IconButton
      icon="mic"
      label={error || locale.voice_message || "Voice message"}
      onClick={startRecording}
      disabled={disabled}
      className={cn("w-10 h-10", error && "text-red-fg")}
    />
  )
}
