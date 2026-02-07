import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdmin } from '@/lib/api/require-superadmin'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin()
    if (auth.response) return auth.response

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
    }

    // No permitir auto-eliminación
    if (userId === auth.userId) {
      return NextResponse.json({ error: 'No puede eliminarse a sí mismo' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    // Eliminar roles del usuario
    await supabaseAdmin
      .from('usuarios_roles')
      .delete()
      .eq('usuario_id', userId)

    // Eliminar perfil (cascade eliminará lo demás)
    await supabaseAdmin
      .from('perfiles')
      .delete()
      .eq('id', userId)

    // Eliminar de auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Usuario eliminado correctamente' })
  } catch (error) {
    logger.error('Error en eliminar-usuario', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
