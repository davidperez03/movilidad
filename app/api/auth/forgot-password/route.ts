import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send-email'
import { recuperarPasswordTemplate } from '@/lib/email/templates'
import { logger } from '@/lib/logger'
import { forgotPasswordLimiter, forgotPasswordEmailLimiter } from '@/lib/rate-limit'

const schema = z.object({
  email: z.string().email(),
})

function getClientIp(request: Request): string {
  // Orden de prioridad: Vercel (no falseable) > nginx > x-forwarded-for (falseable sin proxy validado)
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
  const ipCheck = forgotPasswordLimiter.check(ip)
  if (!ipCheck.allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta mas tarde.' },
      { status: 429, headers: { 'Retry-After': String(ipCheck.retryAfter) } }
    )
  }

  try {
    const body = await request.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const { email } = parsed.data

    // Segundo bucket por email: previene spam focalizado con rotación de IP.
    const emailCheck = forgotPasswordEmailLimiter.check(email.toLowerCase())
    if (!emailCheck.allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta mas tarde.' },
        { status: 429, headers: { 'Retry-After': String(emailCheck.retryAfter) } }
      )
    }

    const supabase = createAdminClient()

    // generateLink genera el token SIN enviar email (a diferencia de auth.sendPasswordResetEmail).
    const { data, error } = await supabase.auth.admin.generateLink({ type: 'recovery', email })

    if (error) {
      if (error.message.includes('User not found')) {
        return NextResponse.json({ ok: true }) // No revelar si el email existe
      }
      logger.error('Error generando enlace de recuperación', { error: error.message })
      return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
    }

    const tokenHash = data.properties.hashed_token

    // URL base solo desde env vars — nunca del header Host (previene host header injection).
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : null)

    if (!siteUrl) {
      logger.error('NEXT_PUBLIC_SITE_URL no configurado')
      return NextResponse.json({ error: 'Error de configuracion del servidor' }, { status: 500 })
    }

    const resetUrl = `${siteUrl}/auth/reset-password?token_hash=${encodeURIComponent(tokenHash)}&type=recovery`

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
