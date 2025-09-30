import { NextResponse } from "next/server"
import { promises as fs } from 'fs'
import path from 'path'

// Función para cargar estadísticas sincronizadas
async function loadStatsData(): Promise<any> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'stats.json')
    const data = await fs.readFile(dataPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading stats data:', error)
    // Fallback a estadísticas por defecto
    return {
      totalListeners: 0,
      peakListeners: 0,
      streamUptime: 0,
      bitrate: 128,
      sampleRate: 44100,
      startTime: Date.now()
    }
  }
}

export async function GET() {
  try {
    const stats = await loadStatsData()
    
    // Calcular uptime
    const uptimeSeconds = stats.streamUptime || 0
    const hours = Math.floor(uptimeSeconds / 3600)
    const minutes = Math.floor((uptimeSeconds % 3600) / 60)
    
    return NextResponse.json({
      uptime: `${hours}h ${minutes}m`,
      totalListeners: stats.totalListeners || 0,
      peakListeners: stats.peakListeners || 0,
      currentListeners: stats.totalListeners || 0,
      bitrate: stats.bitrate || 128,
      sampleRate: stats.sampleRate || 44100,
      streamUptime: uptimeSeconds,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in stats API:', error)
    return NextResponse.json({
      uptime: "0h 0m",
      totalListeners: 0,
      peakListeners: 0,
      currentListeners: 0,
      bitrate: 128,
      sampleRate: 44100,
      streamUptime: 0,
      updatedAt: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const stats = await loadStatsData()

    // Actualizar estadísticas basadas en acciones
    if (body.action === "song-played") {
      // Las canciones se actualizan automáticamente por el script de sincronización
    } else if (body.action === "listener-joined") {
      stats.totalListeners = Math.max(0, (stats.totalListeners || 0) + 1)
      stats.peakListeners = Math.max(stats.peakListeners || 0, stats.totalListeners)
    } else if (body.action === "listener-left") {
      stats.totalListeners = Math.max(0, (stats.totalListeners || 0) - 1)
    }

    // Guardar estadísticas actualizadas
    const dataPath = path.join(process.cwd(), 'data', 'stats.json')
    await fs.writeFile(dataPath, JSON.stringify(stats, null, 2))

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error('Error updating stats:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
