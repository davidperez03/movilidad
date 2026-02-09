import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { capitalizeName } from '@/lib/utils/capitalize'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const { email, nombreCompleto } = await request.json()

    if (!email || !nombreCompleto) {
      return NextResponse.json({ error: 'Email y nombre son requeridos' }, { status: 400 })
    }

    if (nombreCompleto.trim().length < 3) {
      return NextResponse.json({ error: 'El nombre debe tener al menos 3 caracteres' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // admin.createUser NO envía emails de verificación (a diferencia de auth.signUp)
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
      // No revelar si el email ya existe (seguridad)
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return NextResponse.json({ ok: true })
      }
      logger.error('Error en sign-up', { error: error.message })
      return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
    }

    // Asegurar que el perfil quede inactivo
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
