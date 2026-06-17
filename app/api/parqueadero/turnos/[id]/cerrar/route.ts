import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireParqueadero } from '@/lib/api/require-parqueadero'
import { logger } from '@/lib/logger'

const schema = z.object({
  hora_fin: z.string(),
  km_fin:   z.number().int().nonnegative(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireParqueadero('gestionar_vehiculos')
    if (auth.response) return auth.response

    const { id } = await params
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

    const { hora_fin, km_fin } = parsed.data
    const admin = createAdminClient()

    const { data: turno } = await admin.from('parq_vista_turnos').select('estado, km_inicio').eq('id', id).single()
    if (!turno) return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 })
    if (turno.estado === 'cerrado') return NextResponse.json({ error: 'El turno ya está cerrado' }, { status: 409 })
    if (turno.km_inicio != null && km_fin < turno.km_inicio) {
      return NextResponse.json({ error: `KM final no puede ser menor al KM inicial (${turno.km_inicio})` }, { status: 400 })
    }

    const { error } = await admin
      .from('parq_turnos')
      .update({ hora_fin, km_fin, estado: 'cerrado' })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error('parqueadero/turnos/cerrar', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
