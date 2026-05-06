'use client'

import { useState } from 'react'
import { Download, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { generarExcelHistorialNunc } from '@/lib/nunc/reportes/exportar-excel'
import type { FiltrosNunc } from '@/lib/nunc/reportes/tipos'

export function ExportarHistorialNunc() {
  const [filtros, setFiltros] = useState<FiltrosNunc>({ fechaInicio: null, fechaFin: null })
  const [cargando, setCargando] = useState(false)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const filtrosActivos = !!(filtros.fechaInicio || filtros.fechaFin)

  async function handleExportar() {
    setCargando(true)
    try {
      const params = new URLSearchParams()
      if (filtros.fechaInicio) params.set('fechaInicio', filtros.fechaInicio)
      if (filtros.fechaFin)    params.set('fechaFin',    filtros.fechaFin)

      const res = await fetch(`/api/nunc/reportes?${params}`)
      if (!res.ok) throw new Error(await res.text())

      const { data, total } = await res.json()
      if (!total) {
        toast.error('No hay registros en el rango seleccionado')
        return
      }

      const fecha = new Date().toISOString().split('T')[0]
      await generarExcelHistorialNunc(data, filtros, `nunc-historial-${fecha}`)
      toast.success(`${total} registros exportados`)
    } catch (e) {
      toast.error('Error al generar el historial')
      console.error(e)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="relative flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setMostrarFiltros(v => !v)}
        className={filtrosActivos ? 'border-amber-400 text-amber-700' : ''}
      >
        <Filter className="h-4 w-4 mr-1.5" />
        Historial NUNC
        {filtrosActivos && <span className="ml-1 bg-amber-100 text-amber-700 text-xs px-1 rounded">activo</span>}
      </Button>

      {mostrarFiltros && (
        <div className="absolute top-full right-0 mt-2 z-20 bg-background border rounded-lg shadow-lg p-4 flex flex-col sm:flex-row gap-3 w-[calc(100vw-2rem)] sm:w-auto max-w-sm sm:max-w-none">
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="space-y-1">
              <Label className="text-xs">Desde</Label>
              <Input
                type="date"
                className="h-8 text-sm"
                value={filtros.fechaInicio || ''}
                onChange={e => setFiltros(f => ({ ...f, fechaInicio: e.target.value || null }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Hasta</Label>
              <Input
                type="date"
                className="h-8 text-sm"
                value={filtros.fechaFin || ''}
                onChange={e => setFiltros(f => ({ ...f, fechaFin: e.target.value || null }))}
              />
            </div>
          </div>
          <div className="flex gap-2 items-end justify-end">
            {filtrosActivos && (
              <Button variant="ghost" size="sm" onClick={() => setFiltros({ fechaInicio: null, fechaFin: null })}>
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" onClick={() => { handleExportar(); setMostrarFiltros(false) }} disabled={cargando}>
              <Download className="h-4 w-4 mr-1.5" />
              {cargando ? 'Generando...' : 'Exportar'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
