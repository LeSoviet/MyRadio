import { NextResponse } from "next/server"
import { promises as fs } from 'fs'
import path from 'path'

// Función para cargar datos sincronizados de oyentes
async function loadListenersData(): Promise<any[]> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'listeners.json')
    const data = await fs.readFile(dataPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading listeners data:', error)
    // Fallback a datos estáticos
    return [
      { 
        id: "listener_1", 
        name: "Carlos M.", 
        avatar: "/placeholder-user.jpg", 
        joinedAt: new Date().toISOString(),
        location: "España"
      },
      { 
        id: "listener_2", 
        name: "Ana García", 
        avatar: "/placeholder-user.jpg", 
        joinedAt: new Date().toISOString(),
        location: "México"
      },
      { 
        id: "listener_3", 
        name: "Luis Pérez", 
        avatar: "/placeholder-user.jpg", 
        joinedAt: new Date().toISOString(),
        location: "Argentina"
      }
    ]
  }
}

export async function GET() {
  try {
    const listeners = await loadListenersData()
    return NextResponse.json(listeners)
  } catch (error) {
    console.error('Error in listeners API:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const listeners = await loadListenersData()

    // Simular conexión/desconexión de oyentes
    if (body.action === "connect") {
      const newListener = {
        id: `listener_${Date.now()}`,
        name: body.name || `Oyente ${listeners.length + 1}`,
        avatar: body.avatar || "/placeholder-user.jpg",
        joinedAt: new Date().toISOString(),
        location: body.location || "Desconocida"
      }
      
      listeners.push(newListener)
      
      // Guardar datos actualizados
      const dataPath = path.join(process.cwd(), 'data', 'listeners.json')
      await fs.writeFile(dataPath, JSON.stringify(listeners, null, 2))
    }

    return NextResponse.json({ success: true, listeners })
  } catch (error) {
    console.error('Error updating listeners:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
