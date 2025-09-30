"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2 } from "lucide-react"
import { useTheme } from "next-themes"

interface AudioVisualizerProps {
  isPlaying: boolean
  streamUrl?: string
}

export function AudioVisualizer({ isPlaying, streamUrl }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const animationRef = useRef<number | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? (resolvedTheme || theme) === "dark" : true

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    if (streamUrl && !audioContextRef.current && isPlaying) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 512
        analyserRef.current.smoothingTimeConstant = 0.8

        const bufferLength = analyserRef.current.frequencyBinCount
        dataArrayRef.current = new Uint8Array(bufferLength)

        // Create and connect audio element
        if (!audioElementRef.current) {
          audioElementRef.current = new Audio(streamUrl)
          audioElementRef.current.crossOrigin = "anonymous"
          audioElementRef.current.volume = 0.7
        }

        const source = audioContextRef.current.createMediaElementSource(audioElementRef.current)
        source.connect(analyserRef.current)
        analyserRef.current.connect(audioContextRef.current.destination)

        if (isPlaying) {
          audioElementRef.current.play().catch((err) => {
            console.log("[v0] Audio playback failed:", err)
          })
        }
      } catch (error) {
        console.log("[v0] Audio context initialization failed:", error)
      }
    }

    // Control audio playback
    if (audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.play().catch((err) => {
          console.log("[v0] Audio play failed:", err)
        })
      } else {
        audioElementRef.current.pause()
      }
    }

    const draw = () => {
      if (!ctx || !canvas) return

      const width = canvas.offsetWidth
      const height = canvas.offsetHeight

      ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.15)"
      ctx.fillRect(0, 0, width, height)

      if (analyserRef.current && dataArrayRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current)

        const barWidth = (width / dataArrayRef.current.length) * 2.5
        let barHeight
        let x = 0

        for (let i = 0; i < dataArrayRef.current.length; i++) {
          barHeight = (dataArrayRef.current[i] / 255) * height * 0.85

          const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height)
          const hue = (i / dataArrayRef.current.length) * 360

          if (isDark) {
            gradient.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.9)`)
            gradient.addColorStop(1, `hsla(${hue}, 100%, 40%, 0.6)`)
          } else {
            gradient.addColorStop(0, `hsla(${hue}, 85%, 50%, 0.8)`)
            gradient.addColorStop(1, `hsla(${hue}, 85%, 35%, 0.5)`)
          }

          ctx.fillStyle = gradient
          ctx.fillRect(x, height - barHeight, barWidth, barHeight)

          x += barWidth + 1
        }
      } else {
        const bars = 64
        const barWidth = width / bars

        for (let i = 0; i < bars; i++) {
          const barHeight = (Math.sin(Date.now() / 200 + i / 5) * 0.5 + 0.5) * height * 0.6 * (isPlaying ? 1 : 0.2)

          const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height)
          const hue = (i / bars) * 360

          if (isDark) {
            gradient.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.7)`)
            gradient.addColorStop(1, `hsla(${hue}, 100%, 40%, 0.4)`)
          } else {
            gradient.addColorStop(0, `hsla(${hue}, 85%, 50%, 0.6)`)
            gradient.addColorStop(1, `hsla(${hue}, 85%, 35%, 0.3)`)
          }

          ctx.fillStyle = gradient
          ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight)
        }
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, streamUrl, isDark])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        audioElementRef.current = null
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <Card
      className={`relative overflow-hidden backdrop-blur-sm border-border/50 transition-all duration-500 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "h-64"
      } ${isDark ? "bg-black/90" : "bg-white/90"}`}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      <Button
        variant="ghost"
        size="icon"
        className={`absolute top-4 right-4 transition-all duration-300 ${
          isDark ? "text-white hover:bg-white/20" : "text-black hover:bg-black/10"
        }`}
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
      </Button>
      {!isPlaying && (
        <div
          className={`absolute inset-0 flex items-center justify-center text-sm transition-colors duration-500 ${
            isDark ? "text-white/50" : "text-black/50"
          }`}
        >
          Audio visualizer - Play to see live visualization
        </div>
      )}
    </Card>
  )
}
