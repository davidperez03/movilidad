import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdmin } from '@/lib/api/require-superadmin'
import { generatePassword } from '@/lib/utils/generate-password'
import { sendEmail } from '@/lib/email/send-email'
import { cuentaAprobadaTemplate } from '@/lib/email/templates'
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
    const supabaseAdmin = createAdminClient()

    const { data: { user: targetUser }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (getUserError || !targetUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const tempPassword = generatePassword()

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true,
      password: tempPassword,
      user_metadata: {
        ...targetUser.user_metadata,
        debe_cambiar_password: true,
        pendiente_aprobacion: false,
      },
    })

    if (updateError) {
      logger.error('Error aprobando usuario', { error: updateError.message, userId })
      return NextResponse.json({ error: 'Error al aprobar el usuario' }, { status: 400 })
    }

    await supabaseAdmin
      .from('perfiles')
      .update({ activo: true })
      .eq('id', userId)

    const nombre = targetUser.user_metadata?.nombre_completo || 'Usuario'
    const email = targetUser.email || ''

    const emailSent = await sendEmail({
      to: email,
      subject: 'Cuenta aprobada – Movilidad',
      html: cuentaAprobadaTemplate(nombre, email, tempPassword),
    })

    return NextResponse.json({
      success: true,
      emailSent,
      message: emailSent
        ? 'Usuario aprobado y email enviado'
        : 'Usuario aprobado. No se pudo enviar el email (verificar config SMTP)',
    })
  } catch (error) {
    logger.error('Error en aprobar-usuario', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
