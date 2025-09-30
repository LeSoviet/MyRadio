"use client"

interface RadioVisualizerProps {
  isPlaying: boolean
}

export function RadioVisualizer({ isPlaying }: RadioVisualizerProps) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div
        className={`absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl transition-all duration-1000 ${
          isPlaying ? "animate-pulse-slow scale-110" : "scale-100"
        }`}
      />
      <div
        className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl transition-all duration-1000 ${
          isPlaying ? "animate-float scale-110" : "scale-100"
        }`}
      />
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/10 rounded-full transition-all duration-1000 ${
          isPlaying ? "animate-rotate-slow scale-105" : "scale-100"
        }`}
      />
      <div
        className={`absolute top-1/3 right-1/3 w-64 h-64 bg-primary/3 rounded-full blur-2xl transition-all duration-700 ${
          isPlaying ? "animate-bounce-slow" : ""
        }`}
      />
    </div>
  )
}
