import { NextResponse } from "next/server"
import { promises as fs } from 'fs'
import path from 'path'

// Función para cargar playlist sincronizada
async function loadPlaylistData(): Promise<any[]> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'playlist.json')
    const data = await fs.readFile(dataPath, 'utf-8')
    const parsed = JSON.parse(data)
    return parsed.playlist || parsed || []
  } catch (error) {
    console.error('Error loading playlist data:', error)
    // Fallback a playlist por defecto
    return [
      {
        id: 1,
        title: "Bohemian Rhapsody",
        artist: "Queen",
        album: "A Night at the Opera",
        duration: 354,
        genre: "Rock"
      },
      {
        id: 2,
        title: "Stairway to Heaven",
        artist: "Led Zeppelin",
        album: "Led Zeppelin IV",
        duration: 482,
        genre: "Rock"
      },
      {
        id: 3,
        title: "Hotel California",
        artist: "Eagles",
        album: "Hotel California",
        duration: 391,
        genre: "Rock"
      },
      {
        id: 4,
        title: "Imagine",
        artist: "John Lennon",
        album: "Imagine",
        duration: 183,
        genre: "Pop"
      },
      {
        id: 5,
        title: "Sweet Child O Mine",
        artist: "Guns N' Roses",
        album: "Appetite for Destruction",
        duration: 356,
        genre: "Rock"
      }
    ]
  }
}

export async function GET() {
  try {
    const playlist = await loadPlaylistData()
    return NextResponse.json({
      success: true,
      playlist,
      totalTracks: playlist.length,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in playlist API:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to load playlist',
      playlist: [],
      totalTracks: 0
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Actualizar playlist desde fuente externa
    if (body.playlist && Array.isArray(body.playlist)) {
      const dataPath = path.join(process.cwd(), 'data', 'playlist.json')
      
      // Asegurar que el directorio existe
      const dataDir = path.dirname(dataPath)
      await fs.mkdir(dataDir, { recursive: true })
      
      // Guardar nueva playlist
      const playlistData = {
        playlist: body.playlist,
        updatedAt: new Date().toISOString(),
        totalTracks: body.playlist.length
      }
      
      await fs.writeFile(dataPath, JSON.stringify(playlistData, null, 2))
      
      return NextResponse.json({ 
        success: true, 
        message: 'Playlist updated successfully',
        playlist: body.playlist,
        totalTracks: body.playlist.length
      })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid playlist data' 
    }, { status: 400 })
  } catch (error) {
    console.error('Error updating playlist:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update playlist' 
    }, { status: 500 })
  }
}
