"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface UseVoiceRecorderOptions {
  maxDuration?: number
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void
}

interface UseVoiceRecorderReturn {
  isRecording: boolean
  isPaused: boolean
  duration: number
  error: string | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  cancelRecording: () => void
}

/**
 * Hook for managing voice recording functionality
 * @param options - Configuration options for the recorder
 * @returns Recording state and control functions
 */
export function useVoiceRecorder(options: UseVoiceRecorderOptions = {}): UseVoiceRecorderReturn {
  const { maxDuration = 60, onRecordingComplete } = options

  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedDurationRef = useRef<number>(0)
  const isPausedRef = useRef(false)
  const cancelledRef = useRef(false)

  const getElapsed = () =>
    pausedDurationRef.current + (isPausedRef.current ? 0 : (Date.now() - startTimeRef.current) / 1000)

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    mediaRecorderRef.current = null
    chunksRef.current = []
    setDuration(0)
    setIsPaused(false)
    pausedDurationRef.current = 0
    isPausedRef.current = false
  }, [])

  const startRecording = useCallback(async () => {
    setError(null)
    cleanup()
    cancelledRef.current = false

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4"

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType })
        const finalDuration = getElapsed()

        // stop() still flushes a final chunk after cancel, so a flag is the only reliable signal
        if (!cancelledRef.current && onRecordingComplete && audioBlob.size > 0 && chunksRef.current.length > 0) {
          onRecordingComplete(audioBlob, Math.min(finalDuration, maxDuration))
        }

        cleanup()
        setIsRecording(false)
      }

      mediaRecorder.onerror = () => {
        setError("Recording error occurred")
        cleanup()
        setIsRecording(false)
      }

      chunksRef.current = []
      startTimeRef.current = Date.now()
      pausedDurationRef.current = 0
      mediaRecorder.start(1000)
      setIsRecording(true)

      timerRef.current = setInterval(() => {
        const elapsed = getElapsed()
        setDuration(elapsed)

        if (elapsed >= maxDuration) {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop()
          }
        }
      }, 100)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Microphone access denied"
      setError(errorMessage)
      cleanup()
    }
  }, [cleanup, maxDuration, onRecordingComplete])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      pausedDurationRef.current += (Date.now() - startTimeRef.current) / 1000
      isPausedRef.current = true
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      startTimeRef.current = Date.now()
      isPausedRef.current = false

      timerRef.current = setInterval(() => {
        const elapsed = getElapsed()
        setDuration(elapsed)

        if (elapsed >= maxDuration) {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop()
          }
        }
      }, 100)
    }
  }, [maxDuration])

  const cancelRecording = useCallback(() => {
    cancelledRef.current = true
    chunksRef.current = []
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    cleanup()
    setIsRecording(false)
  }, [cleanup])

  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  return {
    isRecording,
    isPaused,
    duration,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording
  }
}
