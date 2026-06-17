import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

const schema = z.object({
  tipo_turno:  z.enum(['diurno', 'nocturno']),
  fecha:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  vehiculo_id: z.string().uuid(),
  hora_inicio: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos', detalles: parsed.error.errors }, { status: 400 })

    const { tipo_turno, fecha, vehiculo_id, hora_inicio } = parsed.data
    const admin = createAdminClient()

    const { data: existente } = await admin
      .from('parq_turnos')
      .select('id')
      .eq('vehiculo_id', vehiculo_id)
      .eq('fecha', fecha)
      .eq('tipo_turno', tipo_turno)
      .maybeSingle()

    if (existente) {
      return NextResponse.json(
        { error: `Ya existe un turno ${tipo_turno} para esta grúa en esa fecha` },
        { status: 409 }
      )
    }

    const { data, error } = await admin
      .from('parq_turnos')
      .insert({ tipo_turno, fecha, vehiculo_id, hora_inicio, creado_por: user.id })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, id: data.id })
  } catch (err) {
    logger.error('parqueadero/turnos POST', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
