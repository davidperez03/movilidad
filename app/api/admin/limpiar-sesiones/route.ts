import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * API Route: Limpiar sesiones con token expirado (Superadmin)
 *
 * Cierra todas las sesiones cuyo token JWT ha expirado
 */
export async function POST(request: NextRequest) {
  try {
    const { admin_id } = await request.json()

    if (!admin_id) {
      return NextResponse.json(
        { error: 'admin_id es requerido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar que el admin está autenticado y es superadmin
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== admin_id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que es superadmin
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol_global')
      .eq('id', admin_id)
      .single()

    if (!perfil || perfil.rol_global !== 'superadmin') {
      return NextResponse.json(
        { error: 'Solo superadmins pueden realizar esta acción' },
        { status: 403 }
      )
    }

    // Llamar función RPC para cerrar sesiones con token expirado
    const { data: sesiones_cerradas, error } = await supabase.rpc('cerrar_sesiones_token_expirado')

    if (error) {
      console.error('Error limpiando sesiones:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sesiones_cerradas: sesiones_cerradas || 0
    })

  } catch (error) {
    console.error('Error en limpiar-sesiones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
