import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/api/require-superadmin'
import { requireParqueadero } from '@/lib/api/require-parqueadero'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const patchSchema = z.object({
  fecha:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  hora:          z.string().optional(),
  turno:         z.enum(['diurno', 'nocturno']).optional(),
  km_inicio:     z.number().int().nonnegative().nullable().optional(),
  observaciones: z.string().nullable().optional(),
  es_apto:       z.boolean().optional(),
  turno_id:      z.string().uuid().nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireParqueadero('editar_inspecciones')
  if (auth.response) return auth.response

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const { error } = await createAdminClient()
    .from('parq_inspecciones')
    .update(parsed.data)
    .eq('id', id)

  if (error) {
    logger.error('Error editando inspección', { id, error })
    return NextResponse.json({ error: 'Error al editar la inspección' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin()
  if (auth.response) return auth.response

  const { id } = await params

  const { error } = await createAdminClient()
    .from('parq_inspecciones')
    .delete()
    .eq('id', id)

  if (error) {
    logger.error('Error eliminando inspección', { id, error })
    return NextResponse.json({ error: 'Error al eliminar la inspección' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
