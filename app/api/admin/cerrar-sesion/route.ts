import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

/**
 * API Route: Cerrar sesión manualmente (Superadmin)
 *
 * Permite a los superadmins cerrar sesiones huérfanas o problemáticas
 */
export async function POST(request: NextRequest) {
  try {
    const { sesion_id, admin_id } = await request.json()

    if (!sesion_id || !admin_id) {
      return NextResponse.json(
        { error: 'sesion_id y admin_id son requeridos' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar que el admin está autenticado
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== admin_id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Llamar función RPC para cerrar sesión
    const { data, error } = await supabase.rpc('superadmin_cerrar_sesion', {
      p_sesion_id: sesion_id,
      p_admin_id: admin_id
    })

    if (error) {
      logger.error('Error cerrando sesión', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Sesión no encontrada o ya cerrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    logger.error('Error en cerrar-sesion', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
