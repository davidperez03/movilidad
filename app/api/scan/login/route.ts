import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { signScanToken, SCAN_COOKIE } from '@/lib/scan/jwt'
import { logger } from '@/lib/logger'

const schema = z.object({
  documento_numero: z.string().min(1),
  pin:              z.string().length(4).regex(/^\d{4}$/),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const { documento_numero, pin } = parsed.data
    const supabase = createAdminClient()

    const { data: perfil, error } = await supabase
      .from('perfiles')
      .select('id, nombre_completo, url_avatar, activo')
      .eq('documento_numero', documento_numero)
      .single()

    if (error || !perfil) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 401 })
    }

    if (!perfil.activo) {
      return NextResponse.json({ error: 'Usuario inactivo' }, { status: 403 })
    }

    const { data: emp } = await supabase
      .from('asist_datos_empleado')
      .select('pin_hash')
      .eq('perfil_id', perfil.id)
      .single()

    if (!emp) {
      return NextResponse.json({ error: 'Sin acceso al sistema de asistencia' }, { status: 403 })
    }

    const valido = await compare(pin, emp.pin_hash)
    if (!valido) {
      return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 })
    }

    const token = await signScanToken({
      usuarioId: perfil.id,
      nombre:    perfil.nombre_completo ?? documento_numero,
      avatar:    perfil.url_avatar,
    })

    const res = NextResponse.json({ ok: true })
    res.cookies.set(SCAN_COOKIE, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path:     '/',
      maxAge:   (12 * 60 + 15) * 60,
    })
    return res
  } catch (err) {
    logger.error('scan/login', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
