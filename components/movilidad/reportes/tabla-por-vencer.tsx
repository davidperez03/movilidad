'use client'

import { DataTable } from '@/components/ui/data-table/data-table'
import { columnasTablaPorVencer } from './tabla-por-vencer-columns'
import { useFiltrosReporte } from '@/lib/movilidad/reportes/use-filtros-reporte'
import type { DatosReportePorVencer, FiltrosReporte } from '@/lib/movilidad/reportes/tipos'

interface TablaPorVencerProps {
  datos: DatosReportePorVencer[]
  filtros: FiltrosReporte
}

export function TablaPorVencer({ datos, filtros }: TablaPorVencerProps) {
  const datosFiltrados = useFiltrosReporte(datos, filtros, 'fecha_vencimiento')

  return (
    <DataTable
      columns={columnasTablaPorVencer}
      data={datosFiltrados}
      enablePagination={true}
      pageSize={20}
      pageSizeOptions={[10, 20, 50, 100]}
      enableSorting={true}
      defaultSorting={[{ id: 'dias_restantes', desc: false }]}
      emptyMessage="No se encontraron procesos por vencer con los filtros aplicados"
    />
  )
}
