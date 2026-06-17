import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireParqueadero } from '@/lib/api/require-parqueadero'
import { logger } from '@/lib/logger'

const patchSchema = z.object({
  hora_fin: z.string().min(1),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; novedadId: string }> }) {
  try {
    const auth = await requireParqueadero('gestionar_vehiculos')
    if (auth.response) return auth.response

    const { novedadId } = await params
    const body = await req.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

    const { error } = await createAdminClient()
      .from('parq_turno_novedades')
      .update({ hora_fin: parsed.data.hora_fin })
      .eq('id', novedadId)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error('parqueadero/turnos/novedades PATCH', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; novedadId: string }> }) {
  try {
    const auth = await requireParqueadero('gestionar_vehiculos')
    if (auth.response) return auth.response

    const { novedadId } = await params

    const { error } = await createAdminClient()
      .from('parq_turno_novedades')
      .delete()
      .eq('id', novedadId)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error('parqueadero/turnos/novedades DELETE', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
