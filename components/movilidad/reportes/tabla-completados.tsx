'use client'

import { DataTable } from '@/components/ui/data-table/data-table'
import { columnasTablaCompletados } from './tabla-completados-columns'
import { useFiltrosReporte } from '@/lib/movilidad/reportes/use-filtros-reporte'
import type { DatosReporteCompletados, FiltrosReporte } from '@/lib/movilidad/reportes/tipos'

interface TablaCompletadosProps {
  datos: DatosReporteCompletados[]
  filtros: FiltrosReporte
}

export function TablaCompletados({ datos, filtros }: TablaCompletadosProps) {
  const datosFiltrados = useFiltrosReporte(datos, filtros, 'fecha_completado')

  return (
    <DataTable
      columns={columnasTablaCompletados}
      data={datosFiltrados}
      enablePagination={true}
      pageSize={20}
      pageSizeOptions={[10, 20, 50, 100]}
      enableSorting={true}
      defaultSorting={[{ id: 'fecha_completado', desc: true }]}
      emptyMessage="No se encontraron procesos completados con los filtros aplicados"
    />
  )
}
