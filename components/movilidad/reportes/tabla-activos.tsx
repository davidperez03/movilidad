'use client'

import { DataTable } from '@/components/ui/data-table/data-table'
import { columnasTablaActivos } from './tabla-activos-columns'
import type { DatosReporteActivos, FiltrosReporte } from '@/lib/movilidad/reportes/tipos'

interface TablaActivosProps {
  datos: DatosReporteActivos[]
  filtros: FiltrosReporte
}

export function TablaActivos({ datos, filtros: _filtros }: TablaActivosProps) {
  return (
    <DataTable
      columns={columnasTablaActivos}
      data={datos}
      enablePagination={true}
      pageSize={20}
      pageSizeOptions={[10, 20, 50, 100]}
      enableSorting={true}
      defaultSorting={[{ id: 'fecha_tramite', desc: true }]}
      emptyMessage="No se encontraron procesos activos con los filtros aplicados"
    />
  )
}
