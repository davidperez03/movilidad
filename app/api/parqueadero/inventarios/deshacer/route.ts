import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermisoParqueadero } from '@/lib/api/require-permiso-parqueadero'
import { logger } from '@/lib/logger'

type Payload =
  | { tipo: 'agregar';       item_id: string; cantidad: number }
  | { tipo: 'mover';         item_id: string; cantidad: number; origen: string; destino: string }
  | { tipo: 'sticker';       item_id: string; usados_anterior: number }
  | { tipo: 'ampliar_rango'; item_id: string; rango_fin_anterior: number }

export async function POST(req: Request) {
  const auth = await requirePermisoParqueadero('gestionar_inventario')
  if (auth.response) return auth.response

  const body = await req.json() as Payload

  if (!body.tipo || !body.item_id) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const admin = createAdminClient()

  if (body.tipo === 'ampliar_rango') {
    const { item_id, rango_fin_anterior } = body as Extract<Payload, { tipo: 'ampliar_rango' }>
    const { error } = await admin
      .from('inv_rangos')
      .update({ rango_fin: rango_fin_anterior })
      .eq('item_id', item_id)

    if (error) {
      logger.error('Error deshaciendo ampliación de rango', { item_id, error })
      return NextResponse.json({ error: 'Error al deshacer' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }

  if (body.tipo === 'sticker') {
    const { item_id, usados_anterior } = body as Extract<Payload, { tipo: 'sticker' }>
    if (usados_anterior < 0) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
    }
    const { error } = await admin
      .from('inv_rangos')
      .update({ usados: usados_anterior })
      .eq('item_id', item_id)

    if (error) {
      logger.error('Error deshaciendo actualización de sticker', { item_id, error })
      return NextResponse.json({ error: 'Error al deshacer' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }

  if (!('cantidad' in body) || body.cantidad <= 0) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  if (body.tipo === 'agregar') {
    const { data: row } = await admin
      .from('inv_stock')
      .select('cantidad')
      .eq('item_id', body.item_id)
      .eq('modulo', 'parqueadero')
      .eq('ubicacion', 'bodega')
      .maybeSingle()

    const actual = row?.cantidad ?? 0
    if (actual < body.cantidad) {
      return NextResponse.json({ error: 'No hay suficiente stock para deshacer' }, { status: 422 })
    }

    const { error } = await admin
      .from('inv_stock')
      .upsert(
        { item_id: body.item_id, modulo: 'parqueadero', ubicacion: 'bodega', cantidad: actual - body.cantidad, updated_at: new Date().toISOString() },
        { onConflict: 'item_id,modulo,ubicacion' }
      )

    if (error) {
      logger.error('Error deshaciendo ingreso', { item_id: body.item_id, error })
      return NextResponse.json({ error: 'Error al deshacer' }, { status: 500 })
    }

    await admin.from('inv_movimientos').insert({
      item_id:    body.item_id,
      modulo:     'parqueadero',
      tipo:       'egreso',
      origen:     'bodega',
      destino:    null,
      cantidad:   body.cantidad,
      creado_por: auth.userId,
    })

    return NextResponse.json({ ok: true })
  }

  // tipo === 'mover' → revertir: mover de destino a origen
  const { origen, destino, item_id, cantidad } = body as Extract<Payload, { tipo: 'mover' }>

  const { data: destinoRow } = await admin
    .from('inv_stock')
    .select('cantidad')
    .eq('item_id', item_id)
    .eq('modulo', 'parqueadero')
    .eq('ubicacion', destino)
    .maybeSingle()

  const enDestino = destinoRow?.cantidad ?? 0
  if (enDestino < cantidad) {
    return NextResponse.json({ error: 'No hay suficiente stock para deshacer' }, { status: 422 })
  }

  const { error: e1 } = await admin
    .from('inv_stock')
    .update({ cantidad: enDestino - cantidad, updated_at: new Date().toISOString() })
    .eq('item_id', item_id)
    .eq('modulo', 'parqueadero')
    .eq('ubicacion', destino)

  if (e1) {
    logger.error('Error deshaciendo traslado (destino)', { item_id, error: e1 })
    return NextResponse.json({ error: 'Error al deshacer' }, { status: 500 })
  }

  const { data: origenRow } = await admin
    .from('inv_stock')
    .select('cantidad')
    .eq('item_id', item_id)
    .eq('modulo', 'parqueadero')
    .eq('ubicacion', origen)
    .maybeSingle()

  const { error: e2 } = await admin
    .from('inv_stock')
    .upsert(
      { item_id, modulo: 'parqueadero', ubicacion: origen, cantidad: (origenRow?.cantidad ?? 0) + cantidad, updated_at: new Date().toISOString() },
      { onConflict: 'item_id,modulo,ubicacion' }
    )

  if (e2) {
    logger.error('Error deshaciendo traslado (origen)', { item_id, error: e2 })
    return NextResponse.json({ error: 'Error al deshacer' }, { status: 500 })
  }

  await admin.from('inv_movimientos').insert({
    item_id,
    modulo:     'parqueadero',
    tipo:       'traslado',
    origen:     destino,
    destino:    origen,
    cantidad,
    creado_por: auth.userId,
  })

  return NextResponse.json({ ok: true })
}
