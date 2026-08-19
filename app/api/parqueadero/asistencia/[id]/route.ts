import { NextRequest, NextResponse } from 'next/server'
import { requireParqueadero } from '@/lib/api/require-parqueadero'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const patchSchema = z.object({
  timestamp: z.string().datetime({ offset: true }),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireParqueadero('configurar')
  if (auth.response) return auth.response

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const { error } = await createAdminClient()
    .from('asist_registros')
    .update({ timestamp: parsed.data.timestamp })
    .eq('id', id)

  if (error) {
    logger.error('Error actualizando timestamp asistencia', { id, error })
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
