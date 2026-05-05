import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import type {
  FiltrosReporte,
  DatosReporteActivos,
  DatosReporteCompletados,
  DatosReportePorVencer,
  DatosReporteVencidos,
  Organismo,
  Responsable,
} from './tipos'

export async function obtenerDatosActivos(
  filtros: FiltrosReporte
): Promise<DatosReporteActivos[]> {
  const supabase = await createClient()

  let query = supabase
    .from('mov_vista_proceso_activo')
    .select('*')
    .not('proceso_tipo', 'is', null)
    .not('proceso_estado', 'in', '(trasladado,radicado,devuelto)')

  // Aplicar filtros
  if (filtros.fechaInicio) {
    query = query.gte('fecha_tramite', filtros.fechaInicio)
  }

  if (filtros.fechaFin) {
    query = query.lte('fecha_tramite', filtros.fechaFin)
  }

  if (filtros.estado !== 'todos') {
    query = query.eq('proceso_estado', filtros.estado)
  }

  if (filtros.organismoId !== 'todos') {
    query = query.eq('organismo_id', filtros.organismoId)
  }

  if (filtros.tipoProceso !== 'todos') {
    query = query.eq('proceso_tipo', filtros.tipoProceso)
  }

  // Ordenar por días restantes (más urgente primero)
  query = query.order('dias_restantes', { ascending: true, nullsFirst: false })

  const { data, error } = await query

  if (error) {
    logger.error('Error obteniendo datos activos:', error)
    return []
  }

  return data as DatosReporteActivos[]
}

export async function obtenerDatosCompletados(
  filtros: FiltrosReporte
): Promise<DatosReporteCompletados[]> {
  const supabase = await createClient()

  let query = supabase
    .from('mov_vista_procesos_completados')
    .select('*')
    .order('fecha_completado', { ascending: false })

  if (filtros.fechaInicio) query = query.gte('fecha_completado', filtros.fechaInicio)
  if (filtros.fechaFin)    query = query.lte('fecha_completado', filtros.fechaFin)
  if (filtros.estado !== 'todos')      query = query.eq('estado', filtros.estado)
  if (filtros.tipoProceso !== 'todos') query = query.eq('proceso_tipo', filtros.tipoProceso)
  if (filtros.responsable !== 'todos') query = query.eq('responsable', filtros.responsable)

  const { data, error } = await query

  if (error) {
    logger.error('Error obteniendo datos completados:', error)
    return []
  }

  return data as DatosReporteCompletados[]
}

export async function obtenerDatosPorVencer(
  filtros: FiltrosReporte
): Promise<DatosReportePorVencer[]> {
  const supabase = await createClient()

  let query = supabase
    .from('mov_vista_procesos_por_vencer')
    .select('*')
    .order('dias_restantes', { ascending: true })

  // Aplicar filtros
  if (filtros.fechaInicio) {
    query = query.gte('fecha_vencimiento', filtros.fechaInicio)
  }

  if (filtros.fechaFin) {
    query = query.lte('fecha_vencimiento', filtros.fechaFin)
  }

  if (filtros.estado !== 'todos') {
    query = query.eq('estado', filtros.estado)
  }

  if (filtros.tipoProceso !== 'todos') {
    query = query.eq('proceso_tipo', filtros.tipoProceso)
  }

  if (filtros.organismoId !== 'todos') {
    query = query.eq('organismo_id', filtros.organismoId)
  }

  if (filtros.responsable !== 'todos') {
    query = query.eq('responsable', filtros.responsable)
  }

  const { data, error } = await query

  if (error) {
    logger.error('Error obteniendo datos por vencer:', error)
    return []
  }

  return data as DatosReportePorVencer[]
}

export async function obtenerDatosVencidos(
  filtros: FiltrosReporte
): Promise<DatosReporteVencidos[]> {
  const supabase = await createClient()

  let query = supabase
    .from('mov_vista_procesos_vencidos')
    .select('*')
    .order('dias_vencidos', { ascending: false })

  if (filtros.fechaInicio) {
    query = query.gte('fecha_vencimiento', filtros.fechaInicio)
  }

  if (filtros.fechaFin) {
    query = query.lte('fecha_vencimiento', filtros.fechaFin)
  }

  if (filtros.estado !== 'todos') {
    query = query.eq('estado', filtros.estado)
  }

  if (filtros.tipoProceso !== 'todos') {
    query = query.eq('proceso_tipo', filtros.tipoProceso)
  }

  if (filtros.organismoId !== 'todos') {
    query = query.eq('organismo_id', filtros.organismoId)
  }

  if (filtros.responsable !== 'todos') {
    query = query.eq('responsable', filtros.responsable)
  }

  const { data, error } = await query

  if (error) {
    logger.error('Error obteniendo datos vencidos:', error)
    return []
  }

  return data as DatosReporteVencidos[]
}

export async function obtenerOrganismos(): Promise<Organismo[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mov_organismos_transito')
    .select('id, nombre, municipio, departamento')
    .order('nombre')

  if (error) {
    logger.error('Error obteniendo organismos:', error)
    return []
  }

  return data as Organismo[]
}

export async function obtenerResponsables(): Promise<Responsable[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('perfiles')
    .select('id, nombre_completo, correo')
    .eq('activo', true)
    .order('nombre_completo')

  if (error) {
    logger.error('Error obteniendo responsables:', error)
    return []
  }

  return data as Responsable[]
}

export async function obtenerContadores() {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('obtener_contadores_movilidad')

  if (error) {
    logger.error('Error obteniendo contadores:', error)
    return { activos: 0, completados: 0, porVencer: 0, vencidos: 0 }
  }

  const c = data as Record<string, number>

  return {
    activos: c.activos ?? 0,
    completados: c.completados_30d ?? 0,
    porVencer: c.por_vencer ?? 0,
    vencidos: c.vencidos ?? 0,
  }
}
