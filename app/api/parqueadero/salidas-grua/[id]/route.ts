import { NextRequest, NextResponse } from 'next/server'
import { requireParqueadero } from '@/lib/api/require-parqueadero'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const patchSchema = z.object({
  trae_carga: z.boolean(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireParqueadero('configurar')
  if (auth.response) return auth.response

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const { error } = await createAdminClient()
    .from('parq_salidas_grua')
    .update({ trae_carga: parsed.data.trae_carga })
    .eq('id', id)

  if (error) {
    logger.error('Error editando salida grúa', { id, error })
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
