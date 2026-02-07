import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

/**
 * API Route: Cerrar sesión cuando se cierra la ventana
 *
 * Este endpoint es llamado por sendBeacon cuando el usuario cierra
 * la ventana o pestaña del navegador. sendBeacon garantiza que la
 * petición se envíe incluso si la ventana se cierra inmediatamente.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const { sessionId } = JSON.parse(body)

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID es requerido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // IMPORTANTE: Primero invalidar el token de Supabase
    // Esto hace que el token deje de ser válido inmediatamente
    await supabase.auth.signOut()

    // Luego llamar función RPC para cerrar la sesión en nuestra DB
    const { error } = await supabase.rpc('registrar_fin_sesion', {
      p_sesion_id: sessionId,
      p_estado: 'cerrada'
    })

    if (error) {
      logger.error('Error cerrando sesión', error)
      return NextResponse.json(
        { error: 'Error al cerrar sesión' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    logger.error('Error en close-session', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
