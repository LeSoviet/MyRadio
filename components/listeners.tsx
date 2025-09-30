"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Listener {
  id: number
  name: string
  avatar: string
  connected: boolean
}

interface ListenersProps {
  listeners: Listener[]
}

export function Listeners({ listeners }: ListenersProps) {
  const connectedCount = listeners.filter((l) => l.connected).length

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 h-full hover:shadow-lg transition-all duration-500">
      <div className="flex items-center gap-3 mb-4">
        <Users className="h-6 w-6 text-primary" />
        <h3 className="text-2xl font-bold text-foreground transition-colors duration-500">Listeners</h3>
        <span className="ml-auto text-sm text-muted-foreground bg-primary/10 px-3 py-1 rounded-full transition-all duration-500">
          {connectedCount} online
        </span>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-3">
          {listeners.map((listener, index) => (
            <div
              key={listener.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-all duration-500 hover:scale-[1.02]"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="relative">
                <Avatar className="h-12 w-12 border-2 border-primary/20 transition-all duration-500">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold transition-all duration-500">
                    {listener.avatar}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card transition-all duration-500 ${
                    listener.connected ? "bg-green-500 animate-pulse" : "bg-muted"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate transition-colors duration-500">{listener.name}</p>
                <p className="text-xs text-muted-foreground transition-colors duration-500">
                  {listener.connected ? "Listening now" : "Offline"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-4 pt-4 border-t border-border transition-all duration-500">
        <p className="text-xs text-center text-muted-foreground transition-colors duration-500">
          Share your radio link so more friends can join
        </p>
      </div>
    </Card>
  )
}
