import { NextRequest, NextResponse } from 'next/server'
import { requireParqueadero } from '@/lib/api/require-parqueadero'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const postSchema = z.object({
  usuario_id: z.string().uuid(),
  timestamp:  z.string().datetime({ offset: true }),
})

export async function POST(req: NextRequest) {
  const auth = await requireParqueadero('configurar')
  if (auth.response) return auth.response

  const body = await req.json()
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const { usuario_id, timestamp } = parsed.data

  const { data, error } = await createAdminClient()
    .from('asist_registros')
    .insert({ usuario_id, tipo: 'SALIDA', timestamp, punto: 'entrada-principal' })
    .select('id, tipo, timestamp')
    .single()

  if (error) {
    logger.error('Error creando registro salida asistencia', { error })
    return NextResponse.json({ error: 'Error al crear registro' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, registro: data })
}
