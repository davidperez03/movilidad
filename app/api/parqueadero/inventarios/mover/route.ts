import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermisoParqueadero } from '@/lib/api/require-permiso-parqueadero'
import { logger } from '@/lib/logger'

export async function POST(req: Request) {
  const auth = await requirePermisoParqueadero('gestionar_inventario')
  if (auth.response) return auth.response

  const body = await req.json()
  const { item_id, origen, destino, cantidad } = body as {
    item_id: string; origen: string; destino: string; cantidad: number
  }

  if (!item_id || !origen || !destino || !cantidad || cantidad <= 0 || origen === destino) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: origenRow } = await admin
    .from('inv_stock')
    .select('cantidad')
    .eq('item_id', item_id)
    .eq('modulo', 'parqueadero')
    .eq('ubicacion', origen)
    .single()

  if (!origenRow || origenRow.cantidad < cantidad) {
    return NextResponse.json({ error: 'Stock insuficiente en origen' }, { status: 422 })
  }

  const { error: e1 } = await admin
    .from('inv_stock')
    .update({ cantidad: origenRow.cantidad - cantidad, updated_at: new Date().toISOString() })
    .eq('item_id', item_id)
    .eq('modulo', 'parqueadero')
    .eq('ubicacion', origen)

  if (e1) {
    logger.error('Error restando stock en origen', { item_id, origen, error: e1 })
    return NextResponse.json({ error: 'Error al mover stock' }, { status: 500 })
  }

  const { data: destinoRow } = await admin
    .from('inv_stock')
    .select('cantidad')
    .eq('item_id', item_id)
    .eq('modulo', 'parqueadero')
    .eq('ubicacion', destino)
    .maybeSingle()

  const { error: e2 } = await admin
    .from('inv_stock')
    .upsert(
      { item_id, modulo: 'parqueadero', ubicacion: destino, cantidad: (destinoRow?.cantidad ?? 0) + cantidad, updated_at: new Date().toISOString() },
      { onConflict: 'item_id,modulo,ubicacion' }
    )

  if (e2) {
    logger.error('Error sumando stock en destino', { item_id, destino, error: e2 })
    return NextResponse.json({ error: 'Error al mover stock' }, { status: 500 })
  }

  await admin.from('inv_movimientos').insert({
    item_id,
    modulo:    'parqueadero',
    tipo:      'traslado',
    origen,
    destino,
    cantidad,
    creado_por: auth.userId,
  })

  return NextResponse.json({ ok: true })
}
