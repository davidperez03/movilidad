'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-md bg-white rounded-lg border border-red-200 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertCircle className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Error del Sistema</h2>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Ocurrió un error inesperado. Por favor, intenta recargar la página.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <div className="p-3 bg-gray-100 rounded-md mb-4">
                  <p className="text-xs font-mono text-gray-600 break-all">
                    {error.message}
                  </p>
                </div>
              )}
              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Recargar página
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
