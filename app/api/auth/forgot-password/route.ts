import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send-email'
import { recuperarPasswordTemplate } from '@/lib/email/templates'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // generateLink genera el token de recuperación SIN enviar email.
    // Ref: https://supabase.com/docs/reference/javascript/auth-admin-generate-link
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
    })

    if (error) {
      // No revelar si el email existe o no (seguridad)
      if (error.message.includes('User not found')) {
        return NextResponse.json({ ok: true })
      }
      logger.error('Error generando enlace de recuperación', { error: error.message })
      return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
    }

    const tokenHash = data.properties.hashed_token

    // Derivar URL base: variable de entorno > header Host del request
    const host = request.headers.get('host') || ''
    const protocol = host.startsWith('localhost') ? 'http' : 'https'
    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
      || `${protocol}://${host}`
    ).replace(/\/+$/, '') // quitar trailing slashes

    const resetUrl = `${siteUrl}/auth/reset-password?token_hash=${tokenHash}&type=recovery`

    // Obtener nombre del perfil
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('nombre')
      .eq('id', data.user.id)
      .single()

    const nombre = perfil?.nombre || 'Usuario'

    const sent = await sendEmail({
      to: email,
      subject: 'Recuperacion de contraseña - Movilidad',
      html: recuperarPasswordTemplate(nombre, resetUrl),
    })

    if (!sent) {
      logger.error('Error enviando email de recuperación', { to: email })
      return NextResponse.json({ error: 'No se pudo enviar el correo' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Error en forgot-password', { error: String(error) })
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
