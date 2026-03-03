import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdmin } from '@/lib/api/require-superadmin'
import { logger } from '@/lib/logger'

const schema = z.object({
  userId: z.string().uuid('userId debe ser un UUID válido'),
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

    const { userId } = parsed.data

    if (userId === auth.userId) {
      return NextResponse.json({ error: 'No puede eliminarse a sí mismo' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    await supabaseAdmin
      .from('usuarios_roles')
      .delete()
      .eq('usuario_id', userId)

    await supabaseAdmin
      .from('perfiles')
      .delete()
      .eq('id', userId)

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      logger.error('Error eliminando usuario', { error: deleteError.message, userId })
      return NextResponse.json({ error: 'Error al eliminar el usuario' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Usuario eliminado correctamente' })
  } catch (error) {
    logger.error('Error en eliminar-usuario', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
