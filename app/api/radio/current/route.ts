import { NextResponse } from "next/server"

// Configuración del servidor Icecast
const ICECAST_CONFIG = {
  host: process.env.ICECAST_HOST || 'localhost',
  port: process.env.ICECAST_PORT || '8000',
  mountPoint: process.env.ICECAST_MOUNT_POINT || '/stream'
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
}

// Cache para evitar requests excesivos
let trackCache: CurrentTrack | null = null
let lastCacheUpdate = 0
const CACHE_DURATION = 3000 // 3 segundos

async function fetchStreamStatus() {
  try {
    const response = await fetch(`http://localhost:3000/api/radio/stream-status`, {
      signal: AbortSignal.timeout(5000)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    return data.success ? data.data : null
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
    title: "Waiting for broadcast...",
    artist: "MyRadio",
    album: "",
    duration: 0,
    currentTime: 0,
    isPlaying: false,
    streamUrl: `http://${ICECAST_CONFIG.host}:${ICECAST_CONFIG.port}${ICECAST_CONFIG.mountPoint}`,
    listeners: 0,
    bitrate: 0,
    isLive: false
  }

  if (streamStatus && streamStatus.isOnline) {
    currentTrack = {
      title: streamStatus.currentTrack?.title || "Unknown Track",
      artist: streamStatus.currentTrack?.artist || "Unknown Artist",
      album: streamStatus.currentTrack?.album || "",
      duration: 0, // No disponible en streams en vivo
      currentTime: 0, // No aplicable para streams en vivo
      isPlaying: true,
      streamUrl: streamStatus.streamUrl,
      listeners: streamStatus.listeners,
      bitrate: streamStatus.bitrate,
      isLive: true
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
      title: "Service Unavailable",
      artist: "MyRadio",
      album: "",
      duration: 0,
      currentTime: 0,
      isPlaying: false,
      streamUrl: `http://${ICECAST_CONFIG.host}:${ICECAST_CONFIG.port}${ICECAST_CONFIG.mountPoint}`,
      listeners: 0,
      bitrate: 0,
      isLive: false
    })
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
