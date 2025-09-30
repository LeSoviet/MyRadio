'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Users } from 'lucide-react'

interface ActiveListenersProps {
  totalListeners?: number
}

export default function ActiveListeners({ totalListeners = 0 }: ActiveListenersProps) {
  const [currentListeners, setCurrentListeners] = useState(totalListeners)

  // Simulate listener count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentListeners(prev => {
        const change = Math.floor(Math.random() * 5) - 2 // -2 to +2
        const newCount = Math.max(0, prev + change)
        return newCount
      })
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  // Update when prop changes
  useEffect(() => {
    setCurrentListeners(totalListeners)
  }, [totalListeners])

  return (
    <div className="fixed top-4 right-20 z-30">
      <Card className="p-3 bg-card/90 backdrop-blur-sm border-border/50 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {currentListeners} oyentes
          </span>
        </div>
      </Card>
    </div>
  )
}