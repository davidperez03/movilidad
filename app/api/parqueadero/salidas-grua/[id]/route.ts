import { NextRequest, NextResponse } from 'next/server'
import { requireParqueadero } from '@/lib/api/require-parqueadero'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const itemSchema = z.object({
  item_id:  z.string(),
  nombre:   z.string(),
  desde:    z.number().int().nonnegative(),
  hasta:    z.number().int().nonnegative(),
  cantidad: z.number().int().nonnegative(),
})

const patchSchema = z.object({
  trae_carga:       z.boolean(),
  inventario_items: z.array(itemSchema).optional(),
  observaciones:    z.string().nullable().optional(),
  hora_regreso:     z.string().datetime({ offset: true }).nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireParqueadero('configurar')
  if (auth.response) return auth.response

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const { trae_carga, inventario_items, observaciones, hora_regreso } = parsed.data

  const { error } = await createAdminClient()
    .from('parq_salidas_grua')
    .update({
      trae_carga,
      inventario_items: trae_carga ? (inventario_items ?? []) : [],
      ...(observaciones !== undefined && { observaciones }),
      ...(hora_regreso !== undefined && { hora_regreso }),
    })
    .eq('id', id)

  if (error) {
    logger.error('Error editando salida grúa', { id, error })
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
