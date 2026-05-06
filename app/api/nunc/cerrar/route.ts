import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { nuncCerrarLimiter, getClientIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const { allowed, retryAfter } = nuncCerrarLimiter.check(getClientIp(request))
  if (!allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta más tarde.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  try {
    const body = await request.json().catch(() => null)
    const codigo = typeof body?.codigo === 'string' ? body.codigo.trim().toUpperCase() : null
    if (!codigo) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

    const admin = createAdminClient()
    const { data: sesion } = await admin
      .from('nunc_sesiones')
      .select('id, estado')
      .eq('codigo', codigo)
      .single()

    if (!sesion) return NextResponse.json({ error: 'Código inválido' }, { status: 404 })
    if (sesion.estado !== 'activa') return NextResponse.json({ error: 'Sesión no activa' }, { status: 409 })

    const { error } = await admin
      .from('nunc_sesiones')
      .update({ estado: 'cerrada', cerrado_en: new Date().toISOString(), actualizado_en: new Date().toISOString() })
      .eq('id', sesion.id)

    if (error) {
      logger.error('Error cerrando sesión nunc', { error: error.message })
      return NextResponse.json({ error: 'Error al cerrar' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Error en POST nunc/cerrar', { error: String(error) })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
