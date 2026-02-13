import type { TipoProceso } from './config'

const MILISEGUNDOS_DIA = 1000 * 60 * 60 * 24
const ZONA_HORARIA_COLOMBIA = 'America/Bogota'

function normalizarFecha(fecha: string | Date): Date | null {
  if (fecha instanceof Date) {
    if (Number.isNaN(fecha.getTime())) return null
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
  }

  const valor = fecha.trim()
  if (!valor) return null

  const match = valor.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) {
    const parsed = new Date(valor)
    if (Number.isNaN(parsed.getTime())) return null
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
  }

  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const parsed = new Date(year, month, day)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function obtenerHoyColombia(): Date | null {
  const hoyColombia = new Intl.DateTimeFormat('sv-SE', {
    timeZone: ZONA_HORARIA_COLOMBIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  return normalizarFecha(hoyColombia)
}

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
  const hoy = obtenerHoyColombia()
  const vencimiento = normalizarFecha(fechaVencimiento)
  if (!hoy || !vencimiento) return 0

  const diferencia = Math.ceil(
    (vencimiento.getTime() - hoy.getTime()) / MILISEGUNDOS_DIA
  )

  return diferencia
}

/**
 * Calcula días calendario vencidos (no hábiles) a partir de la fecha de vencimiento.
 * Retorna 0 si aún no está vencido o vence hoy.
 */
export function calcularDiasVencidosCalendario(fechaVencimiento: string | Date | null | undefined): number {
  if (!fechaVencimiento) return 0

  const hoy = obtenerHoyColombia()
  const vencimiento = normalizarFecha(fechaVencimiento)
  if (!hoy || !vencimiento) return 0

  const diferencia = Math.floor((hoy.getTime() - vencimiento.getTime()) / MILISEGUNDOS_DIA)
  return Math.max(diferencia, 0)
}

export function formatearVencidoHace(diasVencidos: number): string {
  return diasVencidos <= 1 ? 'Vencido hace un día' : `Vencido hace ${diasVencidos} días`
}

/**
 * Obtiene la variante de Badge según el estado del proceso
 */
export function getVariantePorEstado(
  estado: string,
  tipoProceso?: TipoProceso
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (estado) {
    // Completados con éxito
    case 'trasladado':
    case 'radicado':
      return 'default'

    // En progreso avanzado
    case 'aprobado':
    case 'enviado_organismo':
    case 'enviado_devolucion':
      return 'default'

    // En progreso inicial
    case 'sin_asignar':
    case 'revisado':
    case 'recibido':
    case 'en_tramite':
      return 'secondary'

    // Problemas
    case 'con_novedades':
      return 'destructive'

    // Devuelto
    case 'devuelto':
      return 'outline'

    default:
      return 'secondary'
  }
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
    return formatearVencidoHace(diasVencidos)
  }

  if (diasRestantes === 0) {
    return 'Vence hoy'
  }

  if (diasRestantes === 1) {
    return 'Vence mañana'
  }

  return `${diasRestantes} días`
}
