import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/api/require-superadmin'
import { logger } from '@/lib/logger'

const schema = z.object({
  sesion_id: z.string().uuid('sesion_id debe ser un UUID válido'),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin()
    if (auth.response) return auth.response

    const body = await request.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { sesion_id } = parsed.data
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('superadmin_cerrar_sesion', {
      p_sesion_id: sesion_id,
      p_admin_id: auth.userId,
    })

    if (error) {
      logger.error('Error cerrando sesión', { error: error.message, sesion_id })
      return NextResponse.json({ error: 'Error al cerrar la sesión' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Sesión no encontrada o ya cerrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error en cerrar-sesion', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
