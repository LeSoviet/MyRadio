"use client"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock } from "lucide-react"

interface SongHistoryProps {
  history: Array<{
    id: number
    title: string
    artist: string
    playedAt: string
  }>
}

export function SongHistory({ history }: SongHistoryProps) {
  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 transition-all duration-500">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground transition-colors duration-500">Recently Played</h3>
      </div>
      <ScrollArea className="h-[300px]">
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 transition-colors duration-500">
              No history yet
            </p>
          ) : (
            history.map((song) => (
              <div
                key={song.id}
                className="p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-all duration-300 hover:scale-[1.02]"
              >
                <p className="font-medium text-sm text-foreground transition-colors duration-500">{song.title}</p>
                <p className="text-xs text-muted-foreground transition-colors duration-500">{song.artist}</p>
                <p className="text-xs text-muted-foreground/70 mt-1 transition-colors duration-500">{song.playedAt}</p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
