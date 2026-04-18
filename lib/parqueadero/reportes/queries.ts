import { createClient } from '@/lib/supabase/server'
import type { FilaStock, FilaSticker, FilaCierre, FiltrosCierres } from './tipos'

export async function obtenerStockActual(): Promise<FilaStock[]> {
  const supabase = await createClient()

  const [{ data: insumos }, { data: stocks }, { data: gruas }] = await Promise.all([
    supabase.from('inv_insumos').select('id, nombre, categoria, unidad, stock_minimo')
      .eq('modulo', 'parqueadero').eq('activo', true).order('categoria'),
    supabase.from('inv_stock').select('item_id, ubicacion, cantidad').eq('modulo', 'parqueadero'),
    supabase.from('parq_vehiculos').select('id, placa').eq('tipo', 'grua_plataforma').eq('activo', true).order('placa'),
  ])

  return (insumos ?? [])
    .filter(i => i.categoria !== 'stickers')
    .map(insumo => {
      const bodega = stocks?.find(s => s.item_id === insumo.id && s.ubicacion === 'bodega')?.cantidad ?? 0
      const gruasStock: Record<string, number> = {}
      ;(gruas ?? []).forEach(g => {
        gruasStock[g.placa] = stocks?.find(s => s.item_id === insumo.id && s.ubicacion === g.id)?.cantidad ?? 0
      })
      const total = bodega + Object.values(gruasStock).reduce((a, b) => a + b, 0)
      return { item_id: insumo.id, nombre: insumo.nombre, categoria: insumo.categoria, unidad: insumo.unidad, stock_minimo: insumo.stock_minimo, bodega, gruas: gruasStock, total }
    })
}

export async function obtenerCierresTurno(filtros: FiltrosCierres): Promise<FilaCierre[]> {
  const supabase = await createClient()

  let query = supabase
    .from('parq_inv_cierres')
    .select(`
      id,
      fecha,
      creado_por,
      parq_vehiculos ( id, placa ),
      parq_inv_cierres_detalle (
        cantidad_inicial,
        cantidad_final,
        cantidad_consumida,
        inv_insumos ( id, nombre, unidad )
      ),
      perfiles ( nombre_completo )
    `)
    .order('fecha', { ascending: false })
    .limit(500)

  if (filtros.fechaInicio) query = query.gte('fecha', filtros.fechaInicio)
  if (filtros.fechaFin)    query = query.lte('fecha', filtros.fechaFin)
  if (filtros.gruaId !== 'todos') query = query.eq('vehiculo_id', filtros.gruaId)

  const { data } = await query

  const filas: FilaCierre[] = []
  for (const cierre of data ?? []) {
    const vehiculo = cierre.parq_vehiculos as unknown as { id: string; placa: string } | null
    const perfil   = cierre.perfiles   as unknown as { nombre_completo: string } | null
    const detalle  = cierre.parq_inv_cierres_detalle as unknown as Array<{
      cantidad_inicial: number; cantidad_final: number; cantidad_consumida: number
      inv_insumos: { id: string; nombre: string; unidad: string } | null
    }>
    for (const d of detalle ?? []) {
      filas.push({
        cierre_id:          cierre.id,
        fecha:              cierre.fecha,
        grua_placa:         vehiculo?.placa ?? '',
        grua_id:            vehiculo?.id    ?? '',
        item_id:            d.inv_insumos?.id    ?? '',
        item_nombre:        d.inv_insumos?.nombre ?? '',
        unidad:             d.inv_insumos?.unidad ?? '',
        cantidad_inicial:   d.cantidad_inicial,
        cantidad_final:     d.cantidad_final,
        cantidad_consumida: d.cantidad_consumida,
        registrado_por:     perfil?.nombre_completo ?? null,
      })
    }
  }
  return filas
}

export async function obtenerStickerParaReporte(): Promise<FilaSticker | null> {
  const supabase = await createClient()

  const { data: insumo } = await supabase
    .from('inv_insumos')
    .select('id, nombre, stock_minimo')
    .eq('modulo', 'parqueadero')
    .eq('tipo_tracking', 'rango')
    .eq('activo', true)
    .single()

  if (!insumo) return null

  const { data: rango } = await supabase
    .from('inv_rangos')
    .select('rango_inicio, rango_fin, usados')
    .eq('item_id', insumo.id)
    .single()

  const configurado  = rango != null
  const rango_fin    = rango?.rango_fin    ?? 0
  const usados       = rango?.usados       ?? 0
  const disponibles  = rango_fin - usados
  const pct_uso      = configurado && rango_fin > 0 ? Math.round((usados / rango_fin) * 100) : 0

  return {
    item_id:      insumo.id,
    nombre:       insumo.nombre,
    rango_inicio: rango?.rango_inicio ?? 0,
    rango_fin,
    usados,
    disponibles,
    stock_minimo: insumo.stock_minimo,
    pct_uso,
    configurado,
  }
}

export async function obtenerGruasParaFiltro() {
  const supabase = await createClient()
  const { data } = await supabase.from('parq_vehiculos')
    .select('id, placa').eq('tipo', 'grua_plataforma').eq('activo', true).order('placa')
  return data ?? []
}
