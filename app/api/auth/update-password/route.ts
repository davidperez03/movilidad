import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { updatePasswordLimiter } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/utils/get-client-ip'

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

    // La sesión de recovery se establece en el cliente via verifyOtp() antes de llegar a este endpoint.
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Sesion no valida' }, { status: 401 })
    }

    const admin = createAdminClient()
    const updateData: Record<string, unknown> = { password: newPassword }

    if (clearFlag) {
      // Merge explícito vía admin para preservar las claves existentes de user_metadata.
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

    await supabase.rpc('registrar_auditoria_sistema', {
      p_accion: 'password_cambiado',
      p_entidad_tipo: 'usuario',
      p_entidad_id: user.id,
      p_detalles: {
        razon: clearFlag ? 'Cambio obligatorio al primer inicio de sesión' : 'Cambio voluntario por el usuario',
      },
      p_ip_address: ip,
      p_user_agent: request.headers.get('user-agent'),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Error en update-password', { error: String(error) })
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
