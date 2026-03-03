import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { updatePasswordLimiter } from '@/lib/rate-limit'

const schema = z.object({
  newPassword: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
  clearFlag: z.boolean().optional(),
})

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
    const body = await request.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { newPassword, clearFlag } = parsed.data

    // Sesión siempre desde cookies — la sesión de recovery se establece en el
    // cliente via verifyOtp() antes de llegar a este endpoint
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Sesion no valida' }, { status: 401 })
    }

    const admin = createAdminClient()
    const updateData: Record<string, unknown> = { password: newPassword }

    if (clearFlag) {
      // Merge explícito: preservar todas las claves existentes de user_metadata
      const { data: { user: currentUser } } = await admin.auth.admin.getUserById(user.id)
      updateData.user_metadata = {
        ...currentUser?.user_metadata,
        debe_cambiar_password: false,
      }
    }

    const { error } = await admin.auth.admin.updateUserById(user.id, updateData)

    if (error) {
      if (error.message.includes('same_password') || error.message.includes('should be different')) {
        return NextResponse.json({ error: 'La nueva contraseña debe ser diferente a la anterior' }, { status: 400 })
      }
      logger.error('Error actualizando contraseña', { error: error.message, userId: user.id })
      return NextResponse.json({ error: 'Error al actualizar la contraseña' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Error en update-password', { error: String(error) })
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
