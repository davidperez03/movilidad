import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { updatePasswordLimiter } from '@/lib/rate-limit'

function getClientIp(request: Request): string {
  const vercelIp = request.headers.get('x-vercel-forwarded-for')
  if (vercelIp) return vercelIp.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const { allowed, retryAfter } = updatePasswordLimiter.check(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta mas tarde.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  try {
    const { newPassword, clearFlag, accessToken } = await request.json()

    if (!newPassword) {
      return NextResponse.json({ error: 'Contraseña requerida' }, { status: 400 })
    }

    const admin = createAdminClient()
    let userId: string | null = null

    // Opción 1: access token enviado desde el cliente (recovery flow)
    if (accessToken) {
      const { data: { user }, error } = await admin.auth.getUser(accessToken)
      if (error || !user) {
        return NextResponse.json({ error: 'Sesion no valida' }, { status: 401 })
      }
      userId = user.id
    }

    // Opción 2: sesión desde cookies (cambiar-password flow, usuario ya logueado)
    if (!userId) {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        return NextResponse.json({ error: 'Sesion no valida' }, { status: 401 })
      }
      userId = user.id
    }

    // Cambiar contraseña con admin API (NO envía emails)
    const updateData: Record<string, unknown> = { password: newPassword }
    if (clearFlag) {
      updateData.user_metadata = { debe_cambiar_password: false }
    }

    const { error } = await admin.auth.admin.updateUserById(userId, updateData)

    if (error) {
      if (error.message.includes('same_password') || error.message.includes('should be different')) {
        return NextResponse.json({ error: 'La nueva contraseña debe ser diferente a la anterior' }, { status: 400 })
      }
      logger.error('Error actualizando contraseña', { error: error.message, userId })
      return NextResponse.json({ error: 'Error al actualizar la contraseña' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Error en update-password', { error: String(error) })
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
