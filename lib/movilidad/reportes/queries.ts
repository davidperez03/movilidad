import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import type {
  FiltrosReporte,
  DatosReporteActivos,
  DatosReporteCompletados,
  DatosReportePorVencer,
  Organismo,
  Responsable,
} from './tipos'
import { transformarTraslado, transformarRadicacion, ordenarPorFechaCompletado } from './transformers'

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

  // Obtener traslados completados
  let queryTraslados = supabase
    .from('mov_traslados')
    .select(
      `
      id,
      cuenta_id,
      estado,
      fecha_tramite,
      fecha_completado,
      observaciones,
      creado_en,
      organismo_destino:mov_organismos_transito!organismo_destino_id(nombre),
      cuenta:mov_cuentas_vehiculos!cuenta_id(placa, numero_cuenta, tipo_servicio),
      creado_por_perfil:perfiles!creado_por(nombre_completo)
    `
    )
    .in('estado', ['trasladado', 'devuelto'])
    .not('fecha_completado', 'is', null)

  // Obtener radicaciones completadas
  let queryRadicaciones = supabase
    .from('mov_radicaciones')
    .select(
      `
      id,
      cuenta_id,
      estado,
      fecha_tramite,
      fecha_completado,
      observaciones,
      creado_en,
      organismo_origen:mov_organismos_transito!organismo_origen_id(nombre),
      cuenta:mov_cuentas_vehiculos!cuenta_id(placa, numero_cuenta, tipo_servicio),
      creado_por_perfil:perfiles!creado_por(nombre_completo)
    `
    )
    .in('estado', ['radicado', 'devuelto'])
    .not('fecha_completado', 'is', null)

  // Aplicar filtros de fecha
  if (filtros.fechaInicio) {
    queryTraslados = queryTraslados.gte('fecha_completado', filtros.fechaInicio)
    queryRadicaciones = queryRadicaciones.gte('fecha_completado', filtros.fechaInicio)
  }

  if (filtros.fechaFin) {
    queryTraslados = queryTraslados.lte('fecha_completado', filtros.fechaFin)
    queryRadicaciones = queryRadicaciones.lte('fecha_completado', filtros.fechaFin)
  }

  // Filtro por estado
  if (filtros.estado !== 'todos') {
    queryTraslados = queryTraslados.eq('estado', filtros.estado)
    queryRadicaciones = queryRadicaciones.eq('estado', filtros.estado)
  }

  // Ordenar por fecha completado descendente
  queryTraslados = queryTraslados.order('fecha_completado', { ascending: false })
  queryRadicaciones = queryRadicaciones.order('fecha_completado', { ascending: false })

  const [{ data: traslados, error: errorTraslados }, { data: radicaciones, error: errorRadicaciones }] =
    await Promise.all([queryTraslados, queryRadicaciones])

  if (errorTraslados) {
    logger.error('Error obteniendo traslados completados:', errorTraslados)
  }

  if (errorRadicaciones) {
    logger.error('Error obteniendo radicaciones completadas:', errorRadicaciones)
  }

  // Transformar y combinar resultados
  const resultados: DatosReporteCompletados[] = []

  // Transformar traslados
  if (traslados) {
    for (const traslado of traslados) {
      const transformado = transformarTraslado(traslado as unknown as Parameters<typeof transformarTraslado>[0])
      if (transformado) {
        resultados.push(transformado)
      }
    }
  }

  // Transformar radicaciones
  if (radicaciones) {
    for (const radicacion of radicaciones) {
      const transformado = transformarRadicacion(radicacion as unknown as Parameters<typeof transformarRadicacion>[0])
      if (transformado) {
        resultados.push(transformado)
      }
    }
  }

  // Ordenar por fecha completado
  const resultadosOrdenados = ordenarPorFechaCompletado(resultados)

  // Aplicar filtros adicionales en memoria
  let resultadosFiltrados = resultadosOrdenados

  if (filtros.tipoProceso !== 'todos') {
    resultadosFiltrados = resultadosFiltrados.filter((r) => r.proceso_tipo === filtros.tipoProceso)
  }

  if (filtros.responsable !== 'todos') {
    resultadosFiltrados = resultadosFiltrados.filter((r) => r.responsable === filtros.responsable)
  }

  return resultadosFiltrados
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
  if (filtros.estado !== 'todos') {
    query = query.eq('estado', filtros.estado)
  }

  if (filtros.tipoProceso !== 'todos') {
    query = query.eq('proceso_tipo', filtros.tipoProceso)
  }

  const { data, error } = await query

  if (error) {
    logger.error('Error obteniendo datos por vencer:', error)
    return []
  }

  return data as DatosReportePorVencer[]
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
    .order('nombre_completo')

  if (error) {
    logger.error('Error obteniendo responsables:', error)
    return []
  }

  return data as Responsable[]
}

export async function obtenerContadores() {
  const supabase = await createClient()

  // Contar procesos activos
  const { count: activos } = await supabase
    .from('mov_vista_proceso_activo')
    .select('*', { count: 'exact', head: true })
    .not('proceso_tipo', 'is', null)

  // Contar procesos por vencer
  const { count: porVencer } = await supabase
    .from('mov_vista_procesos_por_vencer')
    .select('*', { count: 'exact', head: true })

  // Contar procesos completados (últimos 30 días)
  const hace30Dias = new Date()
  hace30Dias.setDate(hace30Dias.getDate() - 30)

  const { count: completadosTraslados } = await supabase
    .from('mov_traslados')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'trasladado')
    .gte('fecha_completado', hace30Dias.toISOString())

  const { count: completadosRadicaciones } = await supabase
    .from('mov_radicaciones')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'radicado')
    .gte('fecha_completado', hace30Dias.toISOString())

  const completados = (completadosTraslados || 0) + (completadosRadicaciones || 0)

  return {
    activos: activos || 0,
    completados: completados || 0,
    porVencer: porVencer || 0,
  }
}
