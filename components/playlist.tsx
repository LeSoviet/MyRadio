"use client"

import { Card } from "@/components/ui/card"
import { Music2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Track {
  id: number
  title: string
  artist: string
  album: string
  duration: number
}

interface PlaylistProps {
  tracks: Track[]
  currentTrack: {
    title: string
    artist: string
  }
}

export function Playlist({ tracks, currentTrack }: PlaylistProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-500">
      <div className="flex items-center gap-3 mb-4">
        <Music2 className="h-6 w-6 text-primary animate-pulse" />
        <h3 className="text-2xl font-bold text-foreground transition-colors duration-500">Playlist</h3>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-2">
          {tracks.map((track, index) => {
            const isCurrentTrack = track.title === currentTrack.title
            return (
              <div
                key={track.id}
                className={`p-4 rounded-lg transition-all duration-500 hover:scale-[1.02] ${
                  isCurrentTrack
                    ? "bg-primary/10 border-2 border-primary/30 shadow-lg shadow-primary/10"
                    : "bg-secondary/50 hover:bg-secondary/80 border-2 border-transparent"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-semibold truncate transition-colors duration-500 ${isCurrentTrack ? "text-primary" : "text-foreground"}`}
                    >
                      {track.title}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate transition-colors duration-500">
                      {track.artist}
                    </p>
                    <p className="text-xs text-muted-foreground/70 truncate transition-colors duration-500">
                      {track.album}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap transition-colors duration-500">
                    {formatDuration(track.duration)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </Card>
  )
}
