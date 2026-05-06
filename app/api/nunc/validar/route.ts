import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const codigo = typeof body?.codigo === 'string' ? body.codigo.trim().toUpperCase() : null
    if (!codigo) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

    const admin = createAdminClient()
    const { data: sesion, error } = await admin
      .from('nunc_sesiones')
      .select('id, codigo, entidad_nombre, nombre_peritos, nunc_dpto, nunc_municipio, nunc_entidad, nunc_unidad, nunc_anio, estado, expira_en, observaciones')
      .eq('codigo', codigo)
      .single()

    if (error || !sesion) return NextResponse.json({ error: 'Código inválido' }, { status: 404 })

    if (sesion.estado === 'cerrada') return NextResponse.json({ error: 'Esta sesión ya fue cerrada' }, { status: 410 })

    if (new Date(sesion.expira_en) < new Date()) {
      await admin.from('nunc_sesiones').update({ estado: 'expirada', actualizado_en: new Date().toISOString() }).eq('id', sesion.id)
      return NextResponse.json({ error: 'Este código expiró a medianoche' }, { status: 410 })
    }

    if (sesion.estado === 'expirada') return NextResponse.json({ error: 'Este código ha expirado' }, { status: 410 })

    return NextResponse.json({ sesion })
  } catch (error) {
    logger.error('Error validando código nunc', { error: String(error) })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
