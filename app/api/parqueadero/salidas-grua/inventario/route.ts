import { NextResponse } from 'next/server'
import { requireParqueadero } from '@/lib/api/require-parqueadero'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function GET() {
  const auth = await requireParqueadero('configurar')
  if (auth.response) return auth.response

  try {
    const { data } = await createAdminClient()
      .from('inv_rangos')
      .select('item_id, rango_inicio, rango_fin, usados, inv_insumos!inner(id, nombre, modulo, tipo_tracking)')
      .eq('inv_insumos.modulo', 'parqueadero')
      .eq('inv_insumos.tipo_tracking', 'rango')

    const items = (data ?? [])
      .map(i => {
        const insumo = i.inv_insumos as unknown as { id: string; nombre: string } | null
        const disponibles = (i.rango_fin ?? 0) - (i.usados ?? 0)
        return {
          item_id:    i.item_id,
          nombre:     insumo?.nombre ?? '',
          usados:     i.usados ?? 0,
          rango_fin:  i.rango_fin ?? 0,
          disponibles,
        }
      })
      .filter(i => i.disponibles > 0)

    return NextResponse.json({ items })
  } catch (err) {
    logger.error('inventario grua', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
