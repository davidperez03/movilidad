import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { obtenerPermisosUsuario } from '@/lib/server/permisos'
import { logger } from '@/lib/logger'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; registroId: string }> }) {
  try {
    const { nunc, esSuperadmin } = await obtenerPermisosUsuario()
    if (!esSuperadmin && !nunc.configurar) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { id: sesionId, registroId } = await params
    const admin = createAdminClient()

    // Verificar que el registro pertenece a esta sesión y que la sesión está activa
    const { data: registro } = await admin
      .from('nunc_registros')
      .select('id, sesion_id, nunc_sesiones!inner(estado)')
      .eq('id', registroId)
      .eq('sesion_id', sesionId)
      .single()

    if (!registro) return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 })

    const sesionEstado = (registro.nunc_sesiones as unknown as { estado: string }).estado
    if (sesionEstado !== 'activa') {
      return NextResponse.json({ error: 'Solo se pueden eliminar registros de sesiones activas' }, { status: 400 })
    }

    const { error } = await admin.from('nunc_registros').delete().eq('id', registroId)

    if (error) {
      logger.error('Error eliminando registro nunc (admin)', { error: error.message })
      return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Error en DELETE nunc/sesion/[id]/registro/[registroId]', { error: String(error) })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
