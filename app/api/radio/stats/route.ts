import { NextResponse } from "next/server"

// In-memory stats storage
const stats = {
  startTime: Date.now(),
  totalSongs: 0,
  totalListeners: 0,
  currentListeners: 0,
}

export async function GET() {
  const uptime = Date.now() - stats.startTime
  const hours = Math.floor(uptime / (1000 * 60 * 60))
  const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60))

  return NextResponse.json({
    uptime: `${hours}h ${minutes}m`,
    totalSongs: stats.totalSongs,
    totalListeners: stats.totalListeners,
    currentListeners: stats.currentListeners,
  })
}

export async function POST(request: Request) {
  const body = await request.json()

  if (body.action === "song-played") {
    stats.totalSongs++
  } else if (body.action === "listener-joined") {
    stats.currentListeners++
    stats.totalListeners++
  } else if (body.action === "listener-left") {
    stats.currentListeners = Math.max(0, stats.currentListeners - 1)
  }

  return NextResponse.json({ success: true, stats })
}
