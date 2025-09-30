import { NextResponse } from "next/server"

// Shared state (in production, use a database or state management)
const radioState = {
  isPlaying: false,
  currentTrackIndex: 0,
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

export async function POST(request: Request) {
  const body = await request.json()

  switch (body.action) {
    case "play-pause":
      radioState.isPlaying = body.isPlaying
      break
    case "next":
      radioState.currentTrackIndex = (radioState.currentTrackIndex + 1) % playlist.length
      break
    case "previous":
      radioState.currentTrackIndex =
        radioState.currentTrackIndex === 0 ? playlist.length - 1 : radioState.currentTrackIndex - 1
      break
  }

  return NextResponse.json({
    success: true,
    state: radioState,
    currentTrack: playlist[radioState.currentTrackIndex],
  })
}

export async function GET() {
  return NextResponse.json({
    state: radioState,
    currentTrack: playlist[radioState.currentTrackIndex],
  })
}
