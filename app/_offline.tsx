import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw, Radio } from "lucide-react"

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit">
            <WifiOff className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Sin conexión
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            No hay conexión a internet disponible
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
              <Radio className="h-5 w-5" />
              <span className="font-medium">MiRadio</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              La aplicación está disponible offline con funcionalidad limitada
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
            <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
              Funciones disponibles offline:
            </h3>
            <ul className="space-y-1 text-left">
              <li>• Interfaz de usuario</li>
              <li>• Configuraciones guardadas</li>
              <li>• Historial local</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleRetry}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar conexión
            </Button>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              La aplicación se reconectará automáticamente cuando la conexión esté disponible
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}