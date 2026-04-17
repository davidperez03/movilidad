import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermisoParqueadero } from '@/lib/api/require-permiso-parqueadero'
import { logger } from '@/lib/logger'

interface DetalleItem {
  item_id:          string
  cantidad_inicial: number
  cantidad_final:   number
}

export async function POST(req: Request) {
  const auth = await requirePermisoParqueadero('gestionar_inventario')
  if (auth.response) return auth.response

  const body = await req.json()
  const { vehiculo_id, fecha, items } = body as {
    vehiculo_id: string; fecha: string; items: DetalleItem[]
  }

  if (!vehiculo_id || !fecha || !items?.length) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  for (const it of items) {
    if (it.cantidad_final > it.cantidad_inicial) {
      return NextResponse.json({ error: `cantidad_final no puede superar cantidad_inicial (item ${it.item_id})` }, { status: 422 })
    }
  }

  const admin = createAdminClient()

  const { data: cierre, error: cierreError } = await admin
    .from('parq_inv_cierres')
    .insert({ vehiculo_id, fecha, creado_por: auth.userId })
    .select('id')
    .single()

  if (cierreError) {
    if (cierreError.code === '23505') {
      return NextResponse.json({ error: 'Ya existe un cierre para esta grúa en esta fecha' }, { status: 409 })
    }
    logger.error('Error creando cierre de turno', { vehiculo_id, fecha, error: cierreError })
    return NextResponse.json({ error: 'Error al registrar cierre' }, { status: 500 })
  }

  const { error: detalleError } = await admin
    .from('parq_inv_cierres_detalle')
    .insert(items.map(it => ({
      cierre_id:        cierre.id,
      item_id:          it.item_id,
      cantidad_inicial: it.cantidad_inicial,
      cantidad_final:   it.cantidad_final,
    })))

  if (detalleError) {
    logger.error('Error insertando detalle de cierre', { cierre_id: cierre.id, error: detalleError })
    return NextResponse.json({ error: 'Error al guardar detalle del cierre' }, { status: 500 })
  }

  for (const it of items) {
    await admin
      .from('inv_stock')
      .upsert(
        { item_id: it.item_id, modulo: 'parqueadero', ubicacion: vehiculo_id, cantidad: it.cantidad_final, updated_at: new Date().toISOString() },
        { onConflict: 'item_id,modulo,ubicacion' }
      )
  }

  return NextResponse.json({ ok: true, cierre_id: cierre.id })
}
