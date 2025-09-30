"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipForward, SkipBack, Radio, Volume2, Users, Wifi, WifiOff } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useEffect, useRef, useState } from "react"

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
    <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-2xl hover:shadow-primary/20 transition-all duration-300">
      {/* Audio element para streaming */}
      <audio ref={audioRef} preload="none" />
      
      <div className="flex flex-col items-center space-y-8">
        {/* Status badges */}
        <div className="flex gap-2 mb-4">
          {currentTrack.isLive && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          )}
          {currentTrack.listeners !== undefined && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {currentTrack.listeners} listeners
            </Badge>
          )}
          {currentTrack.bitrate && (
            <Badge variant="outline">
              {currentTrack.bitrate}kbps
            </Badge>
          )}
        </div>

        {/* Error message */}
        {audioError && (
          <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
            {audioError}
          </div>
        )}

        <div className="relative">
          <div
            className={`w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center transition-all duration-500 ${
              isPlaying && isConnected ? "animate-glow scale-105" : "scale-100"
            }`}
          >
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <Radio
                className={`w-20 h-20 text-primary transition-transform duration-700 ${
                  isPlaying && isConnected ? "rotate-12" : ""
                }`}
              />
            </div>
          </div>
          {isPlaying && isConnected && (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
            </>
          )}
        </div>

        <div className="text-center space-y-2 w-full">
          <h2 className="text-3xl font-bold text-foreground text-balance transition-colors duration-500">
            {currentTrack.title}
          </h2>
          <p className="text-xl text-muted-foreground transition-colors duration-500">{currentTrack.artist}</p>
          {currentTrack.album && (
            <p className="text-sm text-muted-foreground/70 transition-colors duration-500">{currentTrack.album}</p>
          )}
        </div>

        {/* Progress bar - solo para contenido no en vivo */}
        {!currentTrack.isLive && (
          <div className="w-full space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground transition-colors duration-500">
              <span>{formatTime(currentTrack.currentTime)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>
        )}

        {/* Volume control */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-muted-foreground w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {showControls && (
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full hover:bg-primary/10 hover:scale-110 transition-all duration-300"
              onClick={onPrevious}
            >
              <SkipBack className="h-6 w-6" />
            </Button>
          )}

          <Button
            size="icon"
            className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/50 hover:scale-110 transition-all duration-300"
            onClick={onPlayPause}
            disabled={currentTrack.isLive && !isConnected && !audioError}
          >
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
          </Button>

          {showControls && (
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full hover:bg-primary/10 hover:scale-110 transition-all duration-300"
              onClick={onNext}
            >
              <SkipForward className="h-6 w-6" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-500">
          <div className={`w-2 h-2 rounded-full ${
            currentTrack.isLive 
              ? (isPlaying && isConnected ? "bg-primary animate-pulse" : "bg-muted-foreground") 
              : (isPlaying ? "bg-primary animate-pulse" : "bg-muted-foreground")
          }`} />
          <span>
            {currentTrack.isLive 
              ? (isPlaying && isConnected ? "Live" : "Offline") 
              : (isPlaying ? "Playing" : "Paused")
            }
          </span>
        </div>
      </div>
    </Card>
  )
}
