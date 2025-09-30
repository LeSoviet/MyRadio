"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ThumbsUp, Music, Flame, Star, Zap } from "lucide-react"

interface Reaction {
  id: string
  emoji: string
  x: number
  timestamp: number
}

interface LiveReactionsProps {
  currentTrack: {
    title: string
    artist: string
  }
}

export function LiveReactions({ currentTrack }: LiveReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [reactionCounts, setReactionCounts] = useState({
    heart: 0,
    thumbsUp: 0,
    music: 0,
    flame: 0,
    star: 0,
    zap: 0,
  })

  const reactionIcons = [
    { icon: Heart, emoji: "❤️", key: "heart", color: "text-red-500" },
    { icon: ThumbsUp, emoji: "👍", key: "thumbsUp", color: "text-blue-500" },
    { icon: Music, emoji: "🎵", key: "music", color: "text-purple-500" },
    { icon: Flame, emoji: "🔥", key: "flame", color: "text-orange-500" },
    { icon: Star, emoji: "⭐", key: "star", color: "text-yellow-500" },
    { icon: Zap, emoji: "⚡", key: "zap", color: "text-cyan-500" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setReactions((prev) => prev.filter((r) => Date.now() - r.timestamp < 3000))
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const addReaction = (emoji: string, key: string) => {
    const newReaction: Reaction = {
      id: Math.random().toString(36).substr(2, 9),
      emoji,
      x: Math.random() * 80 + 10,
      timestamp: Date.now(),
    }

    setReactions((prev) => [...prev, newReaction])
    setReactionCounts((prev) => ({
      ...prev,
      [key]: prev[key as keyof typeof prev] + 1,
    }))

    // Send to API (for real-time sync with other listeners)
    fetch("/api/radio/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emoji,
        track: currentTrack.title,
        artist: currentTrack.artist,
      }),
    }).catch((err) => console.log("[v0] Failed to send reaction:", err))
  }

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-primary/10 transition-all duration-300">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground transition-colors duration-500">Live Reactions</h3>
          <div className="text-sm text-muted-foreground transition-colors duration-500">
            {Object.values(reactionCounts).reduce((a, b) => a + b, 0)} total
          </div>
        </div>

        <div className="relative h-32 bg-muted/20 rounded-lg overflow-hidden border border-border/30 transition-colors duration-500">
          {reactions.map((reaction) => (
            <div
              key={reaction.id}
              className="absolute text-3xl animate-float-up pointer-events-none"
              style={{
                left: `${reaction.x}%`,
                bottom: "0%",
                animation: "float-up 3s ease-out forwards",
              }}
            >
              {reaction.emoji}
            </div>
          ))}
          {reactions.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 text-sm transition-colors duration-500">
              React to the music!
            </div>
          )}
        </div>

        <div className="grid grid-cols-6 gap-2">
          {reactionIcons.map(({ icon: Icon, emoji, key, color }) => (
            <div key={key} className="flex flex-col items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={`h-12 w-12 rounded-full hover:scale-110 transition-all duration-300 ${color} hover:bg-primary/10`}
                onClick={() => addReaction(emoji, key)}
              >
                <Icon className="h-6 w-6" />
              </Button>
              <span className="text-xs text-muted-foreground transition-colors duration-500">
                {reactionCounts[key as keyof typeof reactionCounts]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-60px) scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-120px) scale(0.8);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up 3s ease-out forwards;
        }
      `}</style>
    </Card>
  )
}
