'use client'

import { DataTable } from '@/components/ui/data-table/data-table'
import { columnasTablaVencidos } from './tabla-vencidos-columns'
import type { DatosReporteVencidos, FiltrosReporte } from '@/lib/movilidad/reportes/tipos'

interface TablaVencidosProps {
  datos: DatosReporteVencidos[]
  filtros: FiltrosReporte
}

export function TablaVencidos({ datos, filtros: _filtros }: TablaVencidosProps) {
  return (
    <DataTable
      columns={columnasTablaVencidos}
      data={datos}
      enablePagination={true}
      pageSize={20}
      pageSizeOptions={[10, 20, 50, 100]}
      enableSorting={true}
      defaultSorting={[{ id: 'dias_vencidos', desc: true }]}
      emptyMessage="No se encontraron procesos vencidos con los filtros aplicados"
    />
  )
}
