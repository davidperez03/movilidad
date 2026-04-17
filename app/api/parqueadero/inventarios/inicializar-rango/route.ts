import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermisoParqueadero } from '@/lib/api/require-permiso-parqueadero'
import { logger } from '@/lib/logger'

export async function POST(req: Request) {
  const auth = await requirePermisoParqueadero('gestionar_inventario')
  if (auth.response) return auth.response

  const body = await req.json()
  const { item_id, rango_inicio, rango_fin, usados } = body as {
    item_id: string; rango_inicio: number; rango_fin: number; usados: number
  }

  if (!item_id || rango_inicio == null || rango_fin == null || usados == null) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }
  if (rango_fin < rango_inicio || usados < 0 || usados > rango_fin) {
    return NextResponse.json({ error: 'Valores de rango inconsistentes' }, { status: 422 })
  }

  const admin = createAdminClient()

  const { error } = await admin.from('inv_rangos').insert({
    item_id,
    rango_inicio,
    rango_fin,
    usados,
    updated_by: auth.userId,
  })

  if (error) {
    logger.error('Error inicializando rango de sticker', { item_id, error })
    return NextResponse.json({ error: 'Error al inicializar rango' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
