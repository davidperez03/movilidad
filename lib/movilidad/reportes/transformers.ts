import type { DatosReporteCompletados } from './tipos'

interface TrasladoData {
  id: string
  cuenta_id: string
  estado: string
  fecha_tramite: string
  fecha_completado: string
  observaciones: string | null
  creado_en: string
  cuenta: { placa: string; numero_cuenta: string; tipo_servicio: string } | null
  organismo_destino: { nombre: string } | null
  creado_por_perfil: { nombre_completo: string } | null
}

interface RadicacionData {
  id: string
  cuenta_id: string
  estado: string
  fecha_tramite: string
  fecha_completado: string
  observaciones: string | null
  creado_en: string
  cuenta: { placa: string; numero_cuenta: string; tipo_servicio: string } | null
  organismo_origen: { nombre: string } | null
  creado_por_perfil: { nombre_completo: string } | null
}

function calcularDuracionDias(fechaInicio: string, fechaFin: string): number {
  const inicio = new Date(fechaInicio)
  const fin = new Date(fechaFin)
  return Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
}

export function transformarTraslado(traslado: TrasladoData): DatosReporteCompletados | null {
  if (!traslado.cuenta || !traslado.organismo_destino || !traslado.creado_por_perfil) {
    return null
  }

  const duracionDias = calcularDuracionDias(traslado.creado_en, traslado.fecha_completado)

  return {
    cuenta_id: traslado.cuenta_id,
    placa: traslado.cuenta.placa,
    numero_cuenta: traslado.cuenta.numero_cuenta,
    tipo_servicio: traslado.cuenta.tipo_servicio,
    proceso_tipo: 'traslado',
    proceso_id: traslado.id,
    estado: traslado.estado,
    fecha_tramite: traslado.fecha_tramite,
    fecha_completado: traslado.fecha_completado,
    duracion_dias: duracionDias,
    organismo: traslado.organismo_destino.nombre,
    responsable: traslado.creado_por_perfil.nombre_completo,
    observaciones: traslado.observaciones ?? undefined,
    creado_en: traslado.creado_en,
  }
}

export function transformarRadicacion(radicacion: RadicacionData): DatosReporteCompletados | null {
  if (!radicacion.cuenta || !radicacion.organismo_origen || !radicacion.creado_por_perfil) {
    return null
  }

  const duracionDias = calcularDuracionDias(radicacion.creado_en, radicacion.fecha_completado)

  return {
    cuenta_id: radicacion.cuenta_id,
    placa: radicacion.cuenta.placa,
    numero_cuenta: radicacion.cuenta.numero_cuenta,
    tipo_servicio: radicacion.cuenta.tipo_servicio,
    proceso_tipo: 'radicacion',
    proceso_id: radicacion.id,
    estado: radicacion.estado,
    fecha_tramite: radicacion.fecha_tramite,
    fecha_completado: radicacion.fecha_completado,
    duracion_dias: duracionDias,
    organismo: radicacion.organismo_origen.nombre,
    responsable: radicacion.creado_por_perfil.nombre_completo,
    observaciones: radicacion.observaciones ?? undefined,
    creado_en: radicacion.creado_en,
  }
}

export function ordenarPorFechaCompletado(
  resultados: DatosReporteCompletados[]
): DatosReporteCompletados[] {
  return resultados.sort(
    (a, b) => new Date(b.fecha_completado).getTime() - new Date(a.fecha_completado).getTime()
  )
}
