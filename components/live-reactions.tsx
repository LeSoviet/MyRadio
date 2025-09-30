"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ThumbsUp, Music, Flame, Star, Zap, Smile, PartyPopper, Coffee, Headphones, Mic, Volume2 } from "lucide-react"

interface Reaction {
  id: string
  emoji: string
  x: number
  y: number
  timestamp: number
  type: string
  velocity: number
  rotation: number
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
    smile: 0,
    party: 0,
    coffee: 0,
    headphones: 0,
    mic: 0,
    volume: 0,
  })
  const [isAnimating, setIsAnimating] = useState(false)
  const [totalReactions, setTotalReactions] = useState(0)

  const reactionIcons = [
    { icon: Heart, emoji: "❤️", key: "heart", color: "text-red-500", bgColor: "bg-red-500/20", label: "Love" },
    { icon: ThumbsUp, emoji: "👍", key: "thumbsUp", color: "text-blue-500", bgColor: "bg-blue-500/20", label: "Like" },
    { icon: Music, emoji: "🎵", key: "music", color: "text-purple-500", bgColor: "bg-purple-500/20", label: "Music" },
    { icon: Flame, emoji: "🔥", key: "flame", color: "text-orange-500", bgColor: "bg-orange-500/20", label: "Fire" },
    { icon: Star, emoji: "⭐", key: "star", color: "text-yellow-500", bgColor: "bg-yellow-500/20", label: "Star" },
    { icon: Zap, emoji: "⚡", key: "zap", color: "text-cyan-500", bgColor: "bg-cyan-500/20", label: "Energy" },
    { icon: Smile, emoji: "😊", key: "smile", color: "text-green-500", bgColor: "bg-green-500/20", label: "Happy" },
    { icon: PartyPopper, emoji: "🎉", key: "party", color: "text-pink-500", bgColor: "bg-pink-500/20", label: "Party" },
    { icon: Coffee, emoji: "☕", key: "coffee", color: "text-amber-600", bgColor: "bg-amber-600/20", label: "Chill" },
    { icon: Headphones, emoji: "🎧", key: "headphones", color: "text-indigo-500", bgColor: "bg-indigo-500/20", label: "Vibe" },
    { icon: Mic, emoji: "🎤", key: "mic", color: "text-rose-500", bgColor: "bg-rose-500/20", label: "Sing" },
    { icon: Volume2, emoji: "🔊", key: "volume", color: "text-teal-500", bgColor: "bg-teal-500/20", label: "Loud" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setReactions((prev) => prev.filter((r) => Date.now() - r.timestamp < 4000))
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Simular reacciones automáticas de otros oyentes
  useEffect(() => {
    const simulateReactions = () => {
      if (Math.random() < 0.3) { // 30% chance cada 5 segundos
        const randomReaction = reactionIcons[Math.floor(Math.random() * reactionIcons.length)]
        addReaction(randomReaction.emoji, randomReaction.key, true)
      }
    }

    const interval = setInterval(simulateReactions, 5000)
    return () => clearInterval(interval)
  }, [])

  const addReaction = useCallback((emoji: string, key: string, isSimulated = false) => {
    const newReaction: Reaction = {
      id: Math.random().toString(36).substr(2, 9),
      emoji,
      x: Math.random() * 70 + 15, // 15% to 85% from left
      y: Math.random() * 20 + 70, // Start from bottom area
      timestamp: Date.now(),
      type: key,
      velocity: Math.random() * 2 + 1, // Random velocity
      rotation: Math.random() * 360, // Random rotation
    }

    setReactions((prev) => [...prev, newReaction])
    setReactionCounts((prev) => ({
      ...prev,
      [key]: prev[key as keyof typeof prev] + 1,
    }))
    setTotalReactions(prev => prev + 1)

    // Trigger animation effect
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    // Send to API only if not simulated (real user reaction)
    if (!isSimulated) {
      fetch("/api/radio/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emoji,
          track: currentTrack.title,
          artist: currentTrack.artist,
          type: key,
        }),
      }).catch((err) => console.log("[v0] Failed to send reaction:", err))
    }
  }, [currentTrack.title, currentTrack.artist])

  return (
    <Card className={`p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-primary/10 transition-all duration-300 ${isAnimating ? 'animate-pulse' : ''}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground transition-colors duration-500 flex items-center gap-2">
            Live Reactions
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </h3>
          <div className="text-sm text-muted-foreground transition-colors duration-500 flex items-center gap-2">
            <span className="font-medium text-primary">{totalReactions}</span>
            <span>total reactions</span>
          </div>
        </div>

        {/* Enhanced Reaction Display Area */}
        <div className="relative h-40 bg-gradient-to-t from-muted/30 to-muted/10 rounded-lg overflow-hidden border border-border/30 transition-colors duration-500">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.1),transparent_50%)]"></div>
          </div>

          {/* Floating Reactions */}
          {reactions.map((reaction) => (
            <div
              key={reaction.id}
              className="absolute text-4xl pointer-events-none select-none"
              style={{
                left: `${reaction.x}%`,
                bottom: `${reaction.y}%`,
                transform: `rotate(${reaction.rotation}deg)`,
                animation: `advanced-float-up 4s ease-out forwards, reaction-wiggle 0.5s ease-in-out`,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }}
            >
              {reaction.emoji}
            </div>
          ))}

          {/* Empty State */}
          {reactions.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/50 text-sm transition-colors duration-500">
              <Music className="h-8 w-8 mb-2 opacity-30" />
              <span>React to the music!</span>
            </div>
          )}

          {/* Reaction Burst Effect */}
          {isAnimating && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-primary/20 rounded-full animate-ping"></div>
            </div>
          )}
        </div>

        {/* Enhanced Reaction Buttons Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {reactionIcons.map(({ icon: Icon, emoji, key, color, bgColor, label }) => (
            <div key={key} className="flex flex-col items-center gap-1 group">
              <Button
                variant="ghost"
                size="icon"
                className={`h-12 w-12 rounded-full hover:scale-110 active:scale-95 transition-all duration-300 ${color} hover:${bgColor} relative overflow-hidden group-hover:shadow-lg`}
                onClick={() => addReaction(emoji, key)}
                title={label}
              >
                <Icon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                
                {/* Button Glow Effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12"></div>
              </Button>
              
              {/* Reaction Count with Animation */}
              <div className="flex flex-col items-center">
                <span className={`text-xs font-medium transition-all duration-300 ${reactionCounts[key as keyof typeof reactionCounts] > 0 ? color : 'text-muted-foreground'}`}>
                  {reactionCounts[key as keyof typeof reactionCounts]}
                </span>
                <span className="text-[10px] text-muted-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Reaction Stats */}
        <div className="flex justify-between items-center pt-2 border-t border-border/30">
          <div className="text-xs text-muted-foreground">
            Most popular: {
              Object.entries(reactionCounts).reduce((a, b) => 
                reactionCounts[a[0] as keyof typeof reactionCounts] > reactionCounts[b[0] as keyof typeof reactionCounts] ? a : b
              )[0] !== '0' ? 
              reactionIcons.find(r => r.key === Object.entries(reactionCounts).reduce((a, b) => 
                reactionCounts[a[0] as keyof typeof reactionCounts] > reactionCounts[b[0] as keyof typeof reactionCounts] ? a : b
              )[0])?.emoji || '🎵' : '🎵'
            }
          </div>
          <div className="text-xs text-muted-foreground">
            {reactions.length} active
          </div>
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
