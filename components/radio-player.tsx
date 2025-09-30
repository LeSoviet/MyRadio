"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipForward, SkipBack, Radio, Volume2, Users, Wifi, WifiOff, Heart, Share2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface RadioPlayerProps {
  currentTrack: {
    title: string
    artist: string
    album: string
    duration: number
    currentTime: number
    streamUrl?: string
    listeners?: number
    bitrate?: number
    isLive?: boolean
  }
  isPlaying: boolean
  onPlayPause: () => void
  onNext?: () => void
  onPrevious?: () => void
}

export function RadioPlayer({ currentTrack, isPlaying, onPlayPause, onNext, onPrevious }: RadioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [volume, setVolume] = useState(0.7)
  const [isConnected, setIsConnected] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [pulseIntensity, setPulseIntensity] = useState(0)

  // Animación de pulso basada en el audio
  useEffect(() => {
    if (isPlaying && isConnected) {
      const interval = setInterval(() => {
        setPulseIntensity(Math.random() * 0.3 + 0.7)
      }, 200)
      return () => clearInterval(interval)
    } else {
      setPulseIntensity(0)
    }
  }, [isPlaying, isConnected])

  // Manejar el elemento de audio HTML5
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack.streamUrl) return

    const handleCanPlay = () => {
      setIsConnected(true)
      setAudioError(null)
    }

    const handleError = (e: Event) => {
      console.error('Audio error:', e)
      setIsConnected(false)
      setAudioError('Error connecting to stream')
    }

    const handleLoadStart = () => {
      setAudioError(null)
    }

    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)
    audio.addEventListener('loadstart', handleLoadStart)

    // Configurar el stream
    if (currentTrack.streamUrl && currentTrack.isLive) {
      audio.src = currentTrack.streamUrl
      audio.volume = volume
      audio.preload = 'none'
    }

    return () => {
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('loadstart', handleLoadStart)
    }
  }, [currentTrack.streamUrl, volume])

  // Controlar reproducción
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying && currentTrack.isLive) {
      audio.play().catch((error) => {
        console.error('Error playing audio:', error)
        setAudioError('Failed to play stream')
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrack.isLive])

  // Manejar cambios de volumen
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Para streams en vivo, no mostramos progreso de tiempo
  const progress = currentTrack.isLive ? 0 : 
    currentTrack.duration > 0 ? (currentTrack.currentTime / currentTrack.duration) * 100 : 0

  const showControls = !currentTrack.isLive && onNext && onPrevious

  return (
    <Card className="w-full max-w-4xl mx-auto p-3 sm:p-4 md:p-6 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border-border/50 shadow-2xl relative overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-gradient-shift" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.1),transparent_70%)]" />
      
      {/* Partículas flotantes - Ocultas en móvil para mejor rendimiento */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${20 + i * 15}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 space-y-4 sm:space-y-6">
        {/* Header con estado - Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Radio className={cn(
                "w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300",
                isConnected ? "text-green-500 animate-pulse" : "text-muted-foreground"
              )} />
              {isConnected && (
                <div className="absolute inset-0 w-5 h-5 sm:w-6 sm:h-6 bg-green-500/20 rounded-full animate-ping" />
              )}
            </div>
            <Badge 
              variant={isConnected ? "default" : "secondary"}
              className={cn(
                "transition-all duration-300 animate-slide-in text-xs sm:text-sm",
                isConnected && "bg-green-500/10 text-green-500 border-green-500/20"
              )}
            >
              {isConnected ? "EN VIVO" : "DESCONECTADO"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {currentTrack.listeners && (
              <Badge variant="outline" className="animate-slide-in text-xs">
                <Users className="w-3 h-3 mr-1" />
                <span className="hidden xs:inline">{currentTrack.listeners}</span>
                <span className="xs:hidden">{currentTrack.listeners}</span>
              </Badge>
            )}
            {currentTrack.bitrate && (
              <Badge variant="outline" className="animate-slide-in text-xs">
                {currentTrack.bitrate}k
              </Badge>
            )}
          </div>
        </div>

        {/* Mensaje de error - Responsive */}
        {audioError && (
          <div className="p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-slide-in">
            <div className="flex items-center gap-2 text-destructive">
              <WifiOff className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium break-words">{audioError}</span>
            </div>
          </div>
        )}

        {/* Reproductor central - Layout responsive */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          {/* Visualizador circular mejorado - Tamaño responsive */}
          <div className="relative flex-shrink-0 order-1 sm:order-none">
            <div className={cn(
              "w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-4 transition-all duration-500 relative overflow-hidden",
              isPlaying && isConnected 
                ? "border-primary shadow-lg shadow-primary/25 animate-glow" 
                : "border-muted-foreground/30"
            )}>
              {/* Anillos animados - Reducidos en móvil */}
              {isPlaying && isConnected && (
                <>
                  <div 
                    className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse-ring hidden sm:block"
                    style={{ transform: `scale(${pulseIntensity})` }}
                  />
                  <div 
                    className="absolute inset-2 rounded-full border border-primary/20 animate-pulse-ring hidden sm:block"
                    style={{ 
                      transform: `scale(${pulseIntensity * 0.8})`,
                      animationDelay: '0.1s'
                    }}
                  />
                </>
              )}
              
              {/* Efecto de ondas */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isPlaying && isConnected ? (
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-0.5 sm:w-1 bg-primary rounded-full animate-audio-wave"
                        style={{
                          height: `${15 + Math.sin(Date.now() / 200 + i) * 8}px`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <Radio className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-muted-foreground" />
                )}
              </div>
            </div>
            
            {/* Partículas flotantes alrededor del visualizador - Solo desktop */}
            {isPlaying && isConnected && (
              <div className="absolute inset-0 pointer-events-none hidden lg:block">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-primary/40 rounded-full animate-float"
                    style={{
                      top: `${50 + 40 * Math.sin((i * Math.PI) / 4)}%`,
                      left: `${50 + 40 * Math.cos((i * Math.PI) / 4)}%`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Información de la pista - Centrada en móvil */}
          <div className="flex-1 min-w-0 text-center sm:text-left order-2 sm:order-none">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 truncate animate-text-glow">
              {currentTrack.title}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-2 truncate">
              {currentTrack.artist}
            </p>
            {currentTrack.album && (
              <p className="text-xs sm:text-sm text-muted-foreground/70 truncate">
                {currentTrack.album}
              </p>
            )}
          </div>
        </div>

        {/* Barra de progreso mejorada - Responsive */}
        {!currentTrack.isLive && (
          <div className="space-y-2">
            <Progress 
              value={progress} 
              className="h-1.5 sm:h-2 bg-muted/50 animate-slide-in"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTrack.currentTime)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>
        )}

        {/* Controles mejorados - Layout responsive */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          {/* Controles de reproducción - Centrados en móvil */}
          <div className="flex items-center gap-2 order-2 sm:order-none">
            {showControls && onPrevious && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onPrevious}
                className="hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105 w-8 h-8 sm:w-auto sm:h-auto"
              >
                <SkipBack className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )}
            
            <Button 
              onClick={onPlayPause}
              size="lg"
              className={cn(
                "w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all duration-300 hover:scale-105 active:scale-95",
                isPlaying 
                  ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 animate-glow" 
                  : "bg-primary/80 hover:bg-primary"
              )}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
              )}
            </Button>
            
            {showControls && onNext && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onNext}
                className="hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105 w-8 h-8 sm:w-auto sm:h-auto"
              >
                <SkipForward className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )}
          </div>

          {/* Controles de volumen y acciones - Responsive */}
          <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-none">
            <div 
              className="relative"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <Button 
                variant="ghost" 
                size="sm"
                className="hover:bg-primary/10 hover:text-primary transition-all duration-200 w-8 h-8 sm:w-auto sm:h-auto"
              >
                <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              
              {showVolumeSlider && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg animate-slide-in">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-16 sm:w-20 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              )}
            </div>

            {/* Acciones adicionales */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsLiked(!isLiked)}
              className={cn(
                "hover:bg-primary/10 transition-all duration-200 hover:scale-105 w-8 h-8 sm:w-auto sm:h-auto",
                isLiked ? "text-red-500 hover:text-red-600" : "hover:text-primary"
              )}
            >
              <Heart className={cn("w-3 h-3 sm:w-4 sm:h-4", isLiked && "fill-current")} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105 w-8 h-8 sm:w-auto sm:h-auto"
            >
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        {/* Indicador de estado mejorado - Responsive */}
        <div className="flex items-center justify-center">
          <div className={cn(
            "flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-all duration-300",
            isConnected 
              ? "bg-green-500/10 text-green-500 border border-green-500/20 animate-glow" 
              : "bg-muted/50 text-muted-foreground"
          )}>
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3" />
                <span className="hidden sm:inline">Transmisión en vivo</span>
                <span className="sm:hidden">En vivo</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span className="hidden sm:inline">Sin conexión</span>
                <span className="sm:hidden">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        preload="none"
        crossOrigin="anonymous"
      />
    </Card>
  )
}
