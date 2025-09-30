import { NextResponse } from "next/server"

// Shared playlist state
let playlist = [
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

export async function GET() {
  return NextResponse.json(playlist)
}

export async function POST(request: Request) {
  const body = await request.json()

  // Update playlist from external source
  if (body.playlist && Array.isArray(body.playlist)) {
    playlist = body.playlist
  }

  return NextResponse.json({ success: true, playlist })
}
