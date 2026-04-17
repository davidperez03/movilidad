import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermisoParqueadero } from '@/lib/api/require-permiso-parqueadero'
import { logger } from '@/lib/logger'

export async function POST(req: Request) {
  const auth = await requirePermisoParqueadero('gestionar_inventario')
  if (auth.response) return auth.response

  const body = await req.json()
  const { item_id, cantidad } = body as { item_id: string; cantidad: number }

  if (!item_id || !cantidad || cantidad <= 0) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: row } = await admin
    .from('inv_stock')
    .select('cantidad')
    .eq('item_id', item_id)
    .eq('modulo', 'parqueadero')
    .eq('ubicacion', 'bodega')
    .maybeSingle()

  const nueva = (row?.cantidad ?? 0) + cantidad

  const { error } = await admin
    .from('inv_stock')
    .upsert(
      { item_id, modulo: 'parqueadero', ubicacion: 'bodega', cantidad: nueva, updated_at: new Date().toISOString() },
      { onConflict: 'item_id,modulo,ubicacion' }
    )

  if (error) {
    logger.error('Error actualizando stock en bodega', { item_id, error })
    return NextResponse.json({ error: 'Error al actualizar stock' }, { status: 500 })
  }

  await admin.from('inv_movimientos').insert({
    item_id,
    modulo:     'parqueadero',
    tipo:       'ingreso',
    origen:     null,
    destino:    'bodega',
    cantidad,
    creado_por: auth.userId,
  })

  return NextResponse.json({ ok: true })
}
