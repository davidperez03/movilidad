'use client'

// =====================================================
// TABLA DE PROCESOS COMPLETADOS
// Tabla con filtros para reportes de procesos completados
// =====================================================

import { useMemo } from 'react'
import { DataTable } from '@/components/ui/data-table/data-table'
import { columnasTablaCompletados } from './tabla-completados-columns'
import type { DatosReporteCompletados, FiltrosReporte } from '@/lib/movilidad/reportes/tipos'

interface TablaCompletadosProps {
  datos: DatosReporteCompletados[]
  filtros: FiltrosReporte
}

export function TablaCompletados({ datos, filtros }: TablaCompletadosProps) {
  // Filtrar datos según filtros aplicados
  const datosFiltrados = useMemo(() => {
    return datos.filter((d) => {
      // Filtro por fecha inicio
      if (filtros.fechaInicio && d.fecha_completado < filtros.fechaInicio) {
        return false
      }

      // Filtro por fecha fin
      if (filtros.fechaFin && d.fecha_completado > filtros.fechaFin) {
        return false
      }

      // Filtro por tipo de proceso
      if (filtros.tipoProceso !== 'todos' && d.proceso_tipo !== filtros.tipoProceso) {
        return false
      }

      return true
    })
  }, [datos, filtros])

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
