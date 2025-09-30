"use client"

import { Card } from "@/components/ui/card"
import { Radio, Users, Music, Clock } from "lucide-react"

interface RadioStatsProps {
  stats: {
    uptime: string
    totalSongs: number
    totalListeners: number
    currentListeners: number
  }
}

export function RadioStats({ stats }: RadioStatsProps) {
  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 transition-all duration-500">
      <div className="flex items-center gap-2 mb-4">
        <Radio className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground transition-colors duration-500">Radio Stats</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground transition-colors duration-500">Uptime</p>
          </div>
          <p className="text-xl font-bold text-foreground transition-colors duration-500">{stats.uptime}</p>
        </div>
        <div className="p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <Music className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground transition-colors duration-500">Songs Played</p>
          </div>
          <p className="text-xl font-bold text-foreground transition-colors duration-500">{stats.totalSongs}</p>
        </div>
        <div className="p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground transition-colors duration-500">Current</p>
          </div>
          <p className="text-xl font-bold text-foreground transition-colors duration-500">{stats.currentListeners}</p>
        </div>
        <div className="p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground transition-colors duration-500">Total</p>
          </div>
          <p className="text-xl font-bold text-foreground transition-colors duration-500">{stats.totalListeners}</p>
        </div>
      </div>
    </Card>
  )
}
