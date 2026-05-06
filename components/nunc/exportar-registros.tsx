'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { generarExcelRegistros } from '@/lib/nunc/reportes/exportar-excel'
import type { FilaRegistroNunc } from '@/lib/nunc/reportes/tipos'

interface Props {
  registros: FilaRegistroNunc[]
  codigoSesion: string
  entidad: string
}

export function ExportarRegistrosNunc({ registros, codigoSesion, entidad }: Props) {
  const [cargando, setCargando] = useState(false)

  async function handleExportar() {
    if (!registros.length) {
      toast.error('Esta sesión no tiene registros para exportar')
      return
    }
    setCargando(true)
    try {
      const fecha = new Date().toISOString().split('T')[0]
      await generarExcelRegistros(registros, codigoSesion, entidad, `nunc-${codigoSesion}-${fecha}`)
      toast.success(`${registros.length} registros exportados`)
    } catch {
      toast.error('Error al generar el Excel')
    } finally {
      setCargando(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExportar}
      disabled={cargando || !registros.length}
    >
      <Download className="h-4 w-4 mr-1.5" />
      {cargando ? 'Generando...' : 'Exportar Excel'}
    </Button>
  )
}
