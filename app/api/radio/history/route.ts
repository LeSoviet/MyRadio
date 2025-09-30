import { NextResponse } from "next/server"
import { promises as fs } from 'fs'
import path from 'path'

// Función para cargar historial sincronizado
async function loadHistoryData(): Promise<any[]> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'history.json')
    const data = await fs.readFile(dataPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading history data:', error)
    // Fallback a historial vacío
    return []
  }
}

export async function GET() {
  try {
    const history = await loadHistoryData()
    return NextResponse.json(history.slice(0, 20)) // Devolver últimas 20 canciones
  } catch (error) {
    console.error('Error in history API:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const history = await loadHistoryData()

    const newEntry = {
      id: Date.now().toString(),
      title: body.title,
      artist: body.artist,
      genre: body.genre || 'Música',
      playedAt: new Date().toISOString(),
      duration: body.duration || 180
    }

    history.unshift(newEntry)

    // Mantener solo las últimas 100 canciones
    if (history.length > 100) {
      history.splice(100)
    }

    // Guardar historial actualizado
    const dataPath = path.join(process.cwd(), 'data', 'history.json')
    await fs.writeFile(dataPath, JSON.stringify(history, null, 2))

    return NextResponse.json({ success: true, entry: newEntry })
  } catch (error) {
    console.error('Error updating history:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
