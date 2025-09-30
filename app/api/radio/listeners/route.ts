import { NextResponse } from "next/server"

// In-memory listeners state
const listeners = [
  { id: 1, name: "Carlos M.", avatar: "CM", connected: true },
  { id: 2, name: "Ana García", avatar: "AG", connected: true },
  { id: 3, name: "Luis Pérez", avatar: "LP", connected: true },
  { id: 4, name: "María S.", avatar: "MS", connected: false },
]

export async function GET() {
  return NextResponse.json(listeners)
}

export async function POST(request: Request) {
  const body = await request.json()

  // Add or update listener
  if (body.action === "connect") {
    const existingListener = listeners.find((l) => l.id === body.id)
    if (existingListener) {
      existingListener.connected = true
    } else {
      listeners.push({
        id: body.id || Date.now(),
        name: body.name || "Oyente",
        avatar: body.avatar || "OY",
        connected: true,
      })
    }
  } else if (body.action === "disconnect") {
    const listener = listeners.find((l) => l.id === body.id)
    if (listener) {
      listener.connected = false
    }
  }

  return NextResponse.json({ success: true, listeners })
}
