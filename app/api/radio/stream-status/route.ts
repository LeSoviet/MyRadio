import { NextResponse } from 'next/server'

// Configuración del servidor Icecast
const ICECAST_CONFIG = {
  host: process.env.ICECAST_HOST || 'localhost',
  port: process.env.ICECAST_PORT || '8000',
  adminUser: process.env.ICECAST_ADMIN_USER || 'admin',
  adminPassword: process.env.ICECAST_ADMIN_PASSWORD || 'admin2024',
  mountPoint: process.env.ICECAST_MOUNT_POINT || '/stream'
}

// Tipos para la respuesta de Icecast
interface IcecastSource {
  mount: string
  bitrate: number
  genre: string
  listener_peak: number
  listeners: number
  listenurl: string
  server_description: string
  server_name: string
  server_type: string
  server_url: string
  stream_start: string
  stream_start_iso8601: string
  title?: string
  artist?: string
  album?: string
}

interface IcecastStats {
  admin: string
  host: string
  location: string
  server_id: string
  server_start: string
  server_start_iso8601: string
  source?: IcecastSource[]
}

interface StreamStatus {
  isOnline: boolean
  listeners: number
  peakListeners: number
  bitrate: number
  currentTrack: {
    title: string
    artist: string
    album?: string
  } | null
  streamUrl: string
  uptime: string
  serverInfo: {
    version: string
    host: string
    location: string
  }
  lastUpdate: string
}

// Cache para evitar requests excesivos
let statusCache: StreamStatus | null = null
let lastCacheUpdate = 0
const CACHE_DURATION = 5000 // 5 segundos

async function fetchIcecastStatus(): Promise<IcecastStats | null> {
  try {
    const statusUrl = `http://${ICECAST_CONFIG.host}:${ICECAST_CONFIG.port}/status-json.xsl`
    
    const response = await fetch(statusUrl, {
      headers: {
        'User-Agent': 'MyRadio/1.0',
      },
      // Timeout de 5 segundos
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.icestats || null
  } catch (error) {
    console.error('Error fetching Icecast status:', error)
    return null
  }
}

function parseMetadata(title?: string): { title: string; artist: string; album?: string } | null {
  if (!title) return null

  // Formato común: "Artist - Title"
  const parts = title.split(' - ')
  if (parts.length >= 2) {
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim()
    }
  }

  // Si no hay separador, asumir que todo es el título
  return {
    artist: 'Unknown Artist',
    title: title.trim()
  }
}

function calculateUptime(startTime: string): string {
  try {
    const start = new Date(startTime)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  } catch {
    return 'Unknown'
  }
}

async function getStreamStatus(): Promise<StreamStatus> {
  // Verificar cache
  const now = Date.now()
  if (statusCache && (now - lastCacheUpdate) < CACHE_DURATION) {
    return statusCache
  }

  const icecastStats = await fetchIcecastStatus()
  
  // Estado por defecto (offline)
  let status: StreamStatus = {
    isOnline: false,
    listeners: 0,
    peakListeners: 0,
    bitrate: 0,
    currentTrack: null,
    streamUrl: `http://${ICECAST_CONFIG.host}:${ICECAST_CONFIG.port}${ICECAST_CONFIG.mountPoint}`,
    uptime: '0m',
    serverInfo: {
      version: 'Unknown',
      host: ICECAST_CONFIG.host,
      location: 'Unknown'
    },
    lastUpdate: new Date().toISOString()
  }

  if (icecastStats) {
    // Información del servidor
    status.serverInfo = {
      version: icecastStats.server_id || 'Unknown',
      host: icecastStats.host || ICECAST_CONFIG.host,
      location: icecastStats.location || 'Unknown'
    }

    // Buscar nuestro mount point
    const source = icecastStats.source?.find(s => s.mount === ICECAST_CONFIG.mountPoint)
    
    if (source) {
      status.isOnline = true
      status.listeners = source.listeners || 0
      status.peakListeners = source.listener_peak || 0
      status.bitrate = source.bitrate || 0
      status.uptime = calculateUptime(source.stream_start_iso8601 || source.stream_start)
      
      // Parsear metadatos de la canción actual
      if (source.title) {
        status.currentTrack = parseMetadata(source.title)
      }
    }
  }

  // Actualizar cache
  statusCache = status
  lastCacheUpdate = now

  return status
}

export async function GET() {
  try {
    const status = await getStreamStatus()
    
    return NextResponse.json({
      success: true,
      data: status
    })
  } catch (error) {
    console.error('Error in stream-status API:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch stream status',
      data: {
        isOnline: false,
        listeners: 0,
        peakListeners: 0,
        bitrate: 0,
        currentTrack: null,
        streamUrl: `http://${ICECAST_CONFIG.host}:${ICECAST_CONFIG.port}${ICECAST_CONFIG.mountPoint}`,
        uptime: '0m',
        serverInfo: {
          version: 'Unknown',
          host: ICECAST_CONFIG.host,
          location: 'Unknown'
        },
        lastUpdate: new Date().toISOString()
      }
    }, { status: 500 })
  }
}

// Endpoint para forzar actualización del cache
export async function POST() {
  try {
    // Limpiar cache
    statusCache = null
    lastCacheUpdate = 0
    
    // Obtener estado actualizado
    const status = await getStreamStatus()
    
    return NextResponse.json({
      success: true,
      message: 'Cache refreshed',
      data: status
    })
  } catch (error) {
    console.error('Error refreshing stream status:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh stream status'
    }, { status: 500 })
  }
}