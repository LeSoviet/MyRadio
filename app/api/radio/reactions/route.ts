import { NextResponse } from "next/server"

// In-memory storage for reactions (use a database in production)
let reactions: Array<{
  emoji: string
  track: string
  artist: string
  timestamp: number
}> = []

export async function GET() {
  // Return reactions from the last 5 minutes
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
  const recentReactions = reactions.filter((r) => r.timestamp > fiveMinutesAgo)

  return NextResponse.json(recentReactions)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { emoji, track, artist } = body

    const newReaction = {
      emoji,
      track,
      artist,
      timestamp: Date.now(),
    }

    reactions.push(newReaction)

    // Keep only last 1000 reactions
    if (reactions.length > 1000) {
      reactions = reactions.slice(-1000)
    }

    return NextResponse.json({ success: true, reaction: newReaction })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add reaction" }, { status: 500 })
  }
}
