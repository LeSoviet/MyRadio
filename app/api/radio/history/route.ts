import { NextResponse } from "next/server"

// In-memory history storage
let songHistory: Array<{
  id: number
  title: string
  artist: string
  playedAt: string
}> = []

let historyIdCounter = 1

export async function GET() {
  return NextResponse.json(songHistory.slice(0, 20)) // Return last 20 songs
}

export async function POST(request: Request) {
  const body = await request.json()

  const newEntry = {
    id: historyIdCounter++,
    title: body.title,
    artist: body.artist,
    playedAt: new Date().toLocaleString(),
  }

  songHistory.unshift(newEntry)

  // Keep only last 100 songs
  if (songHistory.length > 100) {
    songHistory = songHistory.slice(0, 100)
  }

  return NextResponse.json({ success: true, entry: newEntry })
}
