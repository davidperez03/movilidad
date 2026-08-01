import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { obtenerPermisosUsuario } from '@/lib/server/permisos'
import { logger } from '@/lib/logger'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { nunc, esSuperadmin } = await obtenerPermisosUsuario()
    if (!esSuperadmin && !nunc.configurar) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { id } = await params
    const admin = createAdminClient()

    const { error } = await admin.from('nunc_sesiones').delete().eq('id', id)

    if (error) {
      logger.error('Error eliminando sesión nunc', { error: error.message })
      return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Error en DELETE nunc/sesion/[id]', { error: String(error) })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
