import { NextResponse } from "next/server"

// In-memory state for demo purposes
// In production, this would be replaced with a database or external API
let currentTrack = {
  title: "Waiting for broadcast...",
  artist: "Your Personal Radio",
  album: "",
  duration: 0,
  currentTime: 0,
  isPlaying: false,
}

const playlist = [
  {
    id: 1,
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    duration: 354,
  },
  {
    id: 2,
    title: "Stairway to Heaven",
    artist: "Led Zeppelin",
    album: "Led Zeppelin IV",
    duration: 482,
  },
  {
    id: 3,
    title: "Hotel California",
    artist: "Eagles",
    album: "Hotel California",
    duration: 391,
  },
  {
    id: 4,
    title: "Imagine",
    artist: "John Lennon",
    album: "Imagine",
    duration: 183,
  },
  {
    id: 5,
    title: "Sweet Child O Mine",
    artist: "Guns N' Roses",
    album: "Appetite for Destruction",
    duration: 356,
  },
]

// Auto-increment current time when playing
setInterval(() => {
  if (currentTrack.isPlaying && currentTrack.currentTime < currentTrack.duration) {
    currentTrack.currentTime++
  } else if (currentTrack.isPlaying && currentTrack.currentTime >= currentTrack.duration) {
    // Auto-advance to next track
    const currentIndex = playlist.findIndex((t) => t.title === currentTrack.title)
    const nextIndex = (currentIndex + 1) % playlist.length
    const nextTrack = playlist[nextIndex]
    currentTrack = {
      ...nextTrack,
      currentTime: 0,
      isPlaying: true,
    }
  }
}, 1000)

export async function GET() {
  return NextResponse.json(currentTrack)
}

export async function POST(request: Request) {
  const body = await request.json()

  // Update current track from external source (AIMP, Winamp, Spotify)
  if (body.title) {
    currentTrack = {
      title: body.title,
      artist: body.artist || "Unknown Artist",
      album: body.album || "",
      duration: body.duration || 0,
      currentTime: body.currentTime || 0,
      isPlaying: body.isPlaying ?? true,
    }
  }

  return NextResponse.json({ success: true, currentTrack })
}

// Export state for other routes
export { currentTrack, playlist }
