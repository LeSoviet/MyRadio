"use client"

import { useState, useEffect } from "react"
import { RadioPlayer } from "@/components/radio-player"
import { Playlist } from "@/components/playlist"
import { Listeners } from "@/components/listeners"
import { RadioVisualizer } from "@/components/radio-visualizer"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { SocialShare } from "@/components/social-share"
import { SongHistory } from "@/components/song-history"
import { RadioStats } from "@/components/radio-stats"
import { LiveReactions } from "@/components/live-reactions"
import { ThemeToggle } from "@/components/theme-toggle"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function RadioPage() {
  const [isPlaying, setIsPlaying] = useState(false)

  // Obtener datos del stream en tiempo real
  const { data: currentTrackData, mutate: mutateCurrentTrack } = useSWR("/api/radio/current", fetcher, { 
    refreshInterval: 3000,
    revalidateOnFocus: false
  })

  const { data: streamStatusData } = useSWR("/api/radio/stream-status", fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: false
  })

  const { data: playlistData } = useSWR("/api/radio/playlist", fetcher, {
    refreshInterval: 10000,
  })

  const { data: listenersData } = useSWR("/api/radio/listeners", fetcher, {
    refreshInterval: 5000,
  })

  const { data: historyData } = useSWR("/api/radio/history", fetcher, {
    refreshInterval: 10000,
  })

  const { data: statsData } = useSWR("/api/radio/stats", fetcher, {
    refreshInterval: 15000,
  })

  // Sincronizar estado de reproducción con el stream
  useEffect(() => {
    if (currentTrackData?.isPlaying !== undefined) {
      setIsPlaying(currentTrackData.isPlaying)
    }
  }, [currentTrackData?.isPlaying])

  const currentTrack = currentTrackData || {
    title: "Waiting for broadcast...",
    artist: "MyRadio",
    album: "",
    duration: 0,
    currentTime: 0,
    streamUrl: "http://localhost:8000/stream",
    listeners: 0,
    bitrate: 0,
    isLive: false
  }

  const playlist = playlistData || []
  const listeners = listenersData || []
  const history = historyData || []
  const stats = statsData || {
    uptime: "0h 0m",
    totalSongs: 0,
    totalListeners: 0,
    currentListeners: 0,
  }

  const handlePlayPause = async () => {
    const newState = !isPlaying
    setIsPlaying(newState)

    try {
      const response = await fetch("/api/radio/current", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: newState ? "play" : "pause" }),
      })

      if (response.ok) {
        const data = await response.json()
        // Actualizar datos inmediatamente
        mutateCurrentTrack(data, false)
      }
    } catch (error) {
      console.error("Error controlling playback:", error)
      // Revertir estado en caso de error
      setIsPlaying(!newState)
    }
  }

  const handleNext = async () => {
    // Para streams en vivo, "next" podría significar refrescar metadatos
    try {
      await fetch("/api/radio/current", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refresh" }),
      })
      // Forzar actualización de datos
      mutateCurrentTrack()
    } catch (error) {
      console.error("Error refreshing track:", error)
    }
  }

  const handlePrevious = async () => {
    // Para streams en vivo, "previous" podría significar refrescar metadatos
    try {
      await fetch("/api/radio/current", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refresh" }),
      })
      // Forzar actualización de datos
      mutateCurrentTrack()
    } catch (error) {
      console.error("Error refreshing track:", error)
    }
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden transition-colors duration-500">
      <RadioVisualizer isPlaying={isPlaying} />

      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-primary mb-2 tracking-tight animate-float transition-colors duration-500">
            MyRadio
          </h1>
          <p className="text-muted-foreground text-lg transition-colors duration-500">
            Broadcast your music to the world
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RadioPlayer
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
            <AudioVisualizer isPlaying={isPlaying} streamUrl={currentTrack.streamUrl} />
            <Playlist tracks={playlist} currentTrack={currentTrack} />
          </div>

          <div className="space-y-6">
            <Listeners listeners={listeners} />
            <LiveReactions currentTrack={currentTrack} />
            <SocialShare currentTrack={currentTrack} />
            <RadioStats stats={stats} />
            <SongHistory history={history} />
          </div>
        </div>
      </div>
    </main>
  )
}
