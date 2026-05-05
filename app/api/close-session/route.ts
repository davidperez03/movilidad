import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const schema = z.object({
  sessionId: z.string().uuid('sessionId debe ser un UUID válido'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    let rawBody: unknown
    try {
      rawBody = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }
    const parsed = schema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { sessionId } = parsed.data
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: sesion } = await supabase
      .from('sys_sesiones')
      .select('id')
      .eq('id', sessionId)
      .eq('usuario_id', user.id)
      .maybeSingle()

    if (!sesion) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 403 })
    }

    // No se llama signOut(): invocado via sendBeacon en beforeunload, el JWT expira naturalmente.
    const { error } = await supabase.rpc('registrar_fin_sesion', {
      p_sesion_id: sessionId,
      p_estado: 'cerrada',
    })

    if (error) {
      logger.error('Error cerrando sesión', { error: error.message, sessionId })
      return NextResponse.json({ error: 'Error al cerrar sesión' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error en close-session', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
