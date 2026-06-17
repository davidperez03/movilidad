import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireParqueadero } from '@/lib/api/require-parqueadero'
import { logger } from '@/lib/logger'

const schema = z.object({
  motivo:      z.string().min(1),
  hora_inicio: z.string(),
  hora_fin:    z.string().optional(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireParqueadero('gestionar_vehiculos')
    if (auth.response) return auth.response

    const { id } = await params
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

    const { data, error } = await createAdminClient()
      .from('parq_turno_novedades')
      .insert({ turno_id: id, ...parsed.data })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, id: data.id })
  } catch (err) {
    logger.error('parqueadero/turnos/novedades POST', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
