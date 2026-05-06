'use client'

import { useState } from 'react'
import { Download, CalendarRange } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { generarExcelHistorialNunc } from '@/lib/nunc/reportes/exportar-excel'
import type { FiltrosNunc } from '@/lib/nunc/reportes/tipos'

export function ExportarHistorialNunc() {
  const [open, setOpen] = useState(false)
  const [filtros, setFiltros] = useState<FiltrosNunc>({ fechaInicio: null, fechaFin: null })
  const [cargando, setCargando] = useState(false)

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
      setOpen(false)
    } catch (e) {
      toast.error('Error al generar el historial')
      console.error(e)
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <CalendarRange className="h-4 w-4 mr-1.5" />
        Historial NUNC
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Historial NUNC</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="desde">Desde</Label>
              <Input
                id="desde"
                type="date"
                value={filtros.fechaInicio || ''}
                onChange={e => setFiltros(f => ({ ...f, fechaInicio: e.target.value || null }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hasta">Hasta</Label>
              <Input
                id="hasta"
                type="date"
                value={filtros.fechaFin || ''}
                onChange={e => setFiltros(f => ({ ...f, fechaFin: e.target.value || null }))}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Sin filtro exporta todos los registros.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleExportar} disabled={cargando}>
              <Download className="h-4 w-4 mr-1.5" />
              {cargando ? 'Generando...' : 'Exportar Excel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
