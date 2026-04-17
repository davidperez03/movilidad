import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermisoParqueadero } from '@/lib/api/require-permiso-parqueadero'
import { logger } from '@/lib/logger'

export async function PATCH(req: Request) {
  const auth = await requirePermisoParqueadero('gestionar_inventario')
  if (auth.response) return auth.response

  const body = await req.json()
  const { item_id, usados } = body as { item_id: string; usados: number }

  if (!item_id || usados == null || usados < 0) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: rango } = await admin
    .from('inv_rangos')
    .select('usados, rango_fin')
    .eq('item_id', item_id)
    .single()

  if (!rango) {
    return NextResponse.json({ error: 'Rango no encontrado' }, { status: 404 })
  }

  if (usados <= rango.usados) {
    return NextResponse.json({ error: 'El número debe ser mayor al último registrado' }, { status: 422 })
  }

  if (usados > rango.rango_fin) {
    return NextResponse.json({ error: 'El número supera el rango máximo habilitado' }, { status: 422 })
  }

  const { error } = await admin
    .from('inv_rangos')
    .update({ usados, updated_at: new Date().toISOString(), updated_by: auth.userId })
    .eq('item_id', item_id)

  if (error) {
    logger.error('Error actualizando rango de sticker', { item_id, usados, error })
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, usados })
}
