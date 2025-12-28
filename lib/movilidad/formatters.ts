import type { TipoProceso } from './config'

/**
 * Formatea el estado de un proceso para mostrar en UI
 * Convierte: "en_tramite" -> "En Tramite"
 */
export function formatearEstadoProceso(estado: string): string {
  return estado.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

/**
 * Formatea una fecha de manera consistente para evitar problemas de hidratación
 * Retorna formato: DD/MM/AAAA
 */
export function formatearFecha(fecha: string | Date): string {
  if (!fecha) return ''

  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  const dia = String(date.getUTCDate()).padStart(2, '0')
  const mes = String(date.getUTCMonth() + 1).padStart(2, '0')
  const anio = date.getUTCFullYear()

  return `${dia}/${mes}/${anio}`
}

/**
 * Formatea una fecha y hora de manera consistente
 * Retorna formato: DD/MM/AAAA HH:MM
 */
export function formatearFechaHora(fecha: string | Date): string {
  if (!fecha) return ''

  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  const dia = String(date.getUTCDate()).padStart(2, '0')
  const mes = String(date.getUTCMonth() + 1).padStart(2, '0')
  const anio = date.getUTCFullYear()
  const horas = String(date.getUTCHours()).padStart(2, '0')
  const minutos = String(date.getUTCMinutes()).padStart(2, '0')

  return `${dia}/${mes}/${anio} ${horas}:${minutos}`
}

/**
 * Calcula los días restantes hasta una fecha de vencimiento
 * Retorna número positivo si aún no ha vencido, negativo si ya venció
 */
export function calcularDiasRestantes(fechaVencimiento: string): number {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0) // Normalizar a medianoche

  const vencimiento = new Date(fechaVencimiento)
  vencimiento.setHours(0, 0, 0, 0) // Normalizar a medianoche

  const diferencia = Math.ceil(
    (vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
  )

  return diferencia
}

/**
 * Obtiene la variante de Badge según el estado del proceso
 */
export function getVariantePorEstado(
  estado: string,
  tipoProceso?: TipoProceso
): 'default' | 'secondary' | 'destructive' | 'outline' {
  // Estados completados con éxito
  if (estado === 'trasladado' || estado === 'radicado') {
    return 'default'
  }

  // Estado con problemas
  if (estado === 'con_novedades') {
    return 'destructive'
  }

  // Estados intermedios
  if (estado === 'revisado' || estado === 'recibido' || estado === 'en_tramite') {
    return 'secondary'
  }

  // Estado devuelto
  if (estado === 'devuelto') {
    return 'outline'
  }

  return 'secondary'
}

/**
 * Obtiene la variante de Badge según los días restantes para vencimiento
 */
export function getVariantePorVencimiento(
  diasRestantes: number
): 'default' | 'destructive' | 'outline' {
  if (diasRestantes < 0) {
    return 'destructive' // Vencido
  }

  if (diasRestantes < 3) {
    return 'destructive' // Crítico
  }

  if (diasRestantes < 7) {
    return 'outline' // Advertencia
  }

  return 'default' // Normal
}

/**
 * Formatea los días restantes para mostrar en UI
 */
export function formatearDiasRestantes(diasRestantes: number): string {
  if (diasRestantes < 0) {
    const diasVencidos = Math.abs(diasRestantes)
    return diasVencidos === 1 ? 'Vencido hace 1 día' : `Vencido hace ${diasVencidos} días`
  }

  if (diasRestantes === 0) {
    return 'Vence hoy'
  }

  if (diasRestantes === 1) {
    return 'Vence mañana'
  }

  return `${diasRestantes} días`
}
