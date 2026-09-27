"use client"

import { useEffect, useRef, useState } from "react"
import { Icon, Spinner } from "@/components/ui"
import { cn } from "@/lib/utils"

interface AudioPlayerProps {
  src: string
  duration?: number
  className?: string
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`
}

// Fixed pseudo waveform, real peaks would need decoding the whole file in CEF
const BARS = [5, 9, 6, 12, 8, 14, 10, 7, 12, 6, 9, 13, 8, 5, 10, 12, 7, 9, 6, 11, 8, 5, 9, 7]

export function AudioPlayer({ src, duration: expectedDuration, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(expectedDuration || 0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onMeta = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration)
      setIsLoading(false)
    }
    const onTime = () => setCurrentTime(audio.currentTime)
    const onEnd = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    const onError = () => {
      setError(true)
      setIsLoading(false)
    }
    const onReady = () => setIsLoading(false)

    audio.addEventListener("loadedmetadata", onMeta)
    audio.addEventListener("timeupdate", onTime)
    audio.addEventListener("ended", onEnd)
    audio.addEventListener("error", onError)
    audio.addEventListener("canplay", onReady)
    return () => {
      audio.removeEventListener("loadedmetadata", onMeta)
      audio.removeEventListener("timeupdate", onTime)
      audio.removeEventListener("ended", onEnd)
      audio.removeEventListener("error", onError)
      audio.removeEventListener("canplay", onReady)
    }
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    // Only flip the state once playback really started (expired Discord links reject here)
    audio.play().then(() => setIsPlaying(true)).catch(() => setError(true))
  }

  const seek = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = event.currentTarget.getBoundingClientRect()
    audio.currentTime = ((event.clientX - rect.left) / rect.width) * duration
  }

  if (error) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-sm text-red-fg", className)}>
        <Icon name="warning" className="w-3.5 h-3.5" />
        Audio unavailable
      </span>
    )
  }

  const progress = duration ? currentTime / duration : 0

  return (
    <div className={cn("flex items-center gap-2.5 min-w-[15rem]", className)}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        type="button"
        onClick={toggle}
        disabled={isLoading}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-fg-on-accent hover:bg-accent-hover disabled:opacity-60 shrink-0"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isLoading ? <Spinner className="w-3.5 h-3.5" /> : <Icon name={isPlaying ? "pause" : "play"} className="w-3.5 h-3.5" strokeWidth={2.5} />}
      </button>

      <div className="flex-1 flex items-center gap-[0.1875rem] h-8 cursor-pointer" onClick={seek}>
        {BARS.map((height, index) => (
          <span
            key={index}
            className={cn("flex-1 rounded-full", index / BARS.length < progress ? "bg-accent-fg" : "bg-line-focus")}
            style={{ height: `${height / 16}rem` }}
          />
        ))}
      </div>

      <span className="text-xs tabular-nums text-fg-subtle shrink-0">
        {formatTime(isPlaying || currentTime > 0 ? currentTime : duration || expectedDuration || 0)}
      </span>
    </div>
  )
}
