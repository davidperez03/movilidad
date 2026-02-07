import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdmin } from '@/lib/api/require-superadmin'
import { generatePassword } from '@/lib/utils/generate-password'
import { sendEmail } from '@/lib/email/send-email'
import { resetPasswordTemplate } from '@/lib/email/templates'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin()
    if (auth.response) return auth.response

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
    }

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
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

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
