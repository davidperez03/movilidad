import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermisoParqueadero } from '@/lib/api/require-permiso-parqueadero'
import { logger } from '@/lib/logger'

export async function PATCH(req: Request) {
  const auth = await requirePermisoParqueadero('gestionar_inventario')
  if (auth.response) return auth.response

  const body = await req.json()
  const { item_id, nuevo_fin } = body as { item_id: string; nuevo_fin: number }

  if (!item_id || !nuevo_fin || nuevo_fin <= 0) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: rango } = await admin
    .from('inv_rangos')
    .select('rango_fin')
    .eq('item_id', item_id)
    .single()

  if (!rango) {
    return NextResponse.json({ error: 'Rango no encontrado' }, { status: 404 })
  }

  if (nuevo_fin <= rango.rango_fin) {
    return NextResponse.json({ error: 'El nuevo límite debe ser mayor al actual' }, { status: 422 })
  }

  const { error } = await admin
    .from('inv_rangos')
    .update({ rango_fin: nuevo_fin, updated_at: new Date().toISOString(), updated_by: auth.userId })
    .eq('item_id', item_id)

  if (error) {
    logger.error('Error ampliando rango de sticker', { item_id, nuevo_fin, error })
    return NextResponse.json({ error: 'Error al ampliar rango' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, rango_fin: nuevo_fin })
}
