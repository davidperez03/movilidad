'use client'

import { useState, useMemo } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getNowDateColombia } from '@/lib/utils/date'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { generarExcelSesiones } from '@/lib/nunc/reportes/exportar-excel'
import type { FilaSesionNunc, FiltrosNunc } from '@/lib/nunc/reportes/tipos'

interface Props {
  sesiones: FilaSesionNunc[]
}

export function ExportarSesionesNunc({ sesiones }: Props) {
  const [open, setOpen] = useState(false)
  const [filtros, setFiltros] = useState<FiltrosNunc>({ fechaInicio: null, fechaFin: null })
  const [cargando, setCargando] = useState(false)

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

  async function handleExportar() {
    if (!datosFiltrados.length) {
      toast.error('No hay sesiones para exportar con los filtros aplicados')
      return
    }
    setCargando(true)
    try {
      const fecha = getNowDateColombia()
      await generarExcelSesiones(datosFiltrados, filtros, `nunc-sesiones-${fecha}`)
      toast.success(`${datosFiltrados.length} sesiones exportadas`)
      setOpen(false)
    } catch {
      toast.error('Error al generar el Excel')
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <FileSpreadsheet className="h-4 w-4 mr-1.5" />
        Sesiones Excel
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Exportar Sesiones NUNC</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="desde-ses">Desde</Label>
              <Input
                id="desde-ses"
                type="date"
                value={filtros.fechaInicio || ''}
                onChange={e => setFiltros(f => ({ ...f, fechaInicio: e.target.value || null }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hasta-ses">Hasta</Label>
              <Input
                id="hasta-ses"
                type="date"
                value={filtros.fechaFin || ''}
                onChange={e => setFiltros(f => ({ ...f, fechaFin: e.target.value || null }))}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {datosFiltrados.length} sesión{datosFiltrados.length !== 1 ? 'es' : ''} en el rango seleccionado.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleExportar} disabled={cargando || !datosFiltrados.length}>
              <Download className="h-4 w-4 mr-1.5" />
              {cargando ? 'Generando...' : 'Exportar Excel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
