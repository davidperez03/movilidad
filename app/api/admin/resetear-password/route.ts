import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/api/require-superadmin'
import { generatePassword } from '@/lib/utils/generate-password'
import { sendEmail } from '@/lib/email/send-email'
import { resetPasswordTemplate } from '@/lib/email/templates'
import { logger } from '@/lib/logger'
import { getClientIp } from '@/lib/utils/get-client-ip'

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
    const supabaseAdmin = createAdminClient()

    const { data: { user: targetUser }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (getUserError || !targetUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const tempPassword = generatePassword()

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: tempPassword,
      user_metadata: {
        ...targetUser.user_metadata,
        debe_cambiar_password: true,
      },
    })

    if (updateError) {
      logger.error('Error restableciendo contraseña', { error: updateError.message, userId })
      return NextResponse.json({ error: 'Error al restablecer la contraseña' }, { status: 400 })
    }

    // Registrar reseteo de contraseña por admin
    const supabase = await createClient()
    await supabase.rpc('registrar_auditoria_sistema', {
      p_accion: 'password_reseteado',
      p_entidad_tipo: 'usuario',
      p_entidad_id: userId,
      p_detalles: {
        correo: targetUser.email,
        nombre_completo: targetUser.user_metadata?.nombre_completo,
        razon: 'Restablecido por administrador',
      },
      p_ip_address: getClientIp(request),
      p_user_agent: request.headers.get('user-agent'),
    })

    const nombre = targetUser.user_metadata?.nombre_completo || 'Usuario'
    const email = targetUser.email || ''

    const emailSent = await sendEmail({
      to: email,
      subject: 'Contraseña restablecida – Movilidad',
      html: resetPasswordTemplate(nombre, email, tempPassword),
    })

    return NextResponse.json({
      success: true,
      emailSent,
      message: emailSent
        ? 'Contraseña restablecida y email enviado'
        : 'Contraseña restablecida. No se pudo enviar el email (verificar config SMTP)',
    })
  } catch (error) {
    logger.error('Error en resetear-password', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
