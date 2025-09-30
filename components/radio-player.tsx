"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipForward, SkipBack, Radio } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface RadioPlayerProps {
  currentTrack: {
    title: string
    artist: string
    album: string
    duration: number
    currentTime: number
  }
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
}

export function RadioPlayer({ currentTrack, isPlaying, onPlayPause, onNext, onPrevious }: RadioPlayerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = currentTrack.duration > 0 ? (currentTrack.currentTime / currentTrack.duration) * 100 : 0

  return (
    <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-2xl hover:shadow-primary/20 transition-all duration-300">
      <div className="flex flex-col items-center space-y-8">
        <div className="relative">
          <div
            className={`w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center transition-all duration-500 ${
              isPlaying ? "animate-glow scale-105" : "scale-100"
            }`}
          >
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <Radio
                className={`w-20 h-20 text-primary transition-transform duration-700 ${isPlaying ? "rotate-12" : ""}`}
              />
            </div>
          </div>
          {isPlaying && (
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

        <div className="w-full space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground transition-colors duration-500">
            <span>{formatTime(currentTrack.currentTime)}</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full hover:bg-primary/10 hover:scale-110 transition-all duration-300"
            onClick={onPrevious}
          >
            <SkipBack className="h-6 w-6" />
          </Button>

          <Button
            size="icon"
            className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/50 hover:scale-110 transition-all duration-300"
            onClick={onPlayPause}
          >
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full hover:bg-primary/10 hover:scale-110 transition-all duration-300"
            onClick={onNext}
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-500">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>{isPlaying ? "Live" : "Paused"}</span>
        </div>
      </div>
    </Card>
  )
}
