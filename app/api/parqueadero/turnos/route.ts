import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireParqueadero } from '@/lib/api/require-parqueadero'
import { logger } from '@/lib/logger'

const schema = z.object({
  tipo_turno:  z.enum(['diurno', 'nocturno']),
  fecha:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  vehiculo_id: z.string().uuid(),
  hora_inicio: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const auth = await requireParqueadero('gestionar_vehiculos')
    if (auth.response) return auth.response

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos', detalles: parsed.error.errors }, { status: 400 })

    const { tipo_turno, fecha, vehiculo_id, hora_inicio } = parsed.data
    const admin = createAdminClient()
    const userId = auth.userId

    const { data: abierto } = await admin
      .from('parq_turnos')
      .select('id')
      .eq('vehiculo_id', vehiculo_id)
      .eq('estado', 'abierto')
      .maybeSingle()

    if (abierto) {
      return NextResponse.json(
        { error: 'Esta grúa ya tiene un turno abierto. Ciérralo antes de crear uno nuevo.' },
        { status: 409 }
      )
    }

    const { data, error } = await admin
      .from('parq_turnos')
      .insert({ tipo_turno, fecha, vehiculo_id, hora_inicio, creado_por: userId })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, id: data.id })
  } catch (err) {
    logger.error('parqueadero/turnos POST', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
