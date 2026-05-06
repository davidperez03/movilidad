'use client'

import { useState, useMemo } from 'react'
import { Download, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { generarExcelSesiones } from '@/lib/nunc/reportes/exportar-excel'
import type { FilaSesionNunc, FiltrosNunc } from '@/lib/nunc/reportes/tipos'

interface Props {
  sesiones: FilaSesionNunc[]
}

export function ExportarSesionesNunc({ sesiones }: Props) {
  const [filtros, setFiltros] = useState<FiltrosNunc>({ fechaInicio: null, fechaFin: null })
  const [cargando, setCargando] = useState(false)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const datosFiltrados = useMemo(() => {
    return sesiones
      .filter(s => {
        const fecha = new Date(s.creado_en)
        if (filtros.fechaInicio && fecha < new Date(filtros.fechaInicio + 'T00:00:00')) return false
        if (filtros.fechaFin    && fecha > new Date(filtros.fechaFin    + 'T23:59:59')) return false
        return true
      })
      .sort((a, b) => new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime())
  }, [sesiones, filtros])

  const filtrosActivos = !!(filtros.fechaInicio || filtros.fechaFin)

  async function handleExportar() {
    if (!datosFiltrados.length) {
      toast.error('No hay sesiones para exportar con los filtros aplicados')
      return
    }
    setCargando(true)
    try {
      const fecha = new Date().toISOString().split('T')[0]
      await generarExcelSesiones(datosFiltrados, filtros, `nunc-sesiones-${fecha}`)
      toast.success(`${datosFiltrados.length} sesiones exportadas`)
    } catch {
      toast.error('Error al generar el Excel')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setMostrarFiltros(v => !v)}
        className={filtrosActivos ? 'border-amber-400 text-amber-700' : ''}
      >
        <Filter className="h-4 w-4 mr-1.5" />
        Filtrar
        {filtrosActivos && <span className="ml-1 bg-amber-100 text-amber-700 text-xs px-1 rounded">activo</span>}
      </Button>

      {mostrarFiltros && (
        <div className="absolute top-full right-0 mt-2 z-10 bg-background border rounded-lg shadow-lg p-4 flex flex-col sm:flex-row gap-3 w-[calc(100vw-2rem)] sm:w-auto max-w-sm sm:max-w-none">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiltros({ fechaInicio: null, fechaFin: null })}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          </div>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleExportar}
        disabled={cargando}
      >
        <Download className="h-4 w-4 mr-1.5" />
        {cargando ? 'Generando...' : `Excel (${datosFiltrados.length})`}
      </Button>
    </div>
  )
}
