import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/api/require-superadmin'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin()
    if (auth.response) return auth.response

    const supabase = await createClient()

    const { data: sesiones_cerradas, error } = await supabase.rpc('cerrar_sesiones_token_expirado')

    if (error) {
      logger.error('Error limpiando sesiones', { error: error.message, adminId: auth.userId })
      return NextResponse.json({ error: 'Error al limpiar sesiones. Intenta nuevamente.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      sesiones_cerradas: sesiones_cerradas || 0,
    })
  } catch (error) {
    logger.error('Error en limpiar-sesiones', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
