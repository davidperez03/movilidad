import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { capitalizeName } from '@/lib/utils/capitalize'
import { logger } from '@/lib/logger'
import { signUpLimiter } from '@/lib/rate-limit'

const schema = z.object({
  email: z.string().email(),
  nombreCompleto: z.string().min(3).max(100),
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
  const { allowed, retryAfter } = signUpLimiter.check(ip)
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
      return NextResponse.json({ error: 'Email y nombre son requeridos' }, { status: 400 })
    }

    const { email, nombreCompleto } = parsed.data

    const supabase = createAdminClient()

    // admin.createUser no envía emails de verificación, a diferencia de auth.signUp.
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: crypto.randomUUID() + 'A1!',
      email_confirm: false,
      user_metadata: {
        nombre_completo: capitalizeName(nombreCompleto),
        rol_global: 'usuario',
        pendiente_aprobacion: true,
      },
    })

    if (error) {
      // Respuesta idéntica si el email ya existe: no revelar si está registrado.
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return NextResponse.json({ ok: true })
      }
      logger.error('Error en sign-up', { error: error.message })
      return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
    }

    if (data.user) {
      await supabase
        .from('perfiles')
        .update({ activo: false })
        .eq('id', data.user.id)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Error en sign-up', { error: String(error) })
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
