import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/api/require-superadmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const patchSchema = z.object({
  tipo_turno:  z.enum(['diurno', 'nocturno']).optional(),
  fecha:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  hora_inicio: z.string().optional(),
  hora_fin:    z.string().nullable().optional(),
  km_fin:      z.number().int().nonnegative().nullable().optional(),
  estado:      z.enum(['abierto', 'cerrado']).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin()
  if (auth.response) return auth.response

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const { error } = await createAdminClient()
    .from('parq_turnos')
    .update(parsed.data)
    .eq('id', id)

  if (error) {
    logger.error('Error editando turno', { id, error })
    return NextResponse.json({ error: 'Error al editar el turno' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin()
  if (auth.response) return auth.response

  const { id } = await params

  const { error } = await createAdminClient()
    .from('parq_turnos')
    .delete()
    .eq('id', id)

  if (error) {
    logger.error('Error eliminando turno', { id, error })
    return NextResponse.json({ error: 'Error al eliminar el turno' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
