import { NextResponse } from "next/server"
import { promises as fs } from 'fs'
import path from 'path'

interface Reaction {
  emoji: string
  track: string
  artist: string
  timestamp: number
  id?: string
}

// Función para cargar reacciones sincronizadas
async function loadReactionsData(): Promise<Reaction[]> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'reactions.json')
    const data = await fs.readFile(dataPath, 'utf-8')
    const parsed = JSON.parse(data)
    return parsed.reactions || parsed || []
  } catch (error) {
    console.error('Error loading reactions data:', error)
    return []
  }
}

// Función para guardar reacciones
async function saveReactionsData(reactions: Reaction[]): Promise<void> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'reactions.json')
    
    // Asegurar que el directorio existe
    const dataDir = path.dirname(dataPath)
    await fs.mkdir(dataDir, { recursive: true })
    
    const reactionsData = {
      reactions,
      updatedAt: new Date().toISOString(),
      totalReactions: reactions.length
    }
    
    await fs.writeFile(dataPath, JSON.stringify(reactionsData, null, 2))
  } catch (error) {
    console.error('Error saving reactions data:', error)
  }
}

export async function GET() {
  try {
    const allReactions = await loadReactionsData()
    
    // Retornar reacciones de los últimos 5 minutos
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    const recentReactions = allReactions.filter((r) => r.timestamp > fiveMinutesAgo)

    return NextResponse.json({
      success: true,
      reactions: recentReactions,
      totalReactions: recentReactions.length,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in reactions API:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to load reactions',
      reactions: [],
      totalReactions: 0
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { emoji, track, artist } = body

    if (!emoji || !track || !artist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: emoji, track, artist' 
      }, { status: 400 })
    }

    const newReaction: Reaction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      emoji,
      track,
      artist,
      timestamp: Date.now(),
    }

    // Cargar reacciones existentes
    let reactions = await loadReactionsData()
    reactions.push(newReaction)

    // Mantener solo las últimas 1000 reacciones
    if (reactions.length > 1000) {
      reactions = reactions.slice(-1000)
    }

    // Guardar reacciones actualizadas
    await saveReactionsData(reactions)

    return NextResponse.json({ 
      success: true, 
      reaction: newReaction,
      message: 'Reaction added successfully'
    })
  } catch (error) {
    console.error('Error adding reaction:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to add reaction" 
    }, { status: 500 })
  }
}
