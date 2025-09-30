import { NextResponse } from "next/server"
import { promises as fs } from 'fs'
import path from 'path'

// Configuración del servidor Icecast
const ICECAST_CONFIG = {
  host: process.env.ICECAST_HOST || 'localhost',
  port: process.env.ICECAST_PORT || '8000',
  mountPoint: process.env.ICECAST_MOUNT_POINT || '/stream',
  streamUrl: process.env.NEXT_PUBLIC_STREAM_URL || 'http://localhost:8000/stream'
}

// Tipos para la respuesta
interface CurrentTrack {
  title: string
  artist: string
  album: string
  duration: number
  currentTime: number
  isPlaying: boolean
  streamUrl: string
  listeners: number
  bitrate: number
  isLive: boolean
  genre?: string
  updatedAt: string
}

// Cache para evitar requests excesivos
let trackCache: CurrentTrack | null = null
let lastCacheUpdate = 0
const CACHE_DURATION = 3000 // 3 segundos

async function loadSyncedData(): Promise<any> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'current.json')
    const data = await fs.readFile(dataPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading synced data:', error)
    return null
  }
}

async function fetchStreamStatus() {
  try {
    // Primero intentar cargar datos sincronizados
    const syncedData = await loadSyncedData()
    if (syncedData) {
      return syncedData
    }

    // Fallback: intentar conectar directamente a Icecast
    const response = await fetch(`http://${ICECAST_CONFIG.host}:${ICECAST_CONFIG.port}/status-json.xsl`, {
      signal: AbortSignal.timeout(5000)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.icestats && data.icestats.source) {
      const source = Array.isArray(data.icestats.source) 
        ? data.icestats.source[0] 
        : data.icestats.source
      
      return {
        title: source.title || 'Sin título',
        artist: source.artist || 'Artista desconocido',
        genre: source.genre || 'Música',
        isLive: true,
        listeners: parseInt(source.listeners) || 0,
        bitrate: parseInt(source.bitrate) || 128,
        sampleRate: parseInt(source.samplerate) || 44100,
        updatedAt: new Date().toISOString()
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching stream status:', error)
    return null
  }
}

async function getCurrentTrack(): Promise<CurrentTrack> {
  // Verificar cache
  const now = Date.now()
  if (trackCache && (now - lastCacheUpdate) < CACHE_DURATION) {
    return trackCache
  }

  const streamStatus = await fetchStreamStatus()
  
  let currentTrack: CurrentTrack = {
    title: "Esperando transmisión...",
    artist: "MyRadio",
    album: "",
    duration: 0,
    currentTime: 0,
    isPlaying: false,
    streamUrl: ICECAST_CONFIG.streamUrl,
    listeners: 0,
    bitrate: 0,
    isLive: false,
    genre: "Música",
    updatedAt: new Date().toISOString()
  }

  if (streamStatus) {
    currentTrack = {
      title: streamStatus.title || "Canción desconocida",
      artist: streamStatus.artist || "Artista desconocido",
      album: "", // No disponible en streams
      duration: 0, // No disponible en streams en vivo
      currentTime: 0, // No aplicable para streams en vivo
      isPlaying: streamStatus.isLive || false,
      streamUrl: ICECAST_CONFIG.streamUrl,
      listeners: streamStatus.listeners || 0,
      bitrate: streamStatus.bitrate || 128,
      isLive: streamStatus.isLive || false,
      genre: streamStatus.genre || "Música",
      updatedAt: streamStatus.updatedAt || new Date().toISOString()
    }
  }

  // Actualizar cache
  trackCache = currentTrack
  lastCacheUpdate = now

  return currentTrack
}

export async function GET() {
  try {
    const currentTrack = await getCurrentTrack()
    return NextResponse.json(currentTrack)
  } catch (error) {
    console.error('Error in current track API:', error)
    
    // Fallback en caso de error
    return NextResponse.json({
      title: "Servicio no disponible",
      artist: "MyRadio",
      album: "",
      duration: 0,
      currentTime: 0,
      isPlaying: false,
      streamUrl: ICECAST_CONFIG.streamUrl,
      listeners: 0,
      bitrate: 0,
      isLive: false,
      genre: "Música",
      updatedAt: new Date().toISOString()
    }, { status: 503 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Para streams en vivo, los controles son limitados
    // Solo podemos "conectar" o "desconectar" del stream
    if (body.action === "play" || body.action === "pause") {
      // Limpiar cache para forzar actualización
      trackCache = null
      lastCacheUpdate = 0
      
      const currentTrack = await getCurrentTrack()
      
      // En un stream en vivo, "play" significa que el cliente se conecta
      // "pause" significa que el cliente se desconecta
      return NextResponse.json({
        ...currentTrack,
        isPlaying: body.action === "play" && currentTrack.isLive
      })
    } else if (body.action === "refresh") {
      // Endpoint para forzar actualización de metadatos
      trackCache = null
      lastCacheUpdate = 0
      
      const currentTrack = await getCurrentTrack()
      return NextResponse.json(currentTrack)
    }
    
    return NextResponse.json({ error: "Action not supported for live streams" }, { status: 400 })
  } catch (error) {
    console.error('Error in current track POST:', error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
