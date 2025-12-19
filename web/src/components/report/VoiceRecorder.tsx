"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui"
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder"
import { cn } from "@/lib/utils"

interface VoiceRecorderProps {
  onSend: (audioData: string, duration: number) => void
  maxDuration?: number
  disabled?: boolean
  locale: Record<string, string>
}

/**
 * Voice recording component for sending voice messages
 */
export function VoiceRecorder({
  onSend,
  maxDuration = 60,
  disabled = false,
  locale
}: VoiceRecorderProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleRecordingComplete = useCallback(async (audioBlob: Blob, duration: number) => {
    setIsProcessing(true)

    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1]
        onSend(base64, duration)
        setIsProcessing(false)
      }
      reader.onerror = () => {
        console.error("Failed to convert audio to base64")
        setIsProcessing(false)
      }
      reader.readAsDataURL(audioBlob)
    } catch (err) {
      console.error("Error processing recording:", err)
      setIsProcessing(false)
    }
  }, [onSend])

  const {
    isRecording,
    isPaused,
    duration,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording
  } = useVoiceRecorder({
    maxDuration,
    onRecordingComplete: handleRecordingComplete
  })

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (isRecording || isPaused) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-bg-tertiary rounded-lg">
        <div className={cn(
          "w-3 h-3 rounded-full",
          isPaused ? "bg-warning" : "bg-error animate-pulse"
        )} />

        <span className="text-sm font-mono text-text-primary min-w-[5rem]">
          {formatDuration(duration)} / {formatDuration(maxDuration)}
        </span>

        <div className="flex-1 h-1 bg-bg-elevated rounded-full overflow-hidden min-w-[60px]">
          <div
            className={cn(
              "h-full transition-all",
              isPaused ? "bg-warning" : "bg-error"
            )}
            style={{ width: `${(duration / maxDuration) * 100}%` }}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={isPaused ? resumeRecording : pauseRecording}
          title={isPaused ? (locale.resume || "Resume") : (locale.pause || "Pause")}
          className="h-8 w-8"
        >
          {isPaused ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={cancelRecording}
          title={locale.cancel || "Cancel"}
          className="h-8 w-8 text-error hover:text-error"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>

        <Button
          variant="primary"
          size="icon"
          onClick={stopRecording}
          disabled={duration < 0.5}
          title={locale.send || "Send"}
          className="h-8 w-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={startRecording}
      disabled={disabled || isProcessing}
      title={error || locale.voice_message || "Voice message"}
      className={cn("h-auto px-2", error && "text-error")}
    >
      {isProcessing ? (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    </Button>
  )
}
