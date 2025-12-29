'use client'

// =====================================================
// TABLA DE PROCESOS POR VENCER
// Tabla con filtros para reportes de procesos por vencer
// =====================================================

import { useMemo } from 'react'
import { DataTable } from '@/components/ui/data-table/data-table'
import { columnasTablaPorVencer } from './tabla-por-vencer-columns'
import type { DatosReportePorVencer, FiltrosReporte } from '@/lib/movilidad/reportes/tipos'

interface TablaPorVencerProps {
  datos: DatosReportePorVencer[]
  filtros: FiltrosReporte
}

export function TablaPorVencer({ datos, filtros }: TablaPorVencerProps) {
  // Filtrar datos según filtros aplicados
  const datosFiltrados = useMemo(() => {
    return datos.filter((d) => {
      // Filtro por estado
      if (filtros.estado !== 'todos' && d.estado !== filtros.estado) {
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
