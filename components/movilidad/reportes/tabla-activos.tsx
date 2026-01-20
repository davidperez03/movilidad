'use client'

import { DataTable } from '@/components/ui/data-table/data-table'
import { columnasTablaActivos } from './tabla-activos-columns'
import { useFiltrosReporte } from '@/lib/movilidad/reportes/use-filtros-reporte'
import type { DatosReporteActivos, FiltrosReporte } from '@/lib/movilidad/reportes/tipos'

interface TablaActivosProps {
  datos: DatosReporteActivos[]
  filtros: FiltrosReporte
}

export function TablaActivos({ datos, filtros }: TablaActivosProps) {
  const datosFiltrados = useFiltrosReporte(datos, filtros, 'fecha_tramite')

  return (
    <DataTable
      columns={columnasTablaActivos}
      data={datosFiltrados}
      enablePagination={true}
      pageSize={20}
      pageSizeOptions={[10, 20, 50, 100]}
      enableSorting={true}
      defaultSorting={[{ id: 'fecha_tramite', desc: true }]}
      emptyMessage="No se encontraron procesos activos con los filtros aplicados"
    />
  )
}
