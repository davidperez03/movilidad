'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useSesiones } from '@/lib/hooks/useSesiones'
import { ListaSesiones } from '@/components/superadmin/sesiones/lista-sesiones'
import { EstadisticasSesiones } from '@/components/superadmin/sesiones/estadisticas-sesiones'

export default function SesionesPage() {
  const {
    sesiones,
    loading,
    cargarSesiones,
    cerrarSesion,
    cerrarSesionesTokenExpirado,
  } = useSesiones()

  const [procesando, setProcesando] = useState(false)

  useEffect(() => {
    cargarSesiones()
  }, [])

  const handleCerrarSesion = async (sesionId: string) => {
    if (!confirm('¿Estás seguro de cerrar esta sesión?')) return

    setProcesando(true)
    try {
      await cerrarSesion(sesionId)
      toast.success('Sesión cerrada correctamente')
      await cargarSesiones()
    } catch (error) {
      toast.error('Error al cerrar la sesión')
    } finally {
      setProcesando(false)
    }
  }

  const handleLimpiarTokensExpirados = async () => {
    setProcesando(true)
    try {
      const cerradas = await cerrarSesionesTokenExpirado()
      if (cerradas > 0) {
        toast.success(`${cerradas} sesión(es) con token expirado cerrada(s)`)
        await cargarSesiones()
      } else {
        toast.info('No hay sesiones con token expirado')
      }
    } catch (error) {
      toast.error('Error al limpiar sesiones')
    } finally {
      setProcesando(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sesiones Activas</h1>
          <p className="text-muted-foreground">
            Gestión y monitoreo de sesiones de usuarios
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={cargarSesiones}
            disabled={procesando}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button
            variant="destructive"
            onClick={handleLimpiarTokensExpirados}
            disabled={procesando}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Limpiar Tokens Expirados
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <EstadisticasSesiones sesiones={sesiones} />

      {/* Lista de sesiones */}
      <ListaSesiones
        sesiones={sesiones}
        onCerrarSesion={handleCerrarSesion}
        procesando={procesando}
      />
    </div>
  )
}
