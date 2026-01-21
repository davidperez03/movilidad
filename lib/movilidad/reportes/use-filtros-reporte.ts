'use client'

import { useMemo } from 'react'
import type { FiltrosReporte } from './tipos'

interface DatosConFechas {
  fecha_tramite?: string
  fecha_completado?: string
  fecha_vencimiento?: string
  proceso_estado?: string
  estado?: string
  organismo_id?: string
  proceso_tipo?: string
}

export function useFiltrosReporte<T extends DatosConFechas>(
  datos: T[],
  filtros: FiltrosReporte,
  campoFecha: 'fecha_tramite' | 'fecha_completado' | 'fecha_vencimiento' = 'fecha_tramite'
): T[] {
  return useMemo(() => {
    return datos.filter((d) => {
      const fecha = d[campoFecha]

      if (filtros.fechaInicio && fecha && fecha < filtros.fechaInicio) {
        return false
      }

      if (filtros.fechaFin && fecha && fecha > filtros.fechaFin) {
        return false
      }

      const estado = d.proceso_estado || d.estado
      if (filtros.estado !== 'todos' && estado !== filtros.estado) {
        return false
      }

      if (filtros.organismoId !== 'todos' && d.organismo_id !== filtros.organismoId) {
        return false
      }

      if (filtros.tipoProceso !== 'todos' && d.proceso_tipo !== filtros.tipoProceso) {
        return false
      }

      return true
    })
  }, [datos, filtros, campoFecha])
}
