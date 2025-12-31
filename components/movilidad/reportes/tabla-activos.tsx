'use client'

// =====================================================
// TABLA DE PROCESOS ACTIVOS
// Tabla con filtros para reportes de procesos activos
// =====================================================

import { useMemo } from 'react'
import { DataTable } from '@/components/ui/data-table/data-table'
import { columnasTablaActivos } from './tabla-activos-columns'
import type { DatosReporteActivos, FiltrosReporte } from '@/lib/movilidad/reportes/tipos'

interface TablaActivosProps {
  datos: DatosReporteActivos[]
  filtros: FiltrosReporte
}

export function TablaActivos({ datos, filtros }: TablaActivosProps) {
  // Filtrar datos según filtros aplicados
  const datosFiltrados = useMemo(() => {
    return datos.filter((d) => {
      // Filtro por fecha inicio
      if (filtros.fechaInicio && d.fecha_tramite < filtros.fechaInicio) {
        return false
      }

      // Filtro por fecha fin
      if (filtros.fechaFin && d.fecha_tramite > filtros.fechaFin) {
        return false
      }

      // Filtro por estado
      if (filtros.estado !== 'todos' && d.proceso_estado !== filtros.estado) {
        return false
      }

      // Filtro por organismo
      if (filtros.organismoId !== 'todos' && d.organismo_id !== filtros.organismoId) {
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
