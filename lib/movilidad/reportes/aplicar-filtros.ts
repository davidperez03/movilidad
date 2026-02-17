import type { FiltrosReporte } from './tipos'

interface DatosFiltrablesReporte {
  fecha_tramite?: string | null
  fecha_completado?: string | null
  fecha_vencimiento?: string | null
  creado_en?: string | null
  estado?: string | null
  proceso_estado?: string | null
  proceso_tipo?: string | null
  organismo_id?: string | null
  responsable?: string | null
}

export function aplicarFiltrosReporte<T extends DatosFiltrablesReporte>(
  datos: T[],
  filtros: FiltrosReporte,
  campoFecha: 'fecha_tramite' | 'fecha_completado' | 'fecha_vencimiento' | 'creado_en'
): T[] {
  return datos.filter((dato) => {
    const fechaDato = dato[campoFecha] || dato.fecha_tramite || dato.fecha_completado || dato.creado_en

    if (filtros.fechaInicio && fechaDato && fechaDato < filtros.fechaInicio) {
      return false
    }

    if (filtros.fechaFin && fechaDato && fechaDato > filtros.fechaFin) {
      return false
    }

    const estadoDato = dato.estado || dato.proceso_estado
    if (filtros.estado !== 'todos' && estadoDato !== filtros.estado) {
      return false
    }

    if (filtros.tipoProceso !== 'todos' && dato.proceso_tipo !== filtros.tipoProceso) {
      return false
    }

    if (filtros.organismoId !== 'todos' && dato.organismo_id !== filtros.organismoId) {
      return false
    }

    if (filtros.responsable !== 'todos' && dato.responsable !== filtros.responsable) {
      return false
    }

    return true
  })
}
