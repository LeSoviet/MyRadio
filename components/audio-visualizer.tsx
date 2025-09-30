"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2, Settings, Palette, Zap } from "lucide-react"
import { useTheme } from "next-themes"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AudioVisualizerProps {
  isPlaying: boolean
  streamUrl?: string
}

type VisualizationMode = 'bars' | 'wave' | 'circular' | 'particles' | 'spectrum'
type ColorScheme = 'rainbow' | 'blue' | 'purple' | 'green' | 'fire' | 'ocean'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  hue: number
}

export function AudioVisualizer({ isPlaying, streamUrl }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const animationRef = useRef<number | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('bars')
  const [colorScheme, setColorScheme] = useState<ColorScheme>('rainbow')
  const [sensitivity, setSensitivity] = useState([80])
  const [smoothing, setSmoothing] = useState([0.8])
  const [showParticles, setShowParticles] = useState(true)
  const [showGlow, setShowGlow] = useState(true)
  const [fftSize, setFftSize] = useState(512)
  
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? (resolvedTheme || theme) === "dark" : true

  const getColorScheme = (hue: number, alpha: number = 1) => {
    switch (colorScheme) {
      case 'blue':
        return `hsla(${200 + hue * 0.3}, 100%, 60%, ${alpha})`
      case 'purple':
        return `hsla(${280 + hue * 0.2}, 100%, 60%, ${alpha})`
      case 'green':
        return `hsla(${120 + hue * 0.3}, 100%, 60%, ${alpha})`
      case 'fire':
        return `hsla(${hue * 0.5}, 100%, 60%, ${alpha})`
      case 'ocean':
        return `hsla(${180 + hue * 0.4}, 100%, 60%, ${alpha})`
      default: // rainbow
        return `hsla(${hue}, 100%, 60%, ${alpha})`
    }
  }

  const createParticles = (dataArray: Uint8Array, width: number, height: number) => {
    if (!showParticles) return

    for (let i = 0; i < dataArray.length; i += 8) {
      const intensity = dataArray[i] / 255
      if (intensity > 0.3) {
        const particle: Particle = {
          x: (i / dataArray.length) * width,
          y: height - intensity * height * 0.8,
          vx: (Math.random() - 0.5) * 4,
          vy: -Math.random() * 3 - 1,
          life: 0,
          maxLife: 60 + Math.random() * 40,
          size: 2 + intensity * 4,
          hue: (i / dataArray.length) * 360
        }
        particlesRef.current.push(particle)
      }
    }

    // Limit particles
    if (particlesRef.current.length > 200) {
      particlesRef.current = particlesRef.current.slice(-200)
    }
  }

  const updateParticles = (ctx: CanvasRenderingContext2D) => {
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += 0.1 // gravity
      particle.life++

      const alpha = 1 - (particle.life / particle.maxLife)
      if (alpha <= 0) return false

      ctx.save()
      if (showGlow) {
        ctx.shadowBlur = 10
        ctx.shadowColor = getColorScheme(particle.hue, alpha)
      }
      ctx.fillStyle = getColorScheme(particle.hue, alpha)
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      return true
    })
  }

  const drawBars = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const barWidth = (width / dataArray.length) * 2.5
    let x = 0

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height * (sensitivity[0] / 100)

      const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height)
      const hue = (i / dataArray.length) * 360

      gradient.addColorStop(0, getColorScheme(hue, 0.9))
      gradient.addColorStop(1, getColorScheme(hue, 0.6))

      ctx.fillStyle = gradient
      
      if (showGlow) {
        ctx.shadowBlur = 15
        ctx.shadowColor = getColorScheme(hue, 0.5)
      }
      
      ctx.fillRect(x, height - barHeight, barWidth, barHeight)
      x += barWidth + 1
    }
  }

  const drawWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    ctx.lineWidth = 3
    ctx.beginPath()

    const sliceWidth = width / dataArray.length
    let x = 0

    for (let i = 0; i < dataArray.length; i++) {
      const v = (dataArray[i] / 255) * (sensitivity[0] / 100)
      const y = height / 2 + (v - 0.5) * height

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      x += sliceWidth
    }

    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    for (let i = 0; i <= 10; i++) {
      gradient.addColorStop(i / 10, getColorScheme(i * 36, 0.8))
    }

    ctx.strokeStyle = gradient
    if (showGlow) {
      ctx.shadowBlur = 20
      ctx.shadowColor = getColorScheme(180, 0.5)
    }
    ctx.stroke()
  }

  const drawCircular = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 4

    for (let i = 0; i < dataArray.length; i++) {
      const angle = (i / dataArray.length) * Math.PI * 2
      const barHeight = (dataArray[i] / 255) * radius * (sensitivity[0] / 100)

      const x1 = centerX + Math.cos(angle) * radius
      const y1 = centerY + Math.sin(angle) * radius
      const x2 = centerX + Math.cos(angle) * (radius + barHeight)
      const y2 = centerY + Math.sin(angle) * (radius + barHeight)

      const hue = (i / dataArray.length) * 360
      ctx.strokeStyle = getColorScheme(hue, 0.8)
      ctx.lineWidth = 2

      if (showGlow) {
        ctx.shadowBlur = 10
        ctx.shadowColor = getColorScheme(hue, 0.5)
      }

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
  }

  const drawSpectrum = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    for (let x = 0; x < width; x++) {
      const dataIndex = Math.floor((x / width) * dataArray.length)
      const intensity = dataArray[dataIndex] / 255 * (sensitivity[0] / 100)
      
      for (let y = 0; y < height; y++) {
        const pixelIndex = (y * width + x) * 4
        const normalizedY = y / height
        
        if (normalizedY > (1 - intensity)) {
          const hue = (x / width) * 360
          const [r, g, b] = hslToRgb(hue / 360, 1, 0.6)
          
          data[pixelIndex] = r
          data[pixelIndex + 1] = g
          data[pixelIndex + 2] = b
          data[pixelIndex + 3] = 255 * (intensity - (1 - normalizedY))
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs((h * 6) % 2 - 1))
    const m = l - c / 2
    let r = 0, g = 0, b = 0

    if (0 <= h && h < 1/6) {
      r = c; g = x; b = 0
    } else if (1/6 <= h && h < 2/6) {
      r = x; g = c; b = 0
    } else if (2/6 <= h && h < 3/6) {
      r = 0; g = c; b = x
    } else if (3/6 <= h && h < 4/6) {
      r = 0; g = x; b = c
    } else if (4/6 <= h && h < 5/6) {
      r = x; g = 0; b = c
    } else if (5/6 <= h && h < 1) {
      r = c; g = 0; b = x
    }

    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ]
  }

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
        analyserRef.current.fftSize = fftSize
        analyserRef.current.smoothingTimeConstant = smoothing[0]

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

    // Update analyser settings
    if (analyserRef.current) {
      analyserRef.current.fftSize = fftSize
      analyserRef.current.smoothingTimeConstant = smoothing[0]
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

      // Clear canvas with fade effect
      ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)"
      ctx.fillRect(0, 0, width, height)

      if (analyserRef.current && dataArrayRef.current && isPlaying) {
        try {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
          analyserRef.current.getByteFrequencyData(dataArray)
          dataArrayRef.current = dataArray

          // Create particles based on audio data
          createParticles(dataArray, width, height)

          // Draw visualization based on mode
          ctx.save()
          switch (visualizationMode) {
            case 'bars':
              drawBars(ctx, dataArray, width, height)
              break
            case 'wave':
              drawWave(ctx, dataArray, width, height)
              break
            case 'circular':
              drawCircular(ctx, dataArray, width, height)
              break
            case 'spectrum':
              drawSpectrum(ctx, dataArray, width, height)
              break
            case 'particles':
              // Only particles, no other visualization
              break
          }
          ctx.restore()

          // Update and draw particles
          updateParticles(ctx)

        } catch (error) {
          console.warn('Error getting frequency data:', error)
          return
        }
      } else {
        // Fallback animation when not playing
        const bars = 64
        const barWidth = width / bars

        for (let i = 0; i < bars; i++) {
          const barHeight = (Math.sin(Date.now() / 200 + i / 5) * 0.5 + 0.5) * height * 0.6 * (isPlaying ? 1 : 0.2)

          const hue = (i / bars) * 360
          const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height)
          gradient.addColorStop(0, getColorScheme(hue, 0.7))
          gradient.addColorStop(1, getColorScheme(hue, 0.4))

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
  }, [isPlaying, streamUrl, isDark, visualizationMode, colorScheme, sensitivity, smoothing, showParticles, showGlow, fftSize])

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
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "h-32"
      } ${isDark ? "bg-black/90" : "bg-white/90"}`}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`transition-all duration-300 ${
                isDark ? "text-white hover:bg-white/20" : "text-black hover:bg-black/10"
              }`}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Modo de visualización</Label>
                <Select value={visualizationMode} onValueChange={(value: VisualizationMode) => setVisualizationMode(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bars">Barras</SelectItem>
                    <SelectItem value="wave">Onda</SelectItem>
                    <SelectItem value="circular">Circular</SelectItem>
                    <SelectItem value="spectrum">Espectro</SelectItem>
                    <SelectItem value="particles">Partículas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Esquema de colores</Label>
                <Select value={colorScheme} onValueChange={(value: ColorScheme) => setColorScheme(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rainbow">Arcoíris</SelectItem>
                    <SelectItem value="blue">Azul</SelectItem>
                    <SelectItem value="purple">Púrpura</SelectItem>
                    <SelectItem value="green">Verde</SelectItem>
                    <SelectItem value="fire">Fuego</SelectItem>
                    <SelectItem value="ocean">Océano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sensibilidad: {sensitivity[0]}%</Label>
                <Slider
                  value={sensitivity}
                  onValueChange={setSensitivity}
                  max={200}
                  min={10}
                  step={10}
                />
              </div>

              <div className="space-y-2">
                <Label>Suavizado: {(smoothing[0] * 100).toFixed(0)}%</Label>
                <Slider
                  value={smoothing}
                  onValueChange={setSmoothing}
                  max={0.95}
                  min={0.1}
                  step={0.05}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="particles"
                  checked={showParticles}
                  onCheckedChange={setShowParticles}
                />
                <Label htmlFor="particles">Partículas</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="glow"
                  checked={showGlow}
                  onCheckedChange={setShowGlow}
                />
                <Label htmlFor="glow">Efecto de brillo</Label>
              </div>

              <div className="space-y-2">
                <Label>Resolución FFT</Label>
                <Select value={fftSize.toString()} onValueChange={(value) => setFftSize(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="256">256 (Rápido)</SelectItem>
                    <SelectItem value="512">512 (Balanceado)</SelectItem>
                    <SelectItem value="1024">1024 (Detallado)</SelectItem>
                    <SelectItem value="2048">2048 (Máximo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="icon"
          className={`transition-all duration-300 ${
            isDark ? "text-white hover:bg-white/20" : "text-black hover:bg-black/10"
          }`}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>
      </div>

      {!isPlaying && (
        <div
          className={`absolute inset-0 flex items-center justify-center text-sm transition-colors duration-500 ${
            isDark ? "text-white/50" : "text-black/50"
          }`}
        >
          <div className="text-center space-y-2">
            <Zap className="h-8 w-8 mx-auto opacity-50" />
            <p>Visualizador de audio avanzado</p>
            <p className="text-xs">Reproduce música para ver la visualización en vivo</p>
          </div>
        </div>
      )}
    </Card>
  )
}
